package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.BoardAccessResponse;
import nu.hinnerjag.backend.planning.service.StationBuffer;
import org.springframework.stereotype.Service;

@Service
public class BoardAccessService {

    public int calculateWalkMinutes(double distanceMeters) {
        return Math.max(1, (int) Math.ceil(distanceMeters / 80.0));
    }

    public BoardAccessResponse createMetroAccess(double distanceMeters, String stationName) {
        int walkMinutes = calculateWalkMinutes(distanceMeters);
        StationBuffer buffer = StationBuffer.from(stationName);
        int bufferMinutes = buffer.getMinutes();

        return new BoardAccessResponse(
                walkMinutes,
                bufferMinutes,
                walkMinutes + bufferMinutes,
                "Gångtid till station plus perrongmarginal för tunnelbana"
        );
    }

    public BoardAccessResponse createBusAccess(double distanceMeters) {
        int walkMinutes = calculateWalkMinutes(distanceMeters);

        return new BoardAccessResponse(
                walkMinutes,
                0,
                walkMinutes,
                "Gångtid till hållplats"
        );
    }
}