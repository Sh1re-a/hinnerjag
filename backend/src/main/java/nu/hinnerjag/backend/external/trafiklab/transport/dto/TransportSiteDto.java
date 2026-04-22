package nu.hinnerjag.backend.external.trafiklab.transport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TransportSiteDto(
        @JsonProperty("id")
        Integer siteId,
        String name,
        Double lat,
        Double lon
) {
}