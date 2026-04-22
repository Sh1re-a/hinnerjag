package nu.hinnerjag.backend.external.trafiklab.journey.dto;

import java.util.Map;

public record PlaceDto(
        String name,
        String departureTimeEstimated,
        String arrivalTimeEstimated,
        Map<String, String> properties,
        ParentPlaceDto parent
) {
}
