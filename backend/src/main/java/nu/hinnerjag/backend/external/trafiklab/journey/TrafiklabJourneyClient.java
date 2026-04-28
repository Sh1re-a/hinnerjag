package nu.hinnerjag.backend.external.trafiklab.journey;

import nu.hinnerjag.backend.external.trafiklab.journey.dto.JourneyPlannerResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class TrafiklabJourneyClient {

    private final RestClient restClient = RestClient.create();

    public JourneyPlannerResponse fetchJourneyByUrl(String url) {
        return restClient.get()
                .uri(url)
                .retrieve()
                .body(JourneyPlannerResponse.class);
    }
}
