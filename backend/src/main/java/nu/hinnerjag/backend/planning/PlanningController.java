package nu.hinnerjag.backend.planning;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlanningController {

    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/api/plans/test-trip")
    public String testTrip() {
        return planningService.getTestTrip();
    }
}