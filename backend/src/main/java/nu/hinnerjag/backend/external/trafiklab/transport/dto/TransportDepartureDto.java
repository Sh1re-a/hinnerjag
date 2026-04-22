package nu.hinnerjag.backend.external.trafiklab.transport.dto;

public record TransportDepartureDto(
        TransportLineDto line,
        String destination,
        String direction,
        String display
) {
}