package nu.hinnerjag.backend.planning.dto;

import java.util.List;

public record TripSummaryResponse(
        Integer plannedDurationMinutes,
        Integer realtimeDurationMinutes,
        Integer transfers,
        TripRouteResponse route,
        TripInsightResponse insights
        List<JourneySegmentResponse>segments
) {
}
