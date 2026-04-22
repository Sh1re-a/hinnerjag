package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.TrafiklabJourneyClient;
import nu.hinnerjag.backend.external.trafiklab.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.dto.JourneyPlannerResponse;
import nu.hinnerjag.backend.external.trafiklab.dto.LegDto;
import nu.hinnerjag.backend.external.trafiklab.dto.TransportationDto;
import nu.hinnerjag.backend.planning.dto.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanningService {

    private final TrafiklabJourneyClient trafiklabJourneyClient;
    private final JourneySelectionService journeySelectionService;
    private final PlanningFieldExtractor fieldExtractor;
    private final JourneySegmentService journeySegmentService;
    private final JourneyStopService journeyStopService;

    public PlanningService(
            TrafiklabJourneyClient trafiklabJourneyClient,
            JourneySelectionService journeySelectionService,
            PlanningFieldExtractor fieldExtractor,
            JourneySegmentService journeySegmentService, JourneyStopService journeyStopService
    ) {
        this.trafiklabJourneyClient = trafiklabJourneyClient;
        this.journeySelectionService = journeySelectionService;
        this.fieldExtractor = fieldExtractor;
        this.journeySegmentService = journeySegmentService;
        this.journeyStopService = journeyStopService;
    }

    public TripSummaryResponse getTestTrip() {
        JourneyPlannerResponse response = trafiklabJourneyClient.fetchTestTrip();
        JourneyDto firstJourney = journeySelectionService.extractFirstJourney(response);
        LegDto firstTransitLeg = journeySelectionService.findFirstTransitLeg(firstJourney);

        TripRouteResponse route = buildRoute(firstTransitLeg);
        TripInsightResponse insights = buildInsights(firstTransitLeg);
        List<JourneySegmentResponse> segments = journeySegmentService.buildSegments(firstJourney);
        Integer walkingDurationMinutes = journeySegmentService.calculateWalkingDurationMinutes(firstJourney);
        List<JourneyStopResponse> stops = journeyStopService.buildStops(firstTransitLeg);

        return new TripSummaryResponse(
                fieldExtractor.secondsToMinutes(firstJourney.tripDuration()),
                fieldExtractor.secondsToMinutes(firstJourney.tripRtDuration()),
                walkingDurationMinutes,
                firstJourney.interchanges(),
                route,
                insights,
                segments,
                stops
        );
    }

    private TripRouteResponse buildRoute(LegDto transitLeg) {
        TransportationDto transportation = transitLeg.transportation();

        return new TripRouteResponse(
                fieldExtractor.extractDepartureTime(transitLeg),
                fieldExtractor.extractArrivalTime(transitLeg),
                fieldExtractor.extractMode(transportation),
                fieldExtractor.extractLine(transportation),
                fieldExtractor.extractDirection(transportation),
                fieldExtractor.extractPlaceName(transitLeg.origin()),
                fieldExtractor.extractPlaceName(transitLeg.destination()),
                fieldExtractor.extractPlatform(transitLeg.origin())
        );
    }

    private TripInsightResponse buildInsights(LegDto transitLeg) {
        return new TripInsightResponse(
                transitLeg.isRealtimeControlled(),
                fieldExtractor.extractOccupancy(transitLeg.origin()),
                fieldExtractor.extractAlerts(transitLeg)
        );
    }
}