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

        LegDto firstTransitLeg = findFirstTransitLeg(firstJourney);

        TransportationDto transportation = firstTransitLeg.transportation();

        TripRouteResponse route = new TripRouteResponse(
                formatTime(firstTransitLeg.origin() != null ? firstTransitLeg.origin().departureTimeEstimated() : null),
                formatTime(firstTransitLeg.destination() != null ? firstTransitLeg.destination().arrivalTimeEstimated() : null),
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

    private LegDto findFirstTransitLeg(JourneyDto journey) {
        for (LegDto leg : journey.legs()) {
            if (leg.transportation() == null) {
                continue;
            }

            if (leg.transportation().product() == null) {
                continue;
            }

            String mode = leg.transportation().product().name();
            if (mode != null && !mode.equalsIgnoreCase("footpath")) {
                return leg;
            }
        }

        return journey.legs().get(0);
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