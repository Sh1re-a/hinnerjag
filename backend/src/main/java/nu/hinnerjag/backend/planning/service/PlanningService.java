package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.journey.TrafiklabJourneyClient;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.JourneyPlannerResponse;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.LegDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.TransportationDto;
import nu.hinnerjag.backend.planning.dto.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PlanningService {

    private final TrafiklabJourneyClient trafiklabJourneyClient;
    private final JourneySelectionService journeySelectionService;
    private final PlanningFieldExtractor fieldExtractor;
    private final JourneySegmentService journeySegmentService;
    private final JourneyStopService journeyStopService;
    private final JourneyMapLineCreatorService journeyMapLineCreatorService;
    private final JourneyRequestMapper journeyRequestMapper;
    private final JourneyTimingService journeyTimingService;

    public PlanningService(
            TrafiklabJourneyClient trafiklabJourneyClient,
            JourneySelectionService journeySelectionService,
            PlanningFieldExtractor fieldExtractor,
            JourneySegmentService journeySegmentService,
            JourneyStopService journeyStopService,
            JourneyMapLineCreatorService journeyMapLineCreatorService,
            JourneyRequestMapper journeyRequestMapper, JourneyTimingService journeyTimingService
    ) {
        this.trafiklabJourneyClient = trafiklabJourneyClient;
        this.journeySelectionService = journeySelectionService;
        this.fieldExtractor = fieldExtractor;
        this.journeySegmentService = journeySegmentService;
        this.journeyStopService = journeyStopService;
        this.journeyMapLineCreatorService = journeyMapLineCreatorService;
        this.journeyRequestMapper = journeyRequestMapper;
        this.journeyTimingService = journeyTimingService;
    }

    public TripSummaryResponse planJourney(JourneyPlanRequest request) {
        String url = journeyRequestMapper.buildTripsUrl(request);
        JourneyPlannerResponse response = trafiklabJourneyClient.fetchJourneyByUrl(url);
        return buildTripSummaryFromResponse(response);
    }

    private TripSummaryResponse buildTripSummaryFromResponse(JourneyPlannerResponse response) {
        JourneyDto firstJourney = journeySelectionService.extractFirstJourney(response);
        TripOptionResponse primaryTrip = buildTripOption(firstJourney);
        List<TripOptionResponse> options = buildTripOptions(response);

        return new TripSummaryResponse(
                primaryTrip.plannedDurationMinutes(),
                primaryTrip.realtimeDurationMinutes(),
                primaryTrip.walkingDurationMinutes(),
                primaryTrip.realisticDurationMinutes(),
                primaryTrip.recommendedLeaveAt(),
                primaryTrip.recommendedLeaveInMinutes(),
                primaryTrip.transfers(),
                primaryTrip.route(),
                primaryTrip.insights(),
                primaryTrip.segments(),
                primaryTrip.stops(),
                primaryTrip.polyline(),
                primaryTrip.stationTiming(),
                options
        );
    }

    private List<TripOptionResponse> buildTripOptions(JourneyPlannerResponse response) {
        List<TripOptionResponse> options = new ArrayList<>();

        if (response == null || response.journeys() == null) {
            return options;
        }

        for (JourneyDto journey : response.journeys()) {
            if (journey == null || journey.legs() == null || journey.legs().isEmpty()) {
                continue;
            }
            options.add(buildTripOption(journey));
        }

        return options;
    }

    private TripOptionResponse buildTripOption(JourneyDto journey) {
        LegDto firstTransitLeg = journeySelectionService.findFirstTransitLeg(journey);
        LegDto lastTransitLeg = journeySelectionService.findLastTransitLeg(journey);

        TripRouteResponse route = buildRoute(firstTransitLeg, lastTransitLeg);
        TripInsightResponse insights = buildInsights(firstTransitLeg);
        List<JourneySegmentResponse> segments = journeySegmentService.buildSegments(journey);
        Integer walkingDurationMinutes = journeySegmentService.calculateWalkingDurationMinutes(journey);
        List<JourneyStopResponse> stops = journeyStopService.buildStops(firstTransitLeg);
        List<CoordinateResponse> polyline = List.of();
        String leaveAt = journeyTimingService.calculateLeaveAt(journey);
        Integer leaveInMinutes = journeyTimingService.calculateLeaveInMinutes(journey);
        StationTimingResponse stationTiming = journeyTimingService.getStationTiming(journey);
        Integer realisticDurationMinutes = journeyTimingService.calculateRealisticDurationMinutes(journey);

        return new TripOptionResponse(
                fieldExtractor.secondsToMinutes(journey.tripDuration()),
                fieldExtractor.secondsToMinutes(journey.tripRtDuration()),
                walkingDurationMinutes,
                realisticDurationMinutes,
                leaveAt,
                leaveInMinutes,
                journey.interchanges(),
                route,
                insights,
                segments,
                stops,
                polyline,
                stationTiming
        );
    }

    private TripRouteResponse buildRoute(LegDto firstTransitLeg, LegDto lastTransitLeg) {
        TransportationDto transportation = firstTransitLeg.transportation();

        return new TripRouteResponse(
                fieldExtractor.extractDepartureTime(firstTransitLeg),
                fieldExtractor.extractArrivalTime(lastTransitLeg),
                fieldExtractor.extractMode(transportation),
                fieldExtractor.extractLine(transportation),
                fieldExtractor.extractDirection(transportation),
                fieldExtractor.extractPlaceName(firstTransitLeg.origin()),
                fieldExtractor.extractPlaceName(lastTransitLeg.destination()),
                fieldExtractor.extractPlatform(firstTransitLeg.origin())
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
