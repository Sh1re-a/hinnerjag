package nu.hinnerjag.backend.external.trafiklab.transport.dto;

import java.util.List;

public record TransportDeparturesResponse(
        List<TransportDepartureDto> departures
) {
}