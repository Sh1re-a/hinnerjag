package nu.hinnerjag.backend.planning.dto;

public record JourneyStopResponse(
        String name,
        String arrivalTime,
        String departureTime,
        String platform
) {
}
