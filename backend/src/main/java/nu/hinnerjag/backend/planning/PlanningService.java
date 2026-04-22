package nu.hinnerjag.backend.planning;

import nu.hinnerjag.backend.external.trafiklab.TrafiklabJourneyClient;
import nu.hinnerjag.backend.external.trafiklab.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.dto.JourneyPlannerResponse;
import nu.hinnerjag.backend.external.trafiklab.dto.LegDto;
import nu.hinnerjag.backend.external.trafiklab.dto.TransportationDto;
import nu.hinnerjag.backend.planning.dto.TripRouteResponse;
import nu.hinnerjag.backend.planning.dto.TripSummaryResponse;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PlanningService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

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

        if (firstJourney.legs() == null || firstJourney.legs().isEmpty()) {
            throw new IllegalStateException("No legs returned from Trafiklab");
        }

        LegDto firstLeg = firstJourney.legs().get(0);
        TransportationDto transportation = firstLeg.transportation();

        TripRouteResponse route = new TripRouteResponse(
                formatTime(firstLeg.origin() != null ? firstLeg.origin().departureTimeEstimated() : null),
                formatTime(firstLeg.destination() != null ? firstLeg.destination().arrivalTimeEstimated() : null),
                transportation != null && transportation.product() != null ? transportation.product().name() : null,
                transportation != null ? transportation.disassembledName() : null,
                transportation != null && transportation.destination() != null ? transportation.destination().name() : "Unknown"
        );

        return new TripSummaryResponse(
                secondsToMinutes(firstJourney.tripDuration()),
                secondsToMinutes(firstJourney.tripRtDuration()),
                firstJourney.interchanges(),
                route
        );
    }

    private Integer secondsToMinutes(Integer seconds) {
        if (seconds == null) {
            return null;
        }
        return seconds / 60;
    }

    private String formatTime(String isoDateTime) {
        if (isoDateTime == null || isoDateTime.isBlank()) {
            return null;
        }
        return OffsetDateTime.parse(isoDateTime).format(TIME_FORMATTER);
    }
}