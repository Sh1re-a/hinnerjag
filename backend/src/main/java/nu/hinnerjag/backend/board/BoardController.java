package nu.hinnerjag.backend.board;

import nu.hinnerjag.backend.board.dto.BoardResponse;
import nu.hinnerjag.backend.board.service.BoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
}