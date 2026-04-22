package nu.hinnerjag.backend.board.dto;

import java.util.List;

public record TransportSitesResponse(
        List<TransportSiteDto> sites
) {
}