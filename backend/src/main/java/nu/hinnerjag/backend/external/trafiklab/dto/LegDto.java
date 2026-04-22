package nu.hinnerjag.backend.external.trafiklab.dto;

import java.util.List;

public record LegDto(
        Integer duration,
        PlaceDto origin,
        PlaceDto destination,
        TransportationDto transportation,
        List<InfoDto> infos,
        List<StopSequenceDto> stopSequence,
        Boolean isRealtimeControlled
) {
}
