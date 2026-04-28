package nu.hinnerjag.backend.board;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import nu.hinnerjag.backend.board.dto.BoardResponse;
import nu.hinnerjag.backend.board.dto.NearbyBoardResponse;
import nu.hinnerjag.backend.board.service.BoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@RestController
@Validated
@RequestMapping("/api/board")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public ResponseEntity<BoardResponse> getBoard(@RequestParam @Min(value = 1, message = "siteId must be greater than 0") Integer siteId) {
        return ResponseEntity.ok(boardService.getBoard(siteId));
    }

    @GetMapping("/nearby")
    public ResponseEntity<NearbyBoardResponse> getNearbyBoards(
            @RequestParam
            @DecimalMin(value = "-90.0", message = "lat must be between -90 and 90")
            @DecimalMax(value = "90.0", message = "lat must be between -90 and 90")
            Double lat,
            @RequestParam
            @DecimalMin(value = "-180.0", message = "lng must be between -180 and 180")
            @DecimalMax(value = "180.0", message = "lng must be between -180 and 180")
            Double lng
    ) {
        return ResponseEntity.ok(boardService.getNearbyBoards(lat, lng));
    }
}
