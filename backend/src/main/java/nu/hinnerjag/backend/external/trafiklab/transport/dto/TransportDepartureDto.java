package nu.hinnerjag.backend.external.trafiklab.transport.dto;

public record TransportDepartureDto(
        TransportLineDto line,
        TransportDestinationDto destination,
        TransportJourneyDirectionDto journeyDirection,
        TransportDisplayDto display
) {
}