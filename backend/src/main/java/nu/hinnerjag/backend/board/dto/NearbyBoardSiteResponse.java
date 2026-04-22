package nu.hinnerjag.backend.board.dto;

import java.util.List;

public record NearbyBoardSiteResponse(
        Integer siteId,
        String siteName,
        Double distanceMeters,
        List<BoardDepartureResponse> departures
) {
}