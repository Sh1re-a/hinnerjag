package nu.hinnerjag.backend.external.trafiklab;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class TrafiklabTestController {

    private final RestClient restClient = RestClient.create();

    @GetMapping("/api/test/trafiklab")
    public String testTrafiklab() {
        String url = "https://journeyplanner.integration.sl.se/v2/trips?type_origin=any&type_destination=any&name_origin=9091001000009182&name_destination=9091001000009192&calc_number_of_trips=3\n";
        return restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);
    }
}