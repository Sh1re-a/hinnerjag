package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.journey.dto.InfoDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.InfoLinkDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.LegDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.PlaceDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.TransportationDto;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PlanningFieldExtractor {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final ZoneId STOCKHOLM_ZONE = ZoneId.of("Europe/Stockholm");
    private static final String DEFAULT_DIRECTION = "Unknown";

    public String formatTime(String isoDateTime) {
        if (isBlank(isoDateTime)) {
            return null;
        }

        return OffsetDateTime.parse(isoDateTime)
                .atZoneSameInstant(STOCKHOLM_ZONE)
                .format(TIME_FORMATTER);
    }

    public Integer secondsToMinutes(Integer seconds) {
        if (seconds == null) {
            return null;
        }

        return seconds / 60;
    }

    public String extractDepartureTime(LegDto leg) {
        if (leg == null || leg.origin() == null) {
            return null;
        }

        return formatTime(leg.origin().departureTimeEstimated());
    }

    public String extractArrivalTime(LegDto leg) {
        if (leg == null || leg.destination() == null) {
            return null;
        }

        return formatTime(leg.destination().arrivalTimeEstimated());
    }

    public String extractMode(TransportationDto transportation) {
        if (transportation == null || transportation.product() == null) {
            return null;
        }

        return transportation.product().name();
    }

    public String extractLine(TransportationDto transportation) {
        if (transportation == null) {
            return null;
        }

        return transportation.disassembledName();
    }

    public String extractDirection(TransportationDto transportation) {
        if (transportation == null || transportation.destination() == null) {
            return DEFAULT_DIRECTION;
        }

        return transportation.destination().name();
    }

    public String extractPlaceName(PlaceDto place) {
        if (place == null) {
            return null;
        }

        if (place.parent() != null && !isBlank(place.parent().name())) {
            return cleanStopName(place.parent().name());
        }

        return cleanStopName(place.name());
    }

    public String extractPlatform(PlaceDto place) {
        if (place == null || place.properties() == null) {
            return null;
        }

        String platform = propertyAsString(place.properties(), "platformName");
        if (isBlank(platform)) {
            platform = propertyAsString(place.properties(), "platform");
        }

        return platform;
    }

    public String extractOccupancy(PlaceDto place) {
        if (place == null || place.properties() == null) {
            return null;
        }

        return propertyAsString(place.properties(), "occupancy");
    }

    private String propertyAsString(java.util.Map<String, Object> props, String key) {
        if (props == null) return null;

        Object v = props.get(key);
        if (v == null) return null;
        if (v instanceof String) return (String) v;
        if (v instanceof java.util.List) {
            java.util.List<?> l = (java.util.List<?>) v;
            if (!l.isEmpty()) return l.get(0) == null ? null : l.get(0).toString();
            return null;
        }
        if (v.getClass().isArray()) {
            Object[] arr = (Object[]) v;
            if (arr.length > 0) return arr[0] == null ? null : arr[0].toString();
            return null;
        }

        return v.toString();
    }

    public List<String> extractAlerts(LegDto leg) {
        List<String> alerts = new ArrayList<>();

        if (leg == null || leg.infos() == null) {
            return alerts;
        }

        for (InfoDto info : leg.infos()) {
            if (info == null || info.infoLinks() == null) {
                continue;
            }

            for (InfoLinkDto link : info.infoLinks()) {
                if (link != null && !isBlank(link.title())) {
                    alerts.add(link.title());
                }
            }
        }

        return alerts;
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