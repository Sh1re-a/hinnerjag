package nu.hinnerjag.backend.planning;

import nu.hinnerjag.backend.planning.dto.JourneyPlanRequest;
import nu.hinnerjag.backend.planning.dto.TripSummaryResponse;
import nu.hinnerjag.backend.planning.service.PlanningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans")
public class PlanningController {

    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/test-trip")
    public ResponseEntity<TripSummaryResponse> testTrip() {
        return ResponseEntity.ok(planningService.getTestTrip());
    }

    @PostMapping("/journey")
    public ResponseEntity<TripSummaryResponse> planJourney(@RequestBody JourneyPlanRequest request) {
        return ResponseEntity.ok(planningService.planJourney(request));
    }
}