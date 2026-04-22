package nu.hinnerjag.backend.external.trafiklab.transport;

import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

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
}