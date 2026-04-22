package nu.hinnerjag.backend.external.trafiklab.transport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TransportLineDto(
        String designation,
        @JsonProperty("transport_mode") String transportMode
) {
}