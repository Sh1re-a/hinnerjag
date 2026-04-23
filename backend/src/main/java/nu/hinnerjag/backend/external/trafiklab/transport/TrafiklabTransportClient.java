package nu.hinnerjag.backend.external.trafiklab.transport;

import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportStopPointFullDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class TrafiklabTransportClient {

    private static final String BASE_URL = "https://transport.integration.sl.se/v1";
    private final RestClient restClient = RestClient.create();

    public TransportDeparturesResponse fetchDeparturesBySiteId(Integer siteId) {
        String url = BASE_URL + "/sites/" + siteId + "/departures";

        return restClient.get()
                .uri(url)
                .retrieve()
                .body(TransportDeparturesResponse.class);
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
        String url = BASE_URL + "/sites?expand=true";

        return restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<List<TransportSiteDto>>() {});
    }

    public List<TransportStopPointFullDto> fetchStopPoints() {

        String url = BASE_URL + "/stop-points";

        return restClient.get()

                .uri(url)

                .retrieve()

                .body(new ParameterizedTypeReference<List<TransportStopPointFullDto>>() {});

    }
}