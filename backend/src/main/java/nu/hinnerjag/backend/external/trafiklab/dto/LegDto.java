package nu.hinnerjag.backend.external.trafiklab.dto;

public record LegDto(
        PlaceDto origin,
        PlaceDto destination,
        TransportationDto transportation
) {
}
