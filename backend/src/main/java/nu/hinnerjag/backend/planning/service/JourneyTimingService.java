package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.dto.LegDto;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class JourneyTimingService {

    private static final ZoneId STOCKHOLM_ZONE = ZoneId.of("Europe/Stockholm");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final JourneySelectionService journeySelectionService;

    public JourneyTimingService(JourneySelectionService journeySelectionService) {
        this.journeySelectionService = journeySelectionService;
    }

    public String calculateLeaveAt(JourneyDto journey) {
        ZonedDateTime leaveAt = calculateLeaveAtDateTime(journey);

        if (leaveAt == null) {
            return null;
        }

        return leaveAt.format(TIME_FORMATTER);
    }

    public Integer calculateLeaveInMinutes(JourneyDto journey) {
        ZonedDateTime leaveAt = calculateLeaveAtDateTime(journey);

        if (leaveAt == null) {
            return null;
        }

        long minutes = Duration.between(ZonedDateTime.now(STOCKHOLM_ZONE), leaveAt).toMinutes();
        return (int) minutes;
    }

    private ZonedDateTime calculateLeaveAtDateTime(JourneyDto journey) {
        if (journey == null || journey.legs() == null || journey.legs().isEmpty()) {
            return null;
        }

        LegDto firstTransitLeg = journeySelectionService.findFirstTransitLeg(journey);

        if (firstTransitLeg == null || firstTransitLeg.origin() == null) {
            return null;
        }

        String departureIso = firstTransitLeg.origin().departureTimeEstimated();
        if (departureIso == null || departureIso.isBlank()) {
            return null;
        }

        OffsetDateTime transitDeparture = OffsetDateTime.parse(departureIso);
        int accessWalkingMinutes = calculateAccessWalkingMinutes(journey, firstTransitLeg);

        return transitDeparture
                .atZoneSameInstant(STOCKHOLM_ZONE)
                .minusMinutes(accessWalkingMinutes);
    }

    private int calculateAccessWalkingMinutes(JourneyDto journey, LegDto firstTransitLeg) {
        int totalWalkingSeconds = 0;

        for (LegDto leg : journey.legs()) {
            if (leg.equals(firstTransitLeg)) {
                break;
            }

            if (leg.duration() != null) {
                totalWalkingSeconds += leg.duration();
            }
        }

        return totalWalkingSeconds / 60;
    }
}