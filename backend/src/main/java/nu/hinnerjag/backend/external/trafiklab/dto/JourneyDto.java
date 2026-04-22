package nu.hinnerjag.backend.external.trafiklab.dto;

import java.util.List;

public record JourneyDto(
        Integer tripDuration,
        Integer tripRtDuration,
        Integer interchanges,
        List<LegDto> legs
) {
}
