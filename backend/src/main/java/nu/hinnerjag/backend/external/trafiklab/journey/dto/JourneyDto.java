package nu.hinnerjag.backend.external.trafiklab.journey.dto;

import java.util.List;

public record JourneyDto(
        Integer tripDuration,
        Integer tripRtDuration,
        Integer interchanges,
        List<LegDto> legs
) {
}
