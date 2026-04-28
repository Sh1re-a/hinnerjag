package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.planning.dto.JourneyPlanRequest;
import org.springframework.stereotype.Service;

@Service
public class JourneyRequestMapper {

    public String buildTripsUrl(JourneyPlanRequest request) {
        validate(request);

        return "https://journeyplanner.integration.sl.se/v2/trips"
                + "?type_origin=coord"
                + "&name_origin=" + toCoordValue(request.originLng(), request.originLat())
                + "&type_destination=coord"
                + "&name_destination=" + toCoordValue(request.destinationLng(), request.destinationLat())
                + "&calc_number_of_trips=3"
                + "&language=en"
                + "&route_type=leasttime"
                + "&gen_c=true";
    }

    private void validate(JourneyPlanRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Journey request is required");
        }

        if (request.originLat() == null || request.originLng() == null) {
            throw new IllegalArgumentException("Origin coordinates are required");
        }

        if (request.destinationLat() == null || request.destinationLng() == null) {
            throw new IllegalArgumentException("Destination coordinates are required");
        }
    }

    private String toCoordValue(Double lng, Double lat) {
        return lng + ":" + lat + ":WGS84[dd.ddddd]";
    }
}
