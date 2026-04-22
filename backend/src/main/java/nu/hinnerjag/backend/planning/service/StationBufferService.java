package nu.hinnerjag.backend.planning.service;

import org.springframework.stereotype.Service;

@Service
public class StationBufferService {

    public StationBuffer getBufferForStation(String stationName) {
        return StationBuffer.from(stationName);
    }
}