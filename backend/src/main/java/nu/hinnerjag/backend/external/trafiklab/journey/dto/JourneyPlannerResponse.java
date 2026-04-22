package nu.hinnerjag.backend.external.trafiklab.journey.dto;

import java.util.List;

public record JourneyPlannerResponse (
        List<JourneyDto> journeys
){
}
