package nu.hinnerjag.backend.external.trafiklab;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class TrafiklabJourneyClient {

    private final RestClient restClient = RestClient.create();

    public String fetchTestTrip() {
        String url = "https://journeyplanner.integration.sl.se/v2/trips" +
                "?type_origin=coord" +
                "&name_origin=18.082494:59.257932:WGS84[dd.ddddd]" +
                "&type_destination=coord" +
                "&name_destination=18.072226:59.319633:WGS84[dd.ddddd]" +
                "&calc_number_of_trips=1" +
                "&language=en" +
                "&route_type=leasttime" +
                "&gen_c=true";

        return restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);
    }
}