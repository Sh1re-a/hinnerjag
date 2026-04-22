package nu.hinnerjag.backend.board.dto;

import java.util.List;

public record NearbyBoardResponse(
        Double userLat,
        Double userLng,
        NearbyBoardSiteResponse nearestMetro,
        List<NearbyBoardSiteResponse> nearbyBusStops
) {
}