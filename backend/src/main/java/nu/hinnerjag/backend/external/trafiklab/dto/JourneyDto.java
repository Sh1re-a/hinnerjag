package nu.hinnerjag.backend.external.trafiklab.dto;

public record JourneyDto(
        Integer tripDuration,
        Integer tripRtDuration,
        Integer interchanges
) {
}
