package nu.hinnerjag.backend.planning.dto;

public record StationBufferResponse(
        Integer minutes,
        String reason
) {
}