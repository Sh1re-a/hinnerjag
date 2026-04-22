package nu.hinnerjag.backend.planning.dto;

public record TripSummaryResponse(
        Integer plannedDurationMinutes,
        Integer realtimeDurationMinutes,
        Integer transfers
) {
}
