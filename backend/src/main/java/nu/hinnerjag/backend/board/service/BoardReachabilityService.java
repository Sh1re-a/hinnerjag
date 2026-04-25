package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.BoardAccessResponse;
import nu.hinnerjag.backend.board.dto.BoardReachabilityResponse;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

@Service
public class BoardReachabilityService {

    public BoardReachabilityResponse createReachability(String display, BoardAccessResponse access) {
        int minutesUntilDeparture = parseMinutesUntilDeparture(display);
        int marginMinutes = minutesUntilDeparture - access.recommendedAccessMinutes();
        boolean recommendedGoNow = marginMinutes <= 0;
        int recommendedWalkInMinutes = Math.max(0, marginMinutes);
        String status = calculateStatus(marginMinutes);

        return new BoardReachabilityResponse(
                minutesUntilDeparture,
                recommendedGoNow,
                recommendedWalkInMinutes,
                marginMinutes,
                status
        );
    }

    private int parseMinutesUntilDeparture(String display) {
        if (display == null || display.isBlank()) {
            return Integer.MAX_VALUE;
        }

        String value = display.trim().toLowerCase();

        if (value.equals("nu")) {
            return 0;
        }

        if (value.endsWith("min")) {
            String number = value.replace("min", "").trim();
            try {
                return Integer.parseInt(number);
            } catch (NumberFormatException e) {
                return Integer.MAX_VALUE;
            }
        }

        try {
            LocalTime departureTime = LocalTime.parse(display.trim());
            LocalTime now = LocalTime.now();

            long minutes = ChronoUnit.MINUTES.between(now, departureTime);

            if (minutes < 0) {
                minutes += 24 * 60;
            }

            return (int) minutes;
        } catch (Exception e) {
            return Integer.MAX_VALUE;
        }
    }

    private String calculateStatus(int marginMinutes) {
        if (marginMinutes >= 2) {
            return "SAFE";
        }

        if (marginMinutes >= 0) {
            return "TIGHT";
        }

        return "MISS";
    }
}