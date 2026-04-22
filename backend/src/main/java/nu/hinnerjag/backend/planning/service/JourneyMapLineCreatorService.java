package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.dto.LegDto;
import nu.hinnerjag.backend.planning.dto.CoordinateResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class JourneyMapLineCreatorService {

    public List<CoordinateResponse> buildPolyline(JourneyDto journey) {
        List<CoordinateResponse> polyline = new ArrayList<>();

        if (journey == null || journey.legs() == null) {
            return polyline;
        }

        for (LegDto leg : journey.legs()) {
            if (leg == null || leg.coords() == null) {
                continue;
            }

            for (List<Double> coordPair : leg.coords()) {
                if (!isValidCoordPair(coordPair)) {
                    continue;
                }

                polyline.add(new CoordinateResponse(coordPair.get(0), coordPair.get(1)));
            }
        }

        return polyline;
    }

    private boolean isValidCoordPair(List<Double> coordPair) {
        return coordPair != null
                && coordPair.size() == 2
                && coordPair.get(0) != null
                && coordPair.get(1) != null;
    }
}