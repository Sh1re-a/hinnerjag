package nu.hinnerjag.backend.planning.dto;

import java.util.List;

public record TripSummaryResponse(
        Integer plannedDurationMinutes,
        Integer realtimeDurationMinutes,
        Integer walkingDurationMinutes,
        String leaveAt,
        Integer leaveInMinutes,
        Integer transfers,
        TripRouteResponse route,
        TripInsightResponse insights,
        List<JourneySegmentResponse> segments,
        List<JourneyStopResponse> stops,
        List<CoordinateResponse> polyline,
        StationTimingResponse stationTiming
) {
}
