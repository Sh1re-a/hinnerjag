package nu.hinnerjag.backend.external.trafiklab.dto;

import java.util.List;

public record LegDto(
        PlaceDto origin,
        PlaceDto destination,
        TransportationDto transportation,
        List<InfoDto> infos,
        Boolean isRealtimeControlled
) {
}
