package nu.hinnerjag.backend.planning.dto;

import java.util.List;

public record TripSummaryResponse(
        Integer plannedDurationMinutes,
        Integer realtimeDurationMinutes,
        Integer walkingDurationMinutes,
        Integer realisticDurationMinutes,
        String recommendedLeaveAt,
        Integer recommendedLeaveInMinutes,
        Integer transfers,
        TripRouteResponse route,
        TripInsightResponse insights,
        List<JourneySegmentResponse> segments,
        List<JourneyStopResponse> stops,
        List<CoordinateResponse> polyline,
        StationTimingResponse stationTiming
) {
}
