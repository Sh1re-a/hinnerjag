package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.*;
import nu.hinnerjag.backend.external.trafiklab.transport.TrafiklabTransportClient;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportStopPointFullDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class BoardService {

    private static final int MAX_BUS_STOPS = 3;
    private static final double BUS_RADIUS_METERS = 500.0;
    private static final double METRO_RADIUS_METERS = 1200.0;
    private static final int NEARBY_SITE_CANDIDATE_LIMIT = 12;
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
            MetroStationResolver metroStationResolver, BoardCandidateService boardCandidateService
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
        List<TransportSiteDto> sites = trafiklabTransportClient.fetchSites();
        List<TransportStopPointFullDto> stopPoints = trafiklabTransportClient.fetchStopPoints();

        if (sites == null) {
            sites = List.of();
        }

        if (stopPoints == null) {
            stopPoints = List.of();
        }


        List<SiteWithDistance> metroCandidates = boardCandidateService.buildCandidates(
                sites,
                userLat,
                userLng,
                METRO_RADIUS_METERS,
                NEARBY_SITE_CANDIDATE_LIMIT
        );

        List<SiteWithDistance> busCandidates = boardCandidateService.buildCandidates(
                sites,
                userLat,
                userLng,
                BUS_RADIUS_METERS,
                NEARBY_SITE_CANDIDATE_LIMIT
        );

        NearbyBoardSiteResponse nearestMetro = findNearestMetro(metroCandidates, stopPoints);
        List<NearbyBoardSiteResponse> nearbyBusStops = findNearbyBusStops(busCandidates, nearestMetro);

        return new NearbyBoardResponse(
                userLat,
                userLng,
                nearestMetro,
                nearbyBusStops
        );
    }

    private NearbyBoardSiteResponse findNearestMetro(
            List<SiteWithDistance> candidates,
            List<TransportStopPointFullDto> stopPoints
    ) {
        for (SiteWithDistance candidate : candidates) {
            TransportDeparturesResponse response =
                    trafiklabTransportClient.fetchDeparturesBySiteIdSafely(candidate.site().siteId());

            String stationName = metroStationResolver.resolveMetroStationName(candidate.site(), stopPoints);
            BoardAccessResponse access = boardAccessService.createMetroAccess(candidate.distanceMeters(), stationName);

            List<BoardDepartureResponse> departures =
                    boardDepartureService.mapDeparturesWithAccess(response, access);

            List<BoardDepartureResponse> metroDepartures =
                    boardDepartureService.prepareDepartures(departures, this::isMetroDeparture);

            if (!metroDepartures.isEmpty()) {
                return new NearbyBoardSiteResponse(
                        candidate.site().siteId(),
                        stationName,
                        boardDistanceService.roundDistance(candidate.distanceMeters()),
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

            TransportDeparturesResponse response =
                    trafiklabTransportClient.fetchDeparturesBySiteIdSafely(candidate.site().siteId());

            BoardAccessResponse access = boardAccessService.createBusAccess(candidate.distanceMeters());

            List<BoardDepartureResponse> departures =
                    boardDepartureService.mapDeparturesWithAccess(response, access);

            List<BoardDepartureResponse> busDepartures =
                    boardDepartureService.prepareDepartures(departures, this::isBusDeparture);

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

    private boolean isMetroDeparture(BoardDepartureResponse departure) {
        return "METRO".equalsIgnoreCase(departure.transportMode())
                || (departure.line() != null && METRO_LINES.contains(departure.line()));
    }

    private boolean isBusDeparture(BoardDepartureResponse departure) {
        return "BUS".equalsIgnoreCase(departure.transportMode())
                || (departure.line() != null && !METRO_LINES.contains(departure.line()));
    }

}