package nu.hinnerjag.backend.planning.config;

public record StationBufferEntry(
        Integer minutes,
        String reason
) {
}