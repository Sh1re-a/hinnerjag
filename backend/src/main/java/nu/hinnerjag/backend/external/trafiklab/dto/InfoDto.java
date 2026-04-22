package nu.hinnerjag.backend.external.trafiklab.dto;

import java.util.List;

public record InfoDto(
        List<InfoLinkDto> infoLinks
) {
}
