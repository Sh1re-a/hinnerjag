package nu.hinnerjag.backend.planning.dto;

import java.util.List;

public record TripInsightResponse(
        Boolean realtimeControlled,
        String occupancy,
        List<String> alerts
) {
}
