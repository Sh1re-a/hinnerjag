package nu.hinnerjag.backend.external.trafiklab.transport.dto;

import java.util.List;

public record TransportSitesResponse(
        List<TransportSiteDto> sites
) {
}