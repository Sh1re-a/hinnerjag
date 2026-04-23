package nu.hinnerjag.backend.external.trafiklab.transport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TransportStopPointFullDto(
        Integer id,
        String name,
        String designation,
        @JsonProperty("stop_area") TransportStopAreaDto stopArea
) {
}