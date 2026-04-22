package nu.hinnerjag.backend.external.trafiklab.journey.dto;


public record TransportationDto(
        String disassembledName,
        ProductDto product,
        DestinationDto destination
) {
}
