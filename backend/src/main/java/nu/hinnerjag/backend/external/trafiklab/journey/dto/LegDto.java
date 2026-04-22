package nu.hinnerjag.backend.external.trafiklab.journey.dto;

import java.util.List;

public record LegDto(
        Integer duration,
        PlaceDto origin,
        PlaceDto destination,
        TransportationDto transportation,
        List<InfoDto> infos,
        List<StopSequenceDto> stopSequence,
        List<List<Double>> coords,
        Boolean isRealtimeControlled
) {
}
