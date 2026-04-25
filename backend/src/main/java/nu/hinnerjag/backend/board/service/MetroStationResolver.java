package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportStopPointFullDto;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MetroStationResolver {

    public Map<Integer, String> buildMetroStationIndex(List<TransportStopPointFullDto> stopPoints) {
        Map<Integer, String> index = new HashMap<>();

        for (TransportStopPointFullDto stopPoint : stopPoints) {
            if (stopPoint == null || stopPoint.stopArea() == null) {
                continue;
            }

            if (!"METROSTN".equalsIgnoreCase(stopPoint.stopArea().type())) {
                continue;
            }

            Integer stopAreaId = stopPoint.stopArea().id();
            String stationName = stopPoint.stopArea().name();

            if (stopAreaId != null && stationName != null && !stationName.isBlank()) {
                index.put(stopAreaId, stationName);
            }
        }

        return index;
    }

    public String resolveMetroStationName(
            TransportSiteDto site,
            Map<Integer, String> metroStationIndex
    ) {
        if (site.stopAreas() == null || site.stopAreas().isEmpty()) {
            return site.name();
        }

        for (Integer stopAreaId : site.stopAreas()) {
            if (stopAreaId == null) {
                continue;
            }

            String stationName = metroStationIndex.get(stopAreaId);
            if (stationName != null && !stationName.isBlank()) {
                return stationName;
            }
        }

        return site.name();
    }
}