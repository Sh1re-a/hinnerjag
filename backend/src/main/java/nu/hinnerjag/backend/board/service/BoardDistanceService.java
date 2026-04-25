package nu.hinnerjag.backend.board.service;

import org.springframework.stereotype.Service;

@Service
public class BoardDistanceService {

    public double distanceMeters(double userLat, double userLng, double siteLat, double siteLng) {
        double earthRadius = 6371000.0;

        double dLat = Math.toRadians(siteLat - userLat);
        double dLng = Math.toRadians(siteLng - userLng);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(userLat)) * Math.cos(Math.toRadians(siteLat))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }

    public double roundDistance(double distanceMeters) {
        return Math.round(distanceMeters);
    }
}