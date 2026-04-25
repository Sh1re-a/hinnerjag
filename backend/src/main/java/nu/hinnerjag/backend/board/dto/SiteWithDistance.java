package nu.hinnerjag.backend.board.dto;

import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;

public record SiteWithDistance(
        TransportSiteDto site,
        double distanceMeters
) {
}