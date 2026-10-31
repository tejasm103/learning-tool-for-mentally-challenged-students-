/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * Functional Interactive Chess Game with Legal Move Enforcement & MindBot AI
 */

const MindVerseChess = (function() {
  const PIECES = {
    wP: '♙', wR: '♖', wN: '♘', wB: '♗', wQ: '♕', wK: '♔',
    bP: '♟', bR: '♜', bN: '♞', bB: '♝', bQ: '♛', bK: '♚'
  };

  let board = [];
  let turn = 'w'; // 'w' (White = Player) or 'b' (Black = MindBot)
  let selectedSquare = null;
  let validMoves = [];
  let moveHistory = [];
  let vsComputer = true;
  let isGameOver = false;

  function initChess(containerId = 'chess-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    resetBoard();
    render(container);
  }

  function resetBoard() {
    board = [
      ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
      ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
      ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];
    turn = 'w';
    selectedSquare = null;
    validMoves = [];
    moveHistory = [];
    isGameOver = false;
  }

  function render(container) {
    container.innerHTML = `
      <div class="chessboard-wrapper">
        <div class="game-hud" style="width:100%; max-width:480px; margin-bottom:0.5rem;">
          <div class="hud-stat" id="chess-turn-stat"><span>Turn:</span> <strong style="color:var(--primary);">${turn === 'w' ? 'White (You)' : 'Black (MindBot)'}</strong></div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-secondary" id="chess-undo-btn">↩️ Undo</button>
            <button class="btn btn-secondary" id="chess-reset-btn">🔄 Reset</button>
          </div>
        </div>

        <div class="chessboard" id="chessboard-grid"></div>
        <div id="chess-status" style="font-size:1.05rem; font-weight:700; color:var(--text-muted); min-height:28px;"></div>
      </div>
    `;

    const grid = document.getElementById('chessboard-grid');
    grid.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isLight = (r + c) % 2 === 0;
        sq.className = `chess-square ${isLight ? 'light' : 'dark'}`;
        sq.dataset.row = r;
        sq.dataset.col = c;

        const piece = board[r][c];
        if (piece) {
          sq.textContent = PIECES[piece];
        }

        // Highlight selected
        if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
          sq.classList.add('selected');
        }

        // Highlight valid moves
        const isValid = validMoves.some(m => m.r === r && m.c === c);
        if (isValid) {
          if (piece) {
            sq.classList.add('valid-capture');
          } else {
            sq.classList.add('valid-move');
          }
        }

        sq.onclick = () => handleSquareClick(r, c, container);
        grid.appendChild(sq);
      }
    }

    document.getElementById('chess-reset-btn').onclick = () => {
      resetBoard();
      render(container);
    };

    document.getElementById('chess-undo-btn').onclick = () => {
      if (moveHistory.length > 0 && !isGameOver) {
        board = moveHistory.pop();
        turn = 'w';
        selectedSquare = null;
        validMoves = [];
        render(container);
      }
    };
  }

  function handleSquareClick(r, c, container) {
    if (isGameOver) return;
    if (vsComputer && turn === 'b') return; // Wait for MindBot

    const clickedPiece = board[r][c];

    // If already selected and clicked a valid move target
    if (selectedSquare && validMoves.some(m => m.r === r && m.c === c)) {
      executeMove(selectedSquare.r, selectedSquare.c, r, c);
      selectedSquare = null;
      validMoves = [];
      render(container);

      if (vsComputer && !isGameOver && turn === 'b') {
        const statusEl = document.getElementById('chess-status');
        if (statusEl) statusEl.textContent = 'MindBot is planning a gentle move...';
        setTimeout(() => makeComputerMove(container), 800);
      }
      return;
    }

    // Select piece of current turn
    if (clickedPiece && clickedPiece.startsWith(turn)) {
      selectedSquare = { r, c };
      validMoves = calculateLegalMoves(r, c);
      if (typeof MindVerseAudio !== 'undefined') MindVerseAudio.playClickSound();
      render(container);
    } else {
      selectedSquare = null;
      validMoves = [];
      render(container);
    }
  }

  function executeMove(fromR, fromC, toR, toC) {
    // Save history
    moveHistory.push(board.map(row => [...row]));

    const piece = board[fromR][fromC];
    const captured = board[toR][toC];

    board[toR][toC] = piece;
    board[fromR][fromC] = '';

    // Pawn promotion to Queen
    if (piece === 'wP' && toR === 0) board[toR][toC] = 'wQ';
    if (piece === 'bP' && toR === 7) board[toR][toC] = 'bQ';

    if (typeof MindVerseAudio !== 'undefined') {
      if (captured) {
        MindVerseAudio.playStarSound();
      } else {
        MindVerseAudio.playClickSound();
      }
    }

    // Check if King captured
    if (captured === 'bK') {
      isGameOver = true;
      if (typeof MindVerseGames !== 'undefined') {
        MindVerseGames.showCelebration('Checkmate! You won the chess match!', 200, 3);
      }
      return;
    }
    if (captured === 'wK') {
      isGameOver = true;
      alert('MindBot says: Great match! Friendly chess helps our logical thinking grow.');
      return;
    }

    // Switch turn
    turn = (turn === 'w') ? 'b' : 'w';
  }

  function calculateLegalMoves(r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = piece[0];
    const type = piece[1];
    const moves = [];

    const isEnemy = (targetR, targetC) => {
      const p = board[targetR][targetC];
      return p && p[0] !== color;
    };

    const isEmpty = (targetR, targetC) => !board[targetR][targetC];

    // Pawn
    if (type === 'P') {
      const dir = (color === 'w') ? -1 : 1;
      const startRow = (color === 'w') ? 6 : 1;

      // 1 square forward
      if (r + dir >= 0 && r + dir < 8 && isEmpty(r + dir, c)) {
        moves.push({ r: r + dir, c });
        // 2 squares forward from start
        if (r === startRow && isEmpty(r + 2 * dir, c)) {
          moves.push({ r: r + 2 * dir, c });
        }
      }
      // Diagonal captures
      [-1, 1].forEach(dc => {
        if (r + dir >= 0 && r + dir < 8 && c + dc >= 0 && c + dc < 8) {
          if (isEnemy(r + dir, c + dc)) {
            moves.push({ r: r + dir, c: c + dc });
          }
        }
      });
    }

    // Knight
    if (type === 'N') {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightOffsets.forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (isEmpty(nr, nc) || isEnemy(nr, nc)) {
            moves.push({ r: nr, c: nc });
          }
        }
      });
    }

    // Sliding pieces (Rook, Bishop, Queen)
    const dirs = [];
    if (type === 'R' || type === 'Q') {
      dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }
    if (type === 'B' || type === 'Q') {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    dirs.forEach(([dr, dc]) => {
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr >= 8 || nc < 0 || nc < 8) break;
        if (isEmpty(nr, nc)) {
          moves.push({ r: nr, c: nc });
        } else {
          if (isEnemy(nr, nc)) moves.push({ r: nr, c: nc });
          break;
        }
        step++;
      }
    });

    // King
    if (type === 'K') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (isEmpty(nr, nc) || isEnemy(nr, nc)) {
              moves.push({ r: nr, c: nc });
            }
          }
        }
      }
    }

    return moves;
  }

  function makeComputerMove(container) {
    if (isGameOver) return;

    // Collect all black legal moves
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c].startsWith('b')) {
          const pieceMoves = calculateLegalMoves(r, c);
          pieceMoves.forEach(m => {
            allMoves.push({ fromR: r, fromC: c, toR: m.r, toC: m.c });
          });
        }
      }
    }

    if (allMoves.length === 0) {
      alert('Stalemate! Great match.');
      return;
    }

    // Prioritize captures, otherwise random
    const captureMoves = allMoves.filter(m => board[m.toR][m.toC] !== '');
    const chosenMove = captureMoves.length > 0 ? captureMoves[0] : allMoves[Math.floor(Math.random() * allMoves.length)];

    executeMove(chosenMove.fromR, chosenMove.fromC, chosenMove.toR, chosenMove.toC);
    render(container);
  }

  return {
    initChess
  };
})();
