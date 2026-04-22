package nu.hinnerjag.backend.board.dto;

public record TransportSiteDto(
        Integer siteId,
        String name,
        Double lat,
        Double lon
) {
}