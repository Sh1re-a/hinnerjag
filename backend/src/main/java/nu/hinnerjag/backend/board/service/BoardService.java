package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.BoardAccessResponse;
import nu.hinnerjag.backend.board.dto.BoardDepartureResponse;
import nu.hinnerjag.backend.board.dto.BoardReachabilityResponse;
import nu.hinnerjag.backend.board.dto.BoardResponse;
import nu.hinnerjag.backend.board.dto.NearbyBoardResponse;
import nu.hinnerjag.backend.board.dto.NearbyBoardSiteResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.TrafiklabTransportClient;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDepartureDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportDeparturesResponse;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportStopPointFullDto;
import nu.hinnerjag.backend.planning.service.StationBuffer;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

@Service
public class BoardService {

    private static final int MAX_FILTERED_DEPARTURES = 15;
    private static final int MAX_SOURCE_DEPARTURES = 40;
    private static final int MAX_BUS_STOPS = 3;
    private static final double BUS_RADIUS_METERS = 300.0;
    private static final double METRO_RADIUS_METERS = 1200.0;
    private static final Set<String> METRO_LINES = Set.of("10", "11", "13", "14", "17", "18", "19");

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
        List<TransportStopPointFullDto> stopPoints = trafiklabTransportClient.fetchStopPoints();

        if (sites == null) {
            sites = List.of();
        }

        if (stopPoints == null) {
            stopPoints = List.of();
        }

        List<SiteWithDistance> nearbySites = sites.stream()
                .filter(site -> site != null && site.siteId() != null)
                .filter(site -> site.lat() != null && site.lon() != null)
                .map(site -> new SiteWithDistance(
                        site,
                        distanceMeters(userLat, userLng, site.lat(), site.lon())
                ))
                .sorted(Comparator.comparingDouble(SiteWithDistance::distanceMeters))
                .limit(20)
                .toList();

        NearbyBoardSiteResponse nearestMetro = findNearestMetro(nearbySites, stopPoints);
        List<NearbyBoardSiteResponse> nearbyBusStops = findNearbyBusStops(nearbySites, nearestMetro);

