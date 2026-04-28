package nu.hinnerjag.backend.planning.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record JourneyPlanRequest(
        @NotNull(message = "originLat is required")
        @DecimalMin(value = "-90.0", message = "originLat must be between -90 and 90")
        @DecimalMax(value = "90.0", message = "originLat must be between -90 and 90")
        Double originLat,
        @NotNull(message = "originLng is required")
        @DecimalMin(value = "-180.0", message = "originLng must be between -180 and 180")
        @DecimalMax(value = "180.0", message = "originLng must be between -180 and 180")
        Double originLng,
        @NotNull(message = "destinationLat is required")
        @DecimalMin(value = "-90.0", message = "destinationLat must be between -90 and 90")
        @DecimalMax(value = "90.0", message = "destinationLat must be between -90 and 90")
        Double destinationLat,
        @NotNull(message = "destinationLng is required")
        @DecimalMin(value = "-180.0", message = "destinationLng must be between -180 and 180")
        @DecimalMax(value = "180.0", message = "destinationLng must be between -180 and 180")
        Double destinationLng
) {
}
