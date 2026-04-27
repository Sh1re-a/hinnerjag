package nu.hinnerjag.backend.external.trafiklab.transport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TransportDepartureDto(
        TransportLineDto line,
        String destination,
        String direction,
        String display,
        @JsonProperty("stop_area") TransportStopAreaDto stopArea

) {
}