package nu.hinnerjag.backend.board.dto;

public record BoardReachabilityResponse(
        int minutesUntilDeparture,
        boolean recommendedGoNow,
        int recommendedWalkInMinutes,
        int marginMinutes,
        String status
) {
}