package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.external.trafiklab.journey.dto.JourneyDto;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.JourneyPlannerResponse;
import nu.hinnerjag.backend.external.trafiklab.journey.dto.LegDto;
import org.springframework.stereotype.Service;

@Service
public class JourneySelectionService {

    private static final String FOOTPATH_MODE = "footpath";

    public JourneyDto extractFirstJourney(JourneyPlannerResponse response) {
        if (response == null || response.journeys() == null || response.journeys().isEmpty()) {
            throw new IllegalStateException("No journeys returned from Trafiklab");
        }

        JourneyDto firstJourney = response.journeys().get(0);

        if (firstJourney.legs() == null || firstJourney.legs().isEmpty()) {
            throw new IllegalStateException("No legs returned from Trafiklab");
        }

        return firstJourney;
    }

    public LegDto findFirstTransitLeg(JourneyDto journey) {
        for (LegDto leg : journey.legs()) {
            if (isTransitLeg(leg)) {
                return leg;
            }
        }

        return journey.legs().get(0);
    }

    public boolean isTransitLeg(LegDto leg) {
        if (leg == null || leg.transportation() == null || leg.transportation().product() == null) {
            return false;
        }

        String mode = leg.transportation().product().name();
        return mode != null && !mode.equalsIgnoreCase(FOOTPATH_MODE);
    }
    public LegDto findLastTransitLeg(JourneyDto journey) {
        if (journey == null || journey.legs() == null || journey.legs().isEmpty()) {
            throw new IllegalStateException("No legs returned from Trafiklab");
        }

        LegDto lastTransitLeg = null;

        for (LegDto leg : journey.legs()) {
            if (isTransitLeg(leg)) {
                lastTransitLeg = leg;
            }
        }

        if (lastTransitLeg != null) {
            return lastTransitLeg;
        }

        return journey.legs().get(journey.legs().size() - 1);
    }
}