package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.dto.InfoDto;
import nu.hinnerjag.backend.external.trafiklab.dto.InfoLinkDto;
import nu.hinnerjag.backend.external.trafiklab.dto.LegDto;
import nu.hinnerjag.backend.external.trafiklab.dto.PlaceDto;
import nu.hinnerjag.backend.external.trafiklab.dto.TransportationDto;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PlanningFieldExtractor {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final String DEFAULT_DIRECTION = "Unknown";

    public String formatTime(String isoDateTime) {
        if (isBlank(isoDateTime)) {
            return null;
        }

        return OffsetDateTime.parse(isoDateTime).format(TIME_FORMATTER);
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

        String platform = place.properties().get("platformName");
        if (isBlank(platform)) {
            platform = place.properties().get("platform");
        }

        return platform;
    }

    public String extractOccupancy(PlaceDto place) {
        if (place == null || place.properties() == null) {
            return null;
        }

        return place.properties().get("occupancy");
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