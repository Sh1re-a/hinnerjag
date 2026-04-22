package nu.hinnerjag.backend.external.trafiklab.dto;


public record TransportationDto(
        String disassembledName,
        ProductDto product,
        DestinationDto destination
) {
}
