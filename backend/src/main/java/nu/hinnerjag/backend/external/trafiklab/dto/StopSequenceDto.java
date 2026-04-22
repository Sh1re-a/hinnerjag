package nu.hinnerjag.backend.external.trafiklab.dto;

import java.util.Map;

public record StopSequenceDto(
        String name,
        String arrivalTimeEstimated,
        String departureTimeEstimated,
        Map<String, String> properties,
        ParentPlaceDto parent
) {
}
