package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.BoardAccessResponse;
import nu.hinnerjag.backend.board.dto.BoardDepartureResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDepartureDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

@Service
public class BoardDepartureService {

    private static final int MAX_FILTERED_DEPARTURES = 15;
    private static final int MAX_SOURCE_DEPARTURES = 40;

    private final BoardReachabilityService boardReachabilityService;

    public BoardDepartureService(BoardReachabilityService boardReachabilityService) {
        this.boardReachabilityService = boardReachabilityService;
    }

    public List<BoardDepartureResponse> mapDepartures(TransportDeparturesResponse response) {
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
                    departure.display(),
                    departure.line() != null ? departure.line().transportMode() : null,
                    null
            ));

            if (result.size() == MAX_SOURCE_DEPARTURES) {
                break;
            }
        }

        return result;
    }

    public List<BoardDepartureResponse> mapDeparturesWithAccess(
            TransportDeparturesResponse response,
            BoardAccessResponse access
    ) {
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
                    departure.display(),
                    departure.line() != null ? departure.line().transportMode() : null,
                    boardReachabilityService.createReachability(departure.display(), access)
            ));

            if (result.size() == MAX_SOURCE_DEPARTURES) {
                break;
            }
        }

        return result;
    }

    public List<BoardDepartureResponse> prepareDepartures(
            List<BoardDepartureResponse> departures,
            Predicate<BoardDepartureResponse> modeFilter
    ) {
        List<BoardDepartureResponse> sorted = departures.stream()
                .filter(modeFilter)
                .filter(departure -> departure.reachability() != null)
                .filter(departure -> departure.reachability().minutesUntilDeparture() != Integer.MAX_VALUE)
                .sorted(Comparator.comparingInt(d -> d.reachability().minutesUntilDeparture()))
                .toList();

        Set<String> seen = new HashSet<>();
        List<BoardDepartureResponse> unique = new ArrayList<>();

        for (BoardDepartureResponse departure : sorted) {
            String key = (departure.line() == null ? "-" : departure.line())
                    + "|" + (departure.destination() == null ? "-" : departure.destination())
                    + "|" + departure.reachability().minutesUntilDeparture();

            if (!seen.add(key)) {
                continue;
            }

            unique.add(departure);

            if (unique.size() >= MAX_FILTERED_DEPARTURES) {
                break;
            }
        }

        return unique;
    }

    private String extractDestination(TransportDepartureDto departure) {
        if (departure.destination() != null && !departure.destination().isBlank()) {
            return departure.destination();
        }

        if (departure.direction() != null && !departure.direction().isBlank()) {
            return departure.direction();
        }

        return null;
    }
}