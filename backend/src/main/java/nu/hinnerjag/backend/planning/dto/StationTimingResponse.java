package nu.hinnerjag.backend.planning.dto;

public record StationTimingResponse(
        Integer boardingMinutes,
        String boardingReason,
        Integer arrivalMinutes,
        String arrivalReason
) {
}