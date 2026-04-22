package nu.hinnerjag.backend.planning;

import nu.hinnerjag.backend.external.trafiklab.TrafiklabJourneyClient;
import nu.hinnerjag.backend.external.trafiklab.dto.InfoDto;
import nu.hinnerjag.backend.external.trafiklab.dto.InfoLinkDto;
import nu.hinnerjag.backend.external.trafiklab.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.dto.JourneyPlannerResponse;
import nu.hinnerjag.backend.external.trafiklab.dto.LegDto;
import nu.hinnerjag.backend.external.trafiklab.dto.PlaceDto;
import nu.hinnerjag.backend.external.trafiklab.dto.TransportationDto;
import nu.hinnerjag.backend.planning.dto.JourneySegmentResponse;
import nu.hinnerjag.backend.planning.dto.TripInsightResponse;
import nu.hinnerjag.backend.planning.dto.TripRouteResponse;
import nu.hinnerjag.backend.planning.dto.TripSummaryResponse;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PlanningService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final String FOOTPATH_MODE = "footpath";
    private static final String DEFAULT_DIRECTION = "Unknown";

    private final TrafiklabJourneyClient trafiklabJourneyClient;

    public PlanningService(TrafiklabJourneyClient trafiklabJourneyClient) {
        this.trafiklabJourneyClient = trafiklabJourneyClient;
    }

    public TripSummaryResponse getTestTrip() {
        JourneyPlannerResponse response = trafiklabJourneyClient.fetchTestTrip();
        JourneyDto firstJourney = extractFirstJourney(response);
        LegDto firstTransitLeg = findFirstTransitLeg(firstJourney);

        TripRouteResponse route = buildRoute(firstTransitLeg);
        TripInsightResponse insights = buildInsights(firstTransitLeg);
        List<JourneySegmentResponse> segments = buildSegments(firstJourney);
        Integer walkingDurationMinutes = calculateWalkingDurationMinutes(firstJourney);

        return buildTripSummary(firstJourney, walkingDurationMinutes, route, insights, segments);
    }

    private JourneyDto extractFirstJourney(JourneyPlannerResponse response) {
        if (response == null || response.journeys() == null || response.journeys().isEmpty()) {
            throw new IllegalStateException("No journeys returned from Trafiklab");
        }

        JourneyDto firstJourney = response.journeys().get(0);

        if (firstJourney.legs() == null || firstJourney.legs().isEmpty()) {
            throw new IllegalStateException("No legs returned from Trafiklab");
        }

        return firstJourney;
    }

    private LegDto findFirstTransitLeg(JourneyDto journey) {
        for (LegDto leg : journey.legs()) {
            if (!isTransitLeg(leg)) {
                continue;
            }
            return leg;
        }

        return journey.legs().get(0);
    }

    private boolean isTransitLeg(LegDto leg) {
        if (leg == null || leg.transportation() == null || leg.transportation().product() == null) {
            return false;
        }

        String mode = leg.transportation().product().name();
        return mode != null && !mode.equalsIgnoreCase(FOOTPATH_MODE);
    }

    private TripRouteResponse buildRoute(LegDto transitLeg) {
        TransportationDto transportation = transitLeg.transportation();

        return new TripRouteResponse(
                formatTime(getDepartureTime(transitLeg)),
                formatTime(getArrivalTime(transitLeg)),
                extractMode(transportation),
                extractLine(transportation),
                extractDirection(transportation),
                extractPlaceName(transitLeg.origin()),
                extractPlaceName(transitLeg.destination()),
                extractPlatform(transitLeg.origin())
        );
    }

    private TripInsightResponse buildInsights(LegDto transitLeg) {
        return new TripInsightResponse(
                transitLeg.isRealtimeControlled(),
                extractOccupancy(transitLeg.origin()),
                extractAlerts(transitLeg)
        );
    }

    private TripSummaryResponse buildTripSummary(
            JourneyDto journey,
            Integer walkingDurationMinutes,
            TripRouteResponse route,
            TripInsightResponse insights,
            List<JourneySegmentResponse> segments
    ) {
        return new TripSummaryResponse(
                secondsToMinutes(journey.tripDuration()),
                secondsToMinutes(journey.tripRtDuration()),
                walkingDurationMinutes,
                journey.interchanges(),
                route,
                insights,
                segments
        );
    }

    private String getDepartureTime(LegDto leg) {
        return leg.origin() != null ? leg.origin().departureTimeEstimated() : null;
    }

    private String getArrivalTime(LegDto leg) {
        return leg.destination() != null ? leg.destination().arrivalTimeEstimated() : null;
    }

    private String extractMode(TransportationDto transportation) {
        if (transportation == null || transportation.product() == null) {
            return null;
        }
        return transportation.product().name();
    }

    private String extractLine(TransportationDto transportation) {
        if (transportation == null) {
            return null;
        }
        return transportation.disassembledName();
    }

    private String extractDirection(TransportationDto transportation) {
        if (transportation == null || transportation.destination() == null) {
            return DEFAULT_DIRECTION;
        }
        return transportation.destination().name();
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

    private String cleanStopName(String rawName) {
        if (rawName == null) {
            return null;
        }
        return rawName.replace(", Stockholm", "").trim();
    }

    private String extractPlaceName(PlaceDto place) {
        if (place == null) {
            return null;
        }

        if (place.parent() != null && place.parent().name() != null && !place.parent().name().isBlank()) {
            return cleanStopName(place.parent().name());
        }

        return cleanStopName(place.name());
    }

    private String extractPlatform(PlaceDto place) {
        if (place == null || place.properties() == null) {
            return null;
        }

        String platform = place.properties().get("platformName");
        if (platform == null || platform.isBlank()) {
            platform = place.properties().get("platform");
        }

        return platform;
    }

    private String extractOccupancy(PlaceDto place) {
        if (place == null || place.properties() == null) {
            return null;
        }
        return place.properties().get("occupancy");
    }

    private List<String> extractAlerts(LegDto leg) {
        List<String> alerts = new ArrayList<>();

        if (leg == null || leg.infos() == null) {
            return alerts;
        }

        for (InfoDto info : leg.infos()) {
            if (info == null || info.infoLinks() == null) {
                continue;
            }

            for (InfoLinkDto link : info.infoLinks()) {
                if (link != null && link.title() != null && !link.title().isBlank()) {
                    alerts.add(link.title());
                }
            }
        }

        return alerts;
    }

    private List<JourneySegmentResponse> buildSegments(JourneyDto journey) {
        List<JourneySegmentResponse> segments = new ArrayList<>();

        if (journey == null || journey.legs() == null) {
            return segments;
        }

        for (LegDto leg : journey.legs()) {
            if (isTransitLeg(leg)) {
                segments.add(buildTransitSegment(leg));
            } else {
                segments.add(buildWalkSegment(leg));
            }
        }

        return segments;
    }

    private JourneySegmentResponse buildTransitSegment(LegDto leg) {
        TransportationDto transportation = leg.transportation();

        return new JourneySegmentResponse(
                "TRANSIT",
                extractPlaceName(leg.origin()),
                extractPlaceName(leg.destination()),
                secondsToMinutes(leg.duration()),
                extractMode(transportation),
                extractLine(transportation),
                extractDirection(transportation),
                extractPlatform(leg.origin())
        );
    }

    private JourneySegmentResponse buildWalkSegment(LegDto leg) {
        return new JourneySegmentResponse(
                "WALK",
                extractPlaceName(leg.origin()),
                extractPlaceName(leg.destination()),
                secondsToMinutes(leg.duration()),
                "Walk",
                null,
                null,
                null
        );
    }

    private Integer calculateWalkingDurationMinutes(JourneyDto journey) {
        if (journey == null || journey.legs() == null) {
            return 0;
        }

        int totalWalkingSeconds = 0;

        for (LegDto leg : journey.legs()) {
            if (!isTransitLeg(leg) && leg.duration() != null) {
                totalWalkingSeconds += leg.duration();
            }
        }

        return totalWalkingSeconds / 60;
    }
}