package nu.hinnerjag.backend.config;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Pattern ERROR_MESSAGE_PATTERN =
            Pattern.compile("\"error_message\"\\s*:\\s*\"([^\"]+)\"");

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationError(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(ApiExceptionHandler::formatFieldError)
                .toList();

        return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid request",
                "details", details
        ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        List<String> details = ex.getConstraintViolations().stream()
                .map(violation -> violation.getMessage())
                .toList();

        return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid request",
                "details", details
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadableBody(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid request body"));
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<Map<String, String>> handleUpstreamError(RestClientResponseException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        String responseBody = ex.getResponseBodyAsString();
        String message = extractErrorMessage(responseBody);

        if (status == null) {
            status = HttpStatus.BAD_GATEWAY;
        }

        return ResponseEntity.status(status).body(Map.of("message", message));
    }

    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, String>> handleProviderUnavailable(RestClientException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("message", "Traffic data is unavailable right now"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericError(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Something went wrong"));
    }

    private static String formatFieldError(FieldError error) {
        return "%s: %s".formatted(error.getField(), error.getDefaultMessage());
    }

    private String extractErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "Journey provider request failed";
        }

        Matcher matcher = ERROR_MESSAGE_PATTERN.matcher(responseBody);
        if (matcher.find()) {
            return matcher.group(1);
        }

        return responseBody;
    }
}
