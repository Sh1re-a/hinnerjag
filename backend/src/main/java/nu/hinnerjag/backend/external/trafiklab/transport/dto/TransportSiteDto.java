package nu.hinnerjag.backend.external.trafiklab.transport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TransportSiteDto(
        @JsonProperty("id")
        Integer siteId,
        String name,
        Double lat,
        Double lon,
        @JsonProperty("stop_areas") List<Integer> stopAreas
) {
}