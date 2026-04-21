package nu.hinnerjag.backend.planning;

import nu.hinnerjag.backend.external.trafiklab.TrafiklabJourneyClient;
import org.springframework.stereotype.Service;

@Service
public class PlanningService {

    private final TrafiklabJourneyClient trafiklabJourneyClient;

    public PlanningService(TrafiklabJourneyClient trafiklabJourneyClient) {
        this.trafiklabJourneyClient = trafiklabJourneyClient;
    }

    public String getTestTrip() {
        return trafiklabJourneyClient.fetchTestTrip();
    }
}