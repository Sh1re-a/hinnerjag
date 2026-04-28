package nu.hinnerjag.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientResponseException;

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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericError(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Journey planning failed"));
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
