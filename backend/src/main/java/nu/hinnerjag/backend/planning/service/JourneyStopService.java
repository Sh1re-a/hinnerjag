package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.journey.dto.LegDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.StopSequenceDto;
import nu.hinnerjag.backend.planning.dto.JourneyStopResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class JourneyStopService {

    private final PlanningFieldExtractor fieldExtractor;

    public JourneyStopService(PlanningFieldExtractor fieldExtractor) {
        this.fieldExtractor = fieldExtractor;
    }

    public List<JourneyStopResponse> buildStops(LegDto transitLeg) {
        List<JourneyStopResponse> stops = new ArrayList<>();

        if (transitLeg == null || transitLeg.stopSequence() == null) {
            return stops;
        }

        for (StopSequenceDto stop : transitLeg.stopSequence()) {
            stops.add(new JourneyStopResponse(
                    extractStopName(stop),
                    fieldExtractor.formatTime(stop.arrivalTimeEstimated()),
                    fieldExtractor.formatTime(stop.departureTimeEstimated()),
                    extractPlatform(stop.properties())
            ));
        }

        return stops;
    }

    private String extractStopName(StopSequenceDto stop) {
        if (stop == null) {
            return null;
        }

        if (stop.parent() != null && !isBlank(stop.parent().name())) {
            return cleanStopName(stop.parent().name());
        }

        return cleanStopName(stop.name());
    }

    private String extractPlatform(Map<String, String> properties) {
        if (properties == null) {
            return null;
        }

        String platform = properties.get("platformName");
        if (isBlank(platform)) {
            platform = properties.get("platform");
        }

        return platform;
    }

    private String cleanStopName(String rawName) {
        if (rawName == null) {
            return null;
        }

        return rawName.replace(", Stockholm", "").trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}