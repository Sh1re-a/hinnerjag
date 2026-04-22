package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.journey.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.LegDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.TransportationDto;
import nu.hinnerjag.backend.planning.dto.JourneySegmentResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class JourneySegmentService {

    private final JourneySelectionService journeySelectionService;
    private final PlanningFieldExtractor fieldExtractor;

    public JourneySegmentService(
            JourneySelectionService journeySelectionService,
            PlanningFieldExtractor fieldExtractor
    ) {
        this.journeySelectionService = journeySelectionService;
        this.fieldExtractor = fieldExtractor;
    }

    public List<JourneySegmentResponse> buildSegments(JourneyDto journey) {
        List<JourneySegmentResponse> segments = new ArrayList<>();

        if (journey == null || journey.legs() == null) {
            return segments;
        }

        for (LegDto leg : journey.legs()) {
            JourneySegmentResponse segment = journeySelectionService.isTransitLeg(leg)
                    ? buildTransitSegment(leg)
                    : buildWalkSegment(leg);

            if (shouldIncludeSegment(segment)) {
                segments.add(segment);
            }
        }

        return segments;
    }

    public Integer calculateWalkingDurationMinutes(JourneyDto journey) {
        if (journey == null || journey.legs() == null) {
            return 0;
        }

        int totalWalkingSeconds = 0;

        for (LegDto leg : journey.legs()) {
            if (!journeySelectionService.isTransitLeg(leg) && leg.duration() != null) {
                totalWalkingSeconds += leg.duration();
            }
        }

        return totalWalkingSeconds / 60;
    }

    private JourneySegmentResponse buildTransitSegment(LegDto leg) {
        TransportationDto transportation = leg.transportation();

        return new JourneySegmentResponse(
                "TRANSIT",
                fieldExtractor.extractPlaceName(leg.origin()),
                fieldExtractor.extractPlaceName(leg.destination()),
                fieldExtractor.secondsToMinutes(leg.duration()),
                fieldExtractor.extractMode(transportation),
                fieldExtractor.extractLine(transportation),
                fieldExtractor.extractDirection(transportation),
                fieldExtractor.extractPlatform(leg.origin())
        );
    }

    private JourneySegmentResponse buildWalkSegment(LegDto leg) {
        return new JourneySegmentResponse(
                "WALK",
                fieldExtractor.extractPlaceName(leg.origin()),
                fieldExtractor.extractPlaceName(leg.destination()),
                fieldExtractor.secondsToMinutes(leg.duration()),
                "Walk",
                null,
                null,
                null
        );
    }

    private boolean shouldIncludeSegment(JourneySegmentResponse segment) {
        if (segment == null) {
            return false;
        }

        if (isBlank(segment.from()) || isBlank(segment.to())) {
            return false;
        }

        if (segment.durationMinutes() == null || segment.durationMinutes() <= 0) {
            return false;
        }

        return !segment.from().equalsIgnoreCase(segment.to());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}