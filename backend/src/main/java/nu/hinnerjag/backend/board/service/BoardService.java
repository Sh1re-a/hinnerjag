package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.BoardDepartureResponse;
import nu.hinnerjag.backend.board.dto.BoardResponse;
import nu.hinnerjag.backend.board.dto.NearbyBoardResponse;
import nu.hinnerjag.backend.board.dto.NearbyBoardSiteResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.TrafiklabTransportClient;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDepartureDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class BoardService {

    private static final int MAX_DEPARTURES = 5;
    private static final int MAX_BUS_STOPS = 3;
    private static final double BUS_RADIUS_METERS = 300.0;
    private static final double METRO_RADIUS_METERS = 1200.0;
    private static final Set<String> METRO_LINES = Set.of("13", "14", "17", "18", "19");

    private final TrafiklabTransportClient trafiklabTransportClient;

    public BoardService(TrafiklabTransportClient trafiklabTransportClient) {
        this.trafiklabTransportClient = trafiklabTransportClient;
    }

    public BoardResponse getBoard(Integer siteId) {
        TransportDeparturesResponse response = trafiklabTransportClient.fetchDeparturesBySiteId(siteId);
        List<BoardDepartureResponse> departures = mapDepartures(response);

        return new BoardResponse(siteId, departures);
    }

    public NearbyBoardResponse getNearbyBoards(Double userLat, Double userLng) {
        List<TransportSiteDto> sites = trafiklabTransportClient.fetchSites();

        if (sites == null) {
            sites = List.of();
        }

        List<SiteWithDistance> nearbySites = sites.stream()
                .filter(site -> site != null && site.siteId() != null)
                .filter(site -> site.lat() != null && site.lon() != null)
                .map(site -> new SiteWithDistance(site, distanceMeters(userLat, userLng, site.lat(), site.lon())))
                .sorted(Comparator.comparingDouble(SiteWithDistance::distanceMeters))
                .limit(20)
                .toList();

        NearbyBoardSiteResponse nearestMetro = findNearestMetro(nearbySites);
        List<NearbyBoardSiteResponse> nearbyBusStops = findNearbyBusStops(nearbySites);

        return new NearbyBoardResponse(
                userLat,
                userLng,
                nearestMetro,
                nearbyBusStops
        );
    }

    private NearbyBoardSiteResponse findNearestMetro(List<SiteWithDistance> nearbySites) {
        for (SiteWithDistance candidate : nearbySites) {
            if (candidate.distanceMeters() > METRO_RADIUS_METERS) {
                continue;
            }

            TransportDeparturesResponse response =
                    trafiklabTransportClient.fetchDeparturesBySiteIdSafely(candidate.site().siteId());

            List<BoardDepartureResponse> departures = mapDepartures(response);
            List<BoardDepartureResponse> metroDepartures = departures.stream()
                    .filter(this::isMetroDeparture)
                    .limit(3)
                    .toList();

            if (!metroDepartures.isEmpty()) {
                return new NearbyBoardSiteResponse(
                        candidate.site().siteId(),
                        candidate.site().name(),
                        roundDistance(candidate.distanceMeters()),
                        metroDepartures
                );
            }
        }

        return null;
    }

    private List<NearbyBoardSiteResponse> findNearbyBusStops(
            List<SiteWithDistance> nearbySites,
            NearbyBoardSiteResponse nearestMetro
    ) {
        List<NearbyBoardSiteResponse> nearbyBusStops = findNearbyBusStops(nearbySites, nearestMetro);
        for (SiteWithDistance candidate : nearbySites) {
            if (nearestMetro != null && candidate.site().siteId().equals(nearestMetro.siteId())) {
                continue;
            }
            if (candidate.distanceMeters() > BUS_RADIUS_METERS) {
                continue;
            }

            TransportDeparturesResponse response =
                    trafiklabTransportClient.fetchDeparturesBySiteIdSafely(candidate.site().siteId());

            List<BoardDepartureResponse> departures = mapDepartures(response);
            List<BoardDepartureResponse> busDepartures = departures.stream()
                    .filter(this::isBusDeparture)
                    .limit(3)
                    .toList();

            if (busDepartures.isEmpty()) {
                continue;
            }

            busStops.add(new NearbyBoardSiteResponse(
                    candidate.site().siteId(),
                    candidate.site().name(),
                    roundDistance(candidate.distanceMeters()),
                    busDepartures
            ));

            if (busStops.size() == MAX_BUS_STOPS) {
                break;
            }
        }

        return busStops;
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
                    departure.display(),
                    departure.line() != null ? departure.line().transportMode() : null
            ));

            if (result.size() == MAX_DEPARTURES) {
                break;
            }
        }

        return result;
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

    private boolean isMetroDeparture(BoardDepartureResponse departure) {
        return "METRO".equalsIgnoreCase(departure.transportMode())
                || (departure.line() != null && METRO_LINES.contains(departure.line()));
    }

    private boolean isBusDeparture(BoardDepartureResponse departure) {
        return "BUS".equalsIgnoreCase(departure.transportMode())
                || (departure.line() != null && !METRO_LINES.contains(departure.line()));
    }

    private double distanceMeters(double userLat, double userLng, double siteLat, double siteLng) {
        double earthRadius = 6371000.0;

        double dLat = Math.toRadians(siteLat - userLat);
        double dLng = Math.toRadians(siteLng - userLng);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(userLat)) * Math.cos(Math.toRadians(siteLat))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }

    private double roundDistance(double distanceMeters) {
        return Math.round(distanceMeters);
    }

    private record SiteWithDistance(
            TransportSiteDto site,
            double distanceMeters
    ) {
    }
}