package nu.hinnerjag.backend.planning.dto;

public record JourneyPlanRequest(
        Double originLat,
        Double originLng,
        Double destinationLat,
        Double destinationLng
) {
}