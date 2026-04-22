package nu.hinnerjag.backend.planning.config;

import java.util.Map;

public record StationBufferConfig(
        Integer defaultMetroBufferMinutes,
        String defaultMetroReason,
        Map<String, StationBufferEntry> stations
) {
}