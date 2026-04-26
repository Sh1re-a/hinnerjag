package nu.hinnerjag.backend.external.trafiklab.transport;

import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportStopPointFullDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Component
public class TrafiklabTransportClient {

    private static final Duration SITES_TTL = Duration.ofHours(12);
    private static final Duration STOP_POINTS_TTL = Duration.ofHours(12);
    private static final Duration DEPARTURES_TTL = Duration.ofSeconds(30);

    private final String baseUrl;
    private final int retries;
    private final long retryBackoffMs;
    private final RestClient restClient;

    private volatile List<TransportSiteDto> cachedSites;
    private volatile Instant cachedSitesAt;

    private volatile List<TransportStopPointFullDto> cachedStopPoints;
    private volatile Instant cachedStopPointsAt;

    private final Map<DeparturesCacheKey, CachedDepartures> cachedDeparturesByKey = new ConcurrentHashMap<>();

    public TrafiklabTransportClient(
            @Value("${app.trafiklab.base-url}") String baseUrl,
            @Value("${app.trafiklab.retries:0}") int retries,
            @Value("${app.trafiklab.retry-backoff-ms:0}") long retryBackoffMs
    ) {
        this.baseUrl = baseUrl;
        this.retries = Math.max(0, retries);
        this.retryBackoffMs = Math.max(0, retryBackoffMs);
        this.restClient = RestClient.builder()
                .defaultHeader("Accept-Encoding", "gzip")
                .build();
    }

    public TransportDeparturesResponse fetchDeparturesBySiteId(Integer siteId) {
        return fetchDeparturesBySiteId(siteId, null, null);
    }

    public TransportDeparturesResponse fetchDeparturesBySiteId(Integer siteId, String transportMode) {
        return fetchDeparturesBySiteId(siteId, transportMode, null);
    }

    public TransportDeparturesResponse fetchDeparturesBySiteId(
            Integer siteId,
            String transportMode,
            Integer forecastMinutes
    ) {
        DeparturesCacheKey cacheKey = new DeparturesCacheKey(siteId, transportMode, forecastMinutes);
        CachedDepartures cached = cachedDeparturesByKey.get(cacheKey);

        if (cached != null && !isExpired(cached.cachedAt(), DEPARTURES_TTL)) {
            return cached.response();
        }

        try {
            String url = buildDeparturesUrl(siteId, transportMode, forecastMinutes);

            TransportDeparturesResponse response = fetchWithRetry(() -> restClient.get()
                .uri(url)
                .retrieve()
                .body(TransportDeparturesResponse.class));

            cachedDeparturesByKey.put(cacheKey, new CachedDepartures(response, Instant.now()));
            return response;
        } catch (RestClientException exception) {
            if (cached != null) {
                System.out.println("Using stale cached departures for site " + siteId);
                return cached.response();
            }

            throw exception;
        }
    }

    public TransportDeparturesResponse fetchDeparturesBySiteIdSafely(Integer siteId) {
        return fetchDeparturesBySiteIdSafely(siteId, null, null);
    }

    public TransportDeparturesResponse fetchDeparturesBySiteIdSafely(Integer siteId, String transportMode) {
        return fetchDeparturesBySiteIdSafely(siteId, transportMode, null);
    }

    public TransportDeparturesResponse fetchDeparturesBySiteIdSafely(
            Integer siteId,
            String transportMode,
            Integer forecastMinutes
    ) {
        try {
            return fetchDeparturesBySiteId(siteId, transportMode, forecastMinutes);
        } catch (RestClientException exception) {
            System.out.println("Skipping site " + siteId + " because departures lookup failed.");
            return null;
        }
    }

    public List<TransportSiteDto> fetchSites() {
        if (cachedSites != null && !isExpired(cachedSitesAt, SITES_TTL)) {
            return cachedSites;
        }

        synchronized (this) {
            if (cachedSites != null && !isExpired(cachedSitesAt, SITES_TTL)) {
                return cachedSites;
            }

            try {
                String url = baseUrl + "/sites";

                List<TransportSiteDto> response = fetchWithRetry(() -> restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<TransportSiteDto>>() {}));

                cachedSites = response;
                cachedSitesAt = Instant.now();

                return response;
            } catch (RestClientException exception) {
                if (cachedSites != null) {
                    System.out.println("Using stale cached sites because refresh failed.");
                    return cachedSites;
                }

                throw exception;
            }
        }
    }

    public List<TransportSiteDto> fetchSitesSafely() {
        try {
            return fetchSites();
        } catch (RestClientException exception) {
            System.out.println("Skipping sites lookup because SL sites request failed.");
            return List.of();
        }
    }

    public List<TransportStopPointFullDto> fetchStopPoints() {
        if (cachedStopPoints != null && !isExpired(cachedStopPointsAt, STOP_POINTS_TTL)) {
            return cachedStopPoints;
        }

        synchronized (this) {
            if (cachedStopPoints != null && !isExpired(cachedStopPointsAt, STOP_POINTS_TTL)) {
                return cachedStopPoints;
            }

            try {
                String url = baseUrl + "/stop-points";

                List<TransportStopPointFullDto> response = fetchWithRetry(() -> restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<TransportStopPointFullDto>>() {}));

                cachedStopPoints = response;
                cachedStopPointsAt = Instant.now();

                return response;
            } catch (RestClientException exception) {
                if (cachedStopPoints != null) {
                    System.out.println("Using stale cached stop points because refresh failed.");
                    return cachedStopPoints;
                }

                throw exception;
            }
        }
    }

    public List<TransportStopPointFullDto> fetchStopPointsSafely() {
        try {
            return fetchStopPoints();
        } catch (RestClientException exception) {
            System.out.println("Skipping stop points lookup because SL stop points request failed.");
            return List.of();
        }
    }

    private boolean isExpired(Instant cachedAt, Duration ttl) {
        if (cachedAt == null) {
            return true;
        }

        return cachedAt.plus(ttl).isBefore(Instant.now());
    }

    private String buildDeparturesUrl(Integer siteId, String transportMode, Integer forecastMinutes) {
        StringBuilder url = new StringBuilder(baseUrl)
                .append("/sites/")
                .append(siteId)
                .append("/departures");

        StringJoiner query = new StringJoiner("&");

        if (transportMode != null && !transportMode.isBlank()) {
            query.add("transport=" + transportMode);
        }

        if (forecastMinutes != null) {
            query.add("forecast=" + forecastMinutes);
        }

        String queryString = query.toString();
        if (!queryString.isEmpty()) {
            url.append("?").append(queryString);
        }

        return url.toString();
    }

    private <T> T fetchWithRetry(Supplier<T> request) {
        RestClientException lastException = null;

        for (int attempt = 0; attempt <= retries; attempt++) {
            try {
                return request.get();
            } catch (RestClientException exception) {
                lastException = exception;

                if (attempt == retries) {
                    break;
                }

                pauseBeforeRetry();
            }
        }

        throw lastException;
    }

    private void pauseBeforeRetry() {
        if (retryBackoffMs <= 0) {
            return;
        }

        try {
            Thread.sleep(retryBackoffMs);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Retry sleep interrupted", exception);
        }
    }

    private record CachedDepartures(
            TransportDeparturesResponse response,
            Instant cachedAt
    ) {
    }

    private record DeparturesCacheKey(
            Integer siteId,
            String transportMode,
            Integer forecastMinutes
    ) {
    }
}