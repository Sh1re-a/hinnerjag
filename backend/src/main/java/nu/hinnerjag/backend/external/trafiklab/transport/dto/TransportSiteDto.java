package nu.hinnerjag.backend.external.trafiklab.transport.dto;

public record TransportSiteDto(
        Integer siteId,
        String name,
        Double lat,
        Double lon
) {
}