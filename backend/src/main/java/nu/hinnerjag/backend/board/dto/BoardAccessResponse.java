package nu.hinnerjag.backend.board.dto;

public record BoardAccessResponse(
        int walkMinutes,
        int bufferMinutes,
        int recommendedAccessMinutes,
        String reason
) {
}