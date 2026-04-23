package nu.hinnerjag.backend.board;

import nu.hinnerjag.backend.board.dto.BoardResponse;
import nu.hinnerjag.backend.board.dto.NearbyBoardResponse;
import nu.hinnerjag.backend.board.service.BoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/board")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public ResponseEntity<BoardResponse> getBoard(@RequestParam Integer siteId) {
        return ResponseEntity.ok(boardService.getBoard(siteId));
    }

    @GetMapping("/nearby")
    public ResponseEntity<NearbyBoardResponse> getNearbyBoards(
            @RequestParam Double lat,
            @RequestParam Double lng
    ) {
        return ResponseEntity.ok(boardService.getNearbyBoards(lat, lng));
    }
}