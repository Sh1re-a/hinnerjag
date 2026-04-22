package nu.hinnerjag.backend.planning;

import nu.hinnerjag.backend.external.trafiklab.TrafiklabJourneyClient;
import nu.hinnerjag.backend.external.trafiklab.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.dto.JourneyPlannerResponse;
import nu.hinnerjag.backend.planning.dto.TripSummaryResponse;
import org.springframework.stereotype.Service;

@Service
public class PlanningService {

    private final TrafiklabJourneyClient trafiklabJourneyClient;

    public PlanningService(TrafiklabJourneyClient trafiklabJourneyClient) {
        this.trafiklabJourneyClient = trafiklabJourneyClient;
    }

    public TripSummaryResponse getTestTrip() {
        JourneyPlannerResponse response = trafiklabJourneyClient.fetchTestTrip();

        if (response == null || response.journeys() == null || response.journeys().isEmpty()) {
            throw new IllegalStateException("No journeys returned from Trafiklab");
        }

        JourneyDto firstJourney = response.journeys().get(0);

        return new TripSummaryResponse(
                secondsToMinutes(firstJourney.tripDuration()),
                secondsToMinutes(firstJourney.tripRtDuration()),
                firstJourney.interchanges()
        );
    }

    private Integer secondsToMinutes(Integer seconds) {
        if (seconds == null) {
            return null;
        }
        return seconds / 60;
    }
}