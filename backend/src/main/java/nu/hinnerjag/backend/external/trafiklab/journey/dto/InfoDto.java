package nu.hinnerjag.backend.external.trafiklab.journey.dto;

import java.util.List;

public record InfoDto(
        List<InfoLinkDto> infoLinks
) {
}
