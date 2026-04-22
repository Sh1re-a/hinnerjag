package nu.hinnerjag.backend.planning.dto;

public record TripRouteResponse(
        String departureTime,
        String arrivalTime,
        String mode,
        String line,
        String toward,
        String originName,
        String destinationName,
        String platform
) {
}
