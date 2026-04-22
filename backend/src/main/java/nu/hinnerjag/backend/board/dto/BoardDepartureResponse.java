package nu.hinnerjag.backend.board.dto;

public record BoardDepartureResponse(
        String line,
        String destination,
        String display,
        String transportMode
) {
}