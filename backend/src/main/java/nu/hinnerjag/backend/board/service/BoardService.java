package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.BoardDepartureResponse;
import nu.hinnerjag.backend.board.dto.BoardResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.TrafiklabTransportClient;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDepartureDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BoardService {

    private static final int MAX_DEPARTURES = 5;

    private final TrafiklabTransportClient trafiklabTransportClient;

    public BoardService(TrafiklabTransportClient trafiklabTransportClient) {
        this.trafiklabTransportClient = trafiklabTransportClient;
    }

    public BoardResponse getBoard(Integer siteId) {
        TransportDeparturesResponse response = trafiklabTransportClient.fetchDeparturesBySiteId(siteId);

        List<BoardDepartureResponse> departures = mapDepartures(response);

        return new BoardResponse(siteId, departures);
    }

    private List<BoardDepartureResponse> mapDepartures(TransportDeparturesResponse response) {
        List<BoardDepartureResponse> result = new ArrayList<>();

        if (response == null || response.departures() == null) {
            return result;
        }

        for (TransportDepartureDto departure : response.departures()) {
            if (departure == null) {
                continue;
            }

            result.add(new BoardDepartureResponse(
                    departure.line() != null ? departure.line().designation() : null,
                    extractDestination(departure),
                    departure.display() != null ? departure.display().time() : null,
                    departure.line() != null ? departure.line().transportMode() : null
            ));

            if (result.size() == MAX_DEPARTURES) {
                break;
            }
        }

        return result;
    }

    private String extractDestination(TransportDepartureDto departure) {
        if (departure.destination() != null && departure.destination().value() != null) {
            return departure.destination().value();
        }

        if (departure.journeyDirection() != null && departure.journeyDirection().value() != null) {
            return departure.journeyDirection().value();
        }

        return null;
    }
}