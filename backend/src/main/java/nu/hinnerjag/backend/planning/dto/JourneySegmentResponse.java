package nu.hinnerjag.backend.planning.dto;

public record JourneySegmentResponse(
        String type,
        String from,
        String to,
        Integer durationMinutes,
        String mode,
        String line,
        String toward,
        String platform
) {
}
