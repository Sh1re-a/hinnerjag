package nu.hinnerjag.backend.board.service;

import nu.hinnerjag.backend.board.dto.SiteWithDistance;
import nu.hinnerjag.backend.external.trafiklab.transport.dto.TransportSiteDto;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class BoardCandidateService {

    private final BoardDistanceService boardDistanceService;

    public BoardCandidateService(BoardDistanceService boardDistanceService) {
        this.boardDistanceService = boardDistanceService;
    }

    public List<SiteWithDistance> buildCandidates(
            List<TransportSiteDto> sites,
            double userLat,
            double userLng,
            double maxDistance,
            int limit
    ) {
        return sites.stream()
                .filter(site -> site != null && site.siteId() != null)
                .filter(site -> site.lat() != null && site.lon() != null)
                .map(site -> new SiteWithDistance(
                        site,
                        boardDistanceService.distanceMeters(userLat, userLng, site.lat(), site.lon())
                ))
                .filter(candidate -> candidate.distanceMeters() <= maxDistance)
                .sorted(Comparator.comparingDouble(SiteWithDistance::distanceMeters))
                .limit(limit)
                .toList();
    }
}