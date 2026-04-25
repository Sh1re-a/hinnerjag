package nu.hinnerjag.backend.external.trafiklab.transport;

import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportStopPointFullDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TrafiklabTransportClient {

    private static final String BASE_URL = "https://transport.integration.sl.se/v1";

    private static final Duration SITES_TTL = Duration.ofHours(12);
    private static final Duration STOP_POINTS_TTL = Duration.ofHours(12);
    private static final Duration DEPARTURES_TTL = Duration.ofSeconds(10);

    private final RestClient restClient = RestClient.create();

    private List<TransportSiteDto> cachedSites;
    private Instant cachedSitesAt;

    private List<TransportStopPointFullDto> cachedStopPoints;
    private Instant cachedStopPointsAt;

    private final Map<Integer, CachedDepartures> cachedDeparturesBySiteId = new ConcurrentHashMap<>();

    public TransportDeparturesResponse fetchDeparturesBySiteId(Integer siteId) {
        CachedDepartures cached = cachedDeparturesBySiteId.get(siteId);

        if (cached != null && !isExpired(cached.cachedAt(), DEPARTURES_TTL)) {
            return cached.response();
        }

        String url = BASE_URL + "/sites/" + siteId + "/departures";

        TransportDeparturesResponse response = restClient.get()
                .uri(url)
                .retrieve()
                .body(TransportDeparturesResponse.class);

        cachedDeparturesBySiteId.put(siteId, new CachedDepartures(response, Instant.now()));

        return response;
    }

    public TransportDeparturesResponse fetchDeparturesBySiteIdSafely(Integer siteId) {
        try {
            return fetchDeparturesBySiteId(siteId);
        } catch (RestClientException exception) {
            System.out.println("Skipping site " + siteId + " because departures lookup failed.");
            return null;
        }
    }

    public List<TransportSiteDto> fetchSites() {
        if (cachedSites != null && !isExpired(cachedSitesAt, SITES_TTL)) {
            return cachedSites;
        }

        String url = BASE_URL + "/sites?expand=true";

        List<TransportSiteDto> response = restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<List<TransportSiteDto>>() {});

        cachedSites = response;
        cachedSitesAt = Instant.now();

        return response;
    }

    public List<TransportStopPointFullDto> fetchStopPoints() {
        if (cachedStopPoints != null && !isExpired(cachedStopPointsAt, STOP_POINTS_TTL)) {
            return cachedStopPoints;
        }

        String url = BASE_URL + "/stop-points";

        List<TransportStopPointFullDto> response = restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<List<TransportStopPointFullDto>>() {});

        cachedStopPoints = response;
        cachedStopPointsAt = Instant.now();

        return response;
    }

    private boolean isExpired(Instant cachedAt, Duration ttl) {
        if (cachedAt == null) {
            return true;
        }

        return cachedAt.plus(ttl).isBefore(Instant.now());
    }

    private record CachedDepartures(
            TransportDeparturesResponse response,
            Instant cachedAt
    ) {
    }
}