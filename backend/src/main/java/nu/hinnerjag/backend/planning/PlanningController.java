package nu.hinnerjag.backend.planning;

import nu.hinnerjag.backend.planning.dto.JourneyPlanRequest;
import nu.hinnerjag.backend.planning.dto.TripSummaryResponse;
import nu.hinnerjag.backend.planning.service.PlanningService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans")
public class PlanningController {

    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/test-trip")
    public TripSummaryResponse testTrip() {
        return planningService.getTestTrip();
    }

    @PostMapping("/journey")
    public TripSummaryResponse planJourney(@RequestBody JourneyPlanRequest request) {
        return planningService.planJourney(request);
    }
}