        return new NearbyBoardResponse(
                userLat,
                userLng,
                nearestMetro,
                nearbyBusStops
        );
    }

    private NearbyBoardSiteResponse findNearestMetro(
            List<SiteWithDistance> nearbySites,
            List<TransportStopPointFullDto> stopPoints
    ) {
        for (SiteWithDistance candidate : nearbySites) {
            if (candidate.distanceMeters() > METRO_RADIUS_METERS) {
                continue;
            }

            TransportDeparturesResponse response =
                    trafiklabTransportClient.fetchDeparturesBySiteIdSafely(candidate.site().siteId());

            String metroStationName = resolveMetroStationName(candidate, stopPoints);
            BoardAccessResponse access = createMetroAccess(candidate.distanceMeters(), metroStationName);

            List<BoardDepartureResponse> departures = mapDeparturesWithAccess(response, access);
                List<BoardDepartureResponse> metroDepartures = prepareDepartures(
                    departures,
                    this::isMetroDeparture
                );

            if (!metroDepartures.isEmpty()) {
                return new NearbyBoardSiteResponse(
                        candidate.site().siteId(),
                        metroStationName,
                        roundDistance(candidate.distanceMeters()),
                        access,
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
        List<NearbyBoardSiteResponse> busStops = new ArrayList<>();

        for (SiteWithDistance candidate : nearbySites) {
            if (nearestMetro != null && candidate.site().siteId().equals(nearestMetro.siteId())) {
                continue;
            }

            if (candidate.distanceMeters() > BUS_RADIUS_METERS) {
                continue;
            }

            TransportDeparturesResponse response =
                    trafiklabTransportClient.fetchDeparturesBySiteIdSafely(candidate.site().siteId());

            BoardAccessResponse access = createBusAccess(candidate.distanceMeters());

            List<BoardDepartureResponse> departures = mapDeparturesWithAccess(response, access);
                List<BoardDepartureResponse> busDepartures = prepareDepartures(
                    departures,
                    this::isBusDeparture
                );

            if (busDepartures.isEmpty()) {
                continue;
            }

            busStops.add(new NearbyBoardSiteResponse(
                    candidate.site().siteId(),
                    candidate.site().name(),
                    roundDistance(candidate.distanceMeters()),
                    access,
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
                    departure.line() != null ? departure.line().transportMode() : null,
                    null
            ));

            if (result.size() == MAX_SOURCE_DEPARTURES) {
                break;
            }
        }

        return result;
    }

    private List<BoardDepartureResponse> mapDeparturesWithAccess(
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
                    createReachability(departure.display(), access)
            ));

            if (result.size() == MAX_SOURCE_DEPARTURES) {
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

    private List<BoardDepartureResponse> prepareDepartures(
            List<BoardDepartureResponse> departures,
            Predicate<BoardDepartureResponse> modeFilter
    ) {
        List<BoardDepartureResponse> sorted = departures.stream()
                .filter(modeFilter)
                .filter(departure -> departure.reachability() != null)
                .filter(departure -> departure.reachability().minutesUntilDeparture() != Integer.MAX_VALUE)
                .sorted(Comparator.comparingInt(departure -> departure.reachability().minutesUntilDeparture()))
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

    private String resolveMetroStationName(
            SiteWithDistance candidate,
            List<TransportStopPointFullDto> stopPoints
    ) {
        if (candidate.site().stopAreas() == null || candidate.site().stopAreas().isEmpty()) {
            return candidate.site().name();
        }

        for (Integer stopAreaId : candidate.site().stopAreas()) {
            if (stopAreaId == null) {
                continue;
            }

            for (TransportStopPointFullDto stopPoint : stopPoints) {
                if (stopPoint == null || stopPoint.stopArea() == null) {
                    continue;
                }

                boolean sameStopArea = stopAreaId.equals(stopPoint.stopArea().id());
                boolean isMetroStation = "METROSTN".equalsIgnoreCase(stopPoint.stopArea().type());

                if (sameStopArea && isMetroStation) {
                    return stopPoint.stopArea().name();
                }
            }
        }

        return candidate.site().name();
    }

    private int calculateWalkMinutes(double distanceMeters) {
        return Math.max(1, (int) Math.ceil(distanceMeters / 80.0));
    }

    private int parseMinutesUntilDeparture(String display) {
        if (display == null || display.isBlank()) {
            return Integer.MAX_VALUE;
        }

        String value = display.trim().toLowerCase();

        if (value.equals("nu")) {
            return 0;
        }

        if (value.endsWith("min")) {
            String number = value.replace("min", "").trim();
            try {
                return Integer.parseInt(number);
            } catch (NumberFormatException e) {
                return Integer.MAX_VALUE;
            }
        }

        try {
            LocalTime departureTime = LocalTime.parse(display.trim());
            LocalTime now = LocalTime.now();

            long minutes = ChronoUnit.MINUTES.between(now, departureTime);

            if (minutes < 0) {
                minutes += 24 * 60;
            }

            return (int) minutes;
        } catch (Exception e) {
            return Integer.MAX_VALUE;
        }
    }

    private String calculateStatus(int marginMinutes) {
        if (marginMinutes >= 2) {
            return "SAFE";
        }

        if (marginMinutes >= 0) {
            return "TIGHT";
        }

        return "MISS";
    }

    private BoardAccessResponse createMetroAccess(double distanceMeters, String stationName) {
        int walkMinutes = calculateWalkMinutes(distanceMeters);
        StationBuffer buffer = StationBuffer.from(stationName);
        int bufferMinutes = buffer.getMinutes();
        int recommendedAccessMinutes = walkMinutes + bufferMinutes;

        return new BoardAccessResponse(
                walkMinutes,
                bufferMinutes,
                recommendedAccessMinutes,
                "Gångtid till station plus perrongmarginal för tunnelbana"
        );
    }

    private BoardAccessResponse createBusAccess(double distanceMeters) {
        int walkMinutes = calculateWalkMinutes(distanceMeters);

        return new BoardAccessResponse(
                walkMinutes,
                0,
                walkMinutes,
                "Gångtid till hållplats"
        );
    }

    private BoardReachabilityResponse createReachability(
            String display,
            BoardAccessResponse access
    ) {
        int minutesUntilDeparture = parseMinutesUntilDeparture(display);
        int marginMinutes = minutesUntilDeparture - access.recommendedAccessMinutes();
        boolean recommendedGoNow = marginMinutes <= 0;
        int recommendedWalkInMinutes = Math.max(0, marginMinutes);
        String status = calculateStatus(marginMinutes);

        return new BoardReachabilityResponse(
                minutesUntilDeparture,
                recommendedGoNow,
                recommendedWalkInMinutes,
                marginMinutes,
                status
        );
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