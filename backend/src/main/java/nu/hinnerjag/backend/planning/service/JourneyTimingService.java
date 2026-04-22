package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.journey.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.LegDto;
import nu.hinnerjag.backend.planning.dto.StationTimingResponse;
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
    private static final int GENERAL_BUFFER_MINUTES = 1;

    private final JourneySelectionService journeySelectionService;
    private final PlanningFieldExtractor planningFieldExtractor;
    private final StationBufferService stationBufferService;

    public JourneyTimingService(
            JourneySelectionService journeySelectionService,
            PlanningFieldExtractor planningFieldExtractor,
            StationBufferService stationBufferService
    ) {
        this.journeySelectionService = journeySelectionService;
        this.planningFieldExtractor = planningFieldExtractor;
        this.stationBufferService = stationBufferService;
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

        Duration duration = Duration.between(ZonedDateTime.now(STOCKHOLM_ZONE), leaveAt);

        if (duration.isNegative() || duration.isZero()) {
            return 0;
        }

        long seconds = duration.getSeconds();
        return (int) Math.ceil(seconds / 60.0);
    }

    public Integer calculateRealisticDurationMinutes(JourneyDto journey) {
        if (journey == null || journey.tripDuration() == null) {
            return null;
        }

        int baseMinutes = journey.tripDuration() / 60;
        StationTimingResponse stationTiming = getStationTiming(journey);

        return baseMinutes
                + stationTiming.boardingMinutes()
                + stationTiming.arrivalMinutes()
                + GENERAL_BUFFER_MINUTES;
    }

    public StationTimingResponse getStationTiming(JourneyDto journey) {
        LegDto firstTransitLeg = journeySelectionService.findFirstTransitLeg(journey);
        LegDto lastTransitLeg = journeySelectionService.findLastTransitLeg(journey);

        StationBuffer boardingBuffer = getBoardingBuffer(firstTransitLeg);
        StationBuffer arrivalBuffer = getArrivalBuffer(lastTransitLeg);

        return new StationTimingResponse(
                boardingBuffer.getMinutes(),
                boardingBuffer.getReason(),
                arrivalBuffer.getMinutes(),
                arrivalBuffer.getReason()
        );
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
        StationBuffer boardingBuffer = getBoardingBuffer(firstTransitLeg);

        int totalMinutesBeforeDeparture = accessWalkingMinutes
                + GENERAL_BUFFER_MINUTES
                + boardingBuffer.getMinutes();

        return transitDeparture
                .atZoneSameInstant(STOCKHOLM_ZONE)
                .minusMinutes(totalMinutesBeforeDeparture);
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

    private StationBuffer getBoardingBuffer(LegDto firstTransitLeg) {
        if (firstTransitLeg == null || firstTransitLeg.origin() == null) {
            return StationBuffer.DEFAULT;
        }

        String stationName = planningFieldExtractor.extractPlaceName(firstTransitLeg.origin());
        return stationBufferService.getBufferForStation(stationName);
    }

    private StationBuffer getArrivalBuffer(LegDto lastTransitLeg) {
        if (lastTransitLeg == null || lastTransitLeg.destination() == null) {
            return StationBuffer.DEFAULT;
        }

        String stationName = planningFieldExtractor.extractPlaceName(lastTransitLeg.destination());
        return stationBufferService.getBufferForStation(stationName);
    }
}