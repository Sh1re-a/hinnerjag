package nu.hinnerjag.backend.planning.service;

import nu.hinnerjag.backend.planning.dto.StationBufferResponse;
import org.springframework.stereotype.Service;

@Service
public class StationBufferService {

    public StationBufferResponse getBufferForStation(String stationName) {
        StationBuffer buffer = StationBuffer.from(stationName);

        return new StationBufferResponse(
                buffer.getMinutes(),
                buffer.getReason()
        );
    }
}