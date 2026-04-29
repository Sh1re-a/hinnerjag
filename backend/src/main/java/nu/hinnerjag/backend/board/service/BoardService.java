package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.BoardAccessResponse;
import nu.hinnerjag.backend.board.dto.BoardDepartureResponse;
import nu.hinnerjag.backend.board.dto.BoardResponse;
import nu.hinnerjag.backend.board.dto.NearbyBoardResponse;
import nu.hinnerjag.backend.board.dto.NearbyBoardSiteResponse;
import nu.hinnerjag.backend.board.dto.SiteWithDistance;
import nu.hinnerjag.backend.external.trafiklab.transport.TrafiklabTransportClient;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportStopPointFullDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class BoardService {

        private static final String BUS_TRANSPORT_MODE = "BUS";
        private static final String METRO_TRANSPORT_MODE = "METRO";
        private static final int NEARBY_FORECAST_MINUTES = 20;
        private static final int EXTENDED_FORECAST_MINUTES = 40;
        private static final int MIN_METRO_DEPARTURES = 1;
        private static final int MIN_BUS_DEPARTURES = 4;

    private static final int MAX_BUS_STOPS = 3;
        private static final double BUS_RADIUS_METERS = 500.0;
        private static final double METRO_RADIUS_METERS = 1500.0;
        private static final int METRO_CANDIDATE_LIMIT = 12;
    private static final int BUS_CANDIDATE_LIMIT = 6;
    private static final Set<String> METRO_LINES = Set.of("10", "11", "13", "14", "17", "18", "19");

    private final TrafiklabTransportClient trafiklabTransportClient;
    private final BoardDistanceService boardDistanceService;
    private final BoardAccessService boardAccessService;
    private final BoardDepartureService boardDepartureService;
        private final MetroStationResolver metroStationResolver;
        private final BoardCandidateService boardCandidateService;

    public BoardService(
            TrafiklabTransportClient trafiklabTransportClient,
            BoardDistanceService boardDistanceService,
            BoardAccessService boardAccessService,
            BoardDepartureService boardDepartureService,
                        MetroStationResolver metroStationResolver,
                        BoardCandidateService boardCandidateService
    ) {
        this.trafiklabTransportClient = trafiklabTransportClient;
        this.boardDistanceService = boardDistanceService;
        this.boardAccessService = boardAccessService;
        this.boardDepartureService = boardDepartureService;
        this.metroStationResolver = metroStationResolver;
        this.boardCandidateService = boardCandidateService;
    }

    public BoardResponse getBoard(Integer siteId) {
        TransportDeparturesResponse response = trafiklabTransportClient.fetchDeparturesBySiteId(siteId);
        List<BoardDepartureResponse> departures = boardDepartureService.mapDepartures(response);

        return new BoardResponse(siteId, departures);
    }

    public NearbyBoardResponse getNearbyBoards(Double userLat, Double userLng) {
        List<TransportSiteDto> sites = trafiklabTransportClient.fetchSitesSafely();

                if (sites.isEmpty()) {
                        return new NearbyBoardResponse(userLat, userLng, null, List.of());
                }

                List<TransportStopPointFullDto> stopPoints = trafiklabTransportClient.fetchStopPointsSafely();

        Map<Integer, String> metroStationIndex = metroStationResolver.buildMetroStationIndex(stopPoints);

        List<SiteWithDistance> metroCandidates = boardCandidateService.buildCandidates(
                sites,
                userLat,
                userLng,
                METRO_RADIUS_METERS,
                METRO_CANDIDATE_LIMIT
        );

        List<SiteWithDistance> busCandidates = boardCandidateService.buildCandidates(
                sites,
                userLat,
                userLng,
                BUS_RADIUS_METERS,
                BUS_CANDIDATE_LIMIT
        );

        NearbyBoardSiteResponse nearestMetro = findNearestMetro(metroCandidates, metroStationIndex);
        List<NearbyBoardSiteResponse> nearbyBusStops = findNearbyBusStops(busCandidates, nearestMetro);

        return new NearbyBoardResponse(userLat, userLng, nearestMetro, nearbyBusStops);
    }

        private NearbyBoardSiteResponse findNearestMetro(
                        List<SiteWithDistance> candidates,
                        Map<Integer, String> metroStationIndex
        ) {
                        Map<String, List<SiteWithDistance>> candidatesByStation = new LinkedHashMap<>();

                        for (SiteWithDistance candidate : candidates) {
                                String stationName = resolveMetroStationName(candidate, metroStationIndex);
                                candidatesByStation.computeIfAbsent(stationName, ignored -> new ArrayList<>()).add(candidate);
                        }

                        for (Map.Entry<String, List<SiteWithDistance>> stationEntry : candidatesByStation.entrySet()) {
                                String stationName = stationEntry.getKey();
                                List<SiteWithDistance> stationCandidates = stationEntry.getValue();
                                SiteWithDistance nearestCandidate = stationCandidates.getFirst();

                                BoardAccessResponse access = boardAccessService.createMetroAccess(
                                                nearestCandidate.distanceMeters(),
                                                stationName
                                );

                                List<BoardDepartureResponse> metroDepartures = findPreparedDeparturesForSites(
                                                stationCandidates,
                                                access,
                                                METRO_TRANSPORT_MODE,
                                                this::isMetroDeparture,
                                                MIN_METRO_DEPARTURES
                                );

                                if (!metroDepartures.isEmpty()) {
                                        return new NearbyBoardSiteResponse(
                                                        nearestCandidate.site().siteId(),
                                                        stationName,
                                                        boardDistanceService.roundDistance(nearestCandidate.distanceMeters()),
                                                        access,
                                                        metroDepartures
                                        );
                                }
                        }

                        return null;
        }

    private List<NearbyBoardSiteResponse> findNearbyBusStops(
            List<SiteWithDistance> candidates,
            NearbyBoardSiteResponse nearestMetro
    ) {
        List<NearbyBoardSiteResponse> result = new ArrayList<>();

        for (SiteWithDistance candidate : candidates) {
            if (nearestMetro != null && candidate.site().siteId().equals(nearestMetro.siteId())) {
                continue;
            }

            BoardAccessResponse access = boardAccessService.createBusAccess(candidate.distanceMeters());

            List<BoardDepartureResponse> busDepartures = findPreparedDepartures(
                    candidate.site().siteId(),
                    access,
                    BUS_TRANSPORT_MODE,
                    this::isBusDeparture,
                    MIN_BUS_DEPARTURES
            );

            if (busDepartures.isEmpty()) {
                continue;
            }

            result.add(new NearbyBoardSiteResponse(
                    candidate.site().siteId(),
                    candidate.site().name(),
                    boardDistanceService.roundDistance(candidate.distanceMeters()),
                    access,
                    busDepartures
            ));

            if (result.size() == MAX_BUS_STOPS) {
                break;
            }
        }

        return result;
    }

    private List<BoardDepartureResponse> findPreparedDepartures(
            Integer siteId,
            BoardAccessResponse access,
            String transportMode,
            java.util.function.Predicate<BoardDepartureResponse> modeFilter,
            int minimumCount
    ) {
        List<BoardDepartureResponse> departures = loadPreparedDepartures(
                siteId,
                access,
                transportMode,
                NEARBY_FORECAST_MINUTES,
                modeFilter
        );

        if (departures.size() >= minimumCount) {
            return departures;
        }

        List<BoardDepartureResponse> extendedDepartures = loadPreparedDepartures(
                siteId,
                access,
                transportMode,
                EXTENDED_FORECAST_MINUTES,
                modeFilter
        );

                List<BoardDepartureResponse> best = extendedDepartures.size() > departures.size() ? extendedDepartures : departures;

                if (best.size() >= minimumCount) {
                        return best;
                }

                if (transportMode != null) {
                        List<BoardDepartureResponse> fallback = loadPreparedDepartures(
                                        siteId,
                                        access,
                                        null,
                                        EXTENDED_FORECAST_MINUTES,
                                        modeFilter
                        );

                        return fallback.size() > best.size() ? fallback : best;
                }

                return best;
    }

    private List<BoardDepartureResponse> findPreparedDeparturesForSites(
            List<SiteWithDistance> candidates,
            BoardAccessResponse access,
            String transportMode,
            java.util.function.Predicate<BoardDepartureResponse> modeFilter,
            int minimumCount
    ) {
        List<BoardDepartureResponse> departures = loadPreparedDeparturesForSites(
                candidates,
                access,
                transportMode,
                NEARBY_FORECAST_MINUTES,
                modeFilter
        );

        if (departures.size() >= minimumCount) {
            return departures;
        }

        List<BoardDepartureResponse> extendedDepartures = loadPreparedDeparturesForSites(
                candidates,
                access,
                transportMode,
                EXTENDED_FORECAST_MINUTES,
                modeFilter
        );

        List<BoardDepartureResponse> best = extendedDepartures.size() > departures.size() ? extendedDepartures : departures;

        if (best.size() >= minimumCount) {
            return best;
        }

        if (transportMode != null) {
            List<BoardDepartureResponse> fallback = loadPreparedDeparturesForSites(
                    candidates,
                    access,
                    null,
                    EXTENDED_FORECAST_MINUTES,
                    modeFilter
            );

            return fallback.size() > best.size() ? fallback : best;
        }

        return best;
    }

    private List<BoardDepartureResponse> loadPreparedDepartures(
            Integer siteId,
            BoardAccessResponse access,
            String transportMode,
            int forecastMinutes,
            java.util.function.Predicate<BoardDepartureResponse> modeFilter
    ) {
        TransportDeparturesResponse response = trafiklabTransportClient.fetchDeparturesBySiteIdSafely(
                siteId,
                transportMode,
                forecastMinutes
        );

        List<BoardDepartureResponse> departures = boardDepartureService.mapDeparturesWithAccess(response, access);
        return boardDepartureService.prepareDepartures(departures, modeFilter);
    }

    private List<BoardDepartureResponse> loadPreparedDeparturesForSites(
            List<SiteWithDistance> candidates,
            BoardAccessResponse access,
            String transportMode,
            int forecastMinutes,
            java.util.function.Predicate<BoardDepartureResponse> modeFilter
    ) {
        List<BoardDepartureResponse> departures = new ArrayList<>();

        for (SiteWithDistance candidate : candidates) {
            TransportDeparturesResponse response = trafiklabTransportClient.fetchDeparturesBySiteIdSafely(
                    candidate.site().siteId(),
                    transportMode,
                    forecastMinutes
            );

            departures.addAll(boardDepartureService.mapDeparturesWithAccess(response, access));
        }

        return boardDepartureService.prepareDepartures(departures, modeFilter);
    }

    private String resolveMetroStationName(
            SiteWithDistance candidate,
            Map<Integer, String> metroStationIndex
    ) {
        String stationName = null;

        TransportDeparturesResponse rawDepartures = trafiklabTransportClient.fetchDeparturesBySiteIdSafely(
                candidate.site().siteId(),
                METRO_TRANSPORT_MODE,
                NEARBY_FORECAST_MINUTES
        );

        if (rawDepartures != null && rawDepartures.departures() != null) {
            for (var dep : rawDepartures.departures()) {
                if (dep == null) {
                    continue;
                }

                try {
                    var stopArea = dep.stopArea();
                    if (stopArea != null && "METROSTN".equalsIgnoreCase(stopArea.type())) {
                        var name = stopArea.name();
                        if (name != null && !name.isBlank()) {
                            stationName = name;
                            break;
                        }
                    }
                } catch (NoSuchMethodError | UnsupportedOperationException ignored) {
                    // Fall back to stop-area index below.
                }
            }
        }

        if (stationName != null) {
            return stationName;
        }

        return metroStationResolver.resolveMetroStationName(
                candidate.site(),
                metroStationIndex
        );
    }

    private boolean isMetroDeparture(BoardDepartureResponse departure) {
        return "METRO".equalsIgnoreCase(departure.transportMode())
                || (departure.line() != null && METRO_LINES.contains(departure.line()));
    }

    private boolean isBusDeparture(BoardDepartureResponse departure) {
        return "BUS".equalsIgnoreCase(departure.transportMode())
                || (departure.line() != null && !METRO_LINES.contains(departure.line()));
    }
}
