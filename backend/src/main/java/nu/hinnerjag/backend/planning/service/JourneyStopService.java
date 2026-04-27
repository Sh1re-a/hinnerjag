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

    private String extractPlatform(Map<String, Object> properties) {
        if (properties == null) {
            return null;
        }

        Object p = properties.get("platformName");
        String platform = null;
        if (p instanceof String) {
            platform = (String) p;
        } else if (p instanceof java.util.List) {
            java.util.List<?> l = (java.util.List<?>) p;
            if (!l.isEmpty()) platform = l.get(0) == null ? null : l.get(0).toString();
        } else if (p != null && p.getClass().isArray()) {
            Object[] arr = (Object[]) p;
            if (arr.length > 0) platform = arr[0] == null ? null : arr[0].toString();
        }

        if (isBlank(platform)) {
            Object p2 = properties.get("platform");
            if (p2 instanceof String) platform = (String) p2;
            else if (p2 instanceof java.util.List) {
                java.util.List<?> l = (java.util.List<?>) p2;
                if (!l.isEmpty()) platform = l.get(0) == null ? null : l.get(0).toString();
            } else if (p2 != null && p2.getClass().isArray()) {
                Object[] arr = (Object[]) p2;
                if (arr.length > 0) platform = arr[0] == null ? null : arr[0].toString();
            }
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