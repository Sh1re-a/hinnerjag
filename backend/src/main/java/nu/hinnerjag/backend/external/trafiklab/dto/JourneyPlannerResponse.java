package nu.hinnerjag.backend.external.trafiklab.dto;

import java.util.List;

public record JourneyPlannerResponse (
        List<JourneyDto> journeys
){
}
