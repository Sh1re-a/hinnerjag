package nu.hinnerjag.backend.board.dto;

import java.util.List;

public record BoardResponse(
        Integer siteId,
        List<BoardDepartureResponse> departures
) {
}