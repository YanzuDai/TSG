(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TSG2048Engine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SIZE = 4;

  function emptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function cloneState(state) {
    return {
      board: cloneBoard(state.board),
      score: state.score || 0,
      won2048: Boolean(state.won2048),
      victoryAcknowledged: Boolean(state.victoryAcknowledged),
      gameOver: Boolean(state.gameOver),
    };
  }

  function mergeLine(line) {
    const compact = line.filter((value) => value !== 0);
    const merged = [];
    const mergedValues = [];
    let scoreGain = 0;

    for (let i = 0; i < compact.length; i += 1) {
      if (i + 1 < compact.length && compact[i] === compact[i + 1]) {
        const value = compact[i] * 2;
        merged.push(value);
        mergedValues.push(value);
        scoreGain += value;
        i += 1;
      } else {
        merged.push(compact[i]);
      }
    }

    while (merged.length < SIZE) merged.push(0);
    return { line: merged, scoreGain, mergedValues };
  }

  function lineCoordinates(direction, index) {
    const coords = [];
    for (let offset = 0; offset < SIZE; offset += 1) {
      if (direction === 'left') coords.push([index, offset]);
      else if (direction === 'right') coords.push([index, SIZE - 1 - offset]);
      else if (direction === 'up') coords.push([offset, index]);
      else if (direction === 'down') coords.push([SIZE - 1 - offset, index]);
      else throw new Error(`Unknown direction: ${direction}`);
    }
    return coords;
  }

  function applyMove(board, direction) {
    const next = cloneBoard(board);
    let scoreGain = 0;
    const mergedValues = [];

    for (let i = 0; i < SIZE; i += 1) {
      const coords = lineCoordinates(direction, i);
      const values = coords.map(([r, c]) => board[r][c]);
      const result = mergeLine(values);
      result.line.forEach((value, offset) => {
        const [r, c] = coords[offset];
        next[r][c] = value;
      });
      scoreGain += result.scoreGain;
      mergedValues.push(...result.mergedValues);
    }

    return { board: next, scoreGain, mergedValues };
  }

  function boardsEqual(a, b) {
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  function spawnRandom(board, rng = Math.random) {
    const next = cloneBoard(board);
    const empty = [];
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if (next[r][c] === 0) empty.push([r, c]);
      }
    }

    if (empty.length === 0) return { board: next, spawned: null };

    const rawIndex = Math.floor(rng() * empty.length);
    const index = Math.min(empty.length - 1, Math.max(0, rawIndex));
    const [row, col] = empty[index];
    const value = rng() < 0.9 ? 2 : 4;
    next[row][col] = value;
    return { board: next, spawned: { value, position: [row, col] } };
  }

  function canMove(board) {
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if (board[r][c] === 0) return true;
        if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
        if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
      }
    }
    return false;
  }

  function move(state, direction, rng = Math.random) {
    const base = cloneState(state);
    const moved = applyMove(base.board, direction);
    const changed = !boardsEqual(base.board, moved.board);

    if (!changed) {
      base.gameOver = !canMove(base.board);
      return { state: base, changed: false, scoreGain: 0, mergedValues: [] };
    }

    const spawned = spawnRandom(moved.board, rng);
    const next = {
      board: spawned.board,
      score: base.score + moved.scoreGain,
      won2048: base.won2048 || moved.mergedValues.includes(2048),
      victoryAcknowledged: base.victoryAcknowledged,
      gameOver: false,
    };
    next.gameOver = !canMove(next.board);

    return {
      state: next,
      changed: true,
      scoreGain: moved.scoreGain,
      mergedValues: moved.mergedValues.slice(),
    };
  }

  function createGame(options = {}) {
    const rng = options.rng || Math.random;
    let board = emptyBoard();
    board = spawnRandom(board, rng).board;
    board = spawnRandom(board, rng).board;
    return {
      board,
      score: 0,
      won2048: false,
      victoryAcknowledged: false,
      gameOver: false,
    };
  }

  function restart(_state, rng = Math.random) {
    return createGame({ rng });
  }

  function acknowledgeVictory(state) {
    const next = cloneState(state);
    next.victoryAcknowledged = true;
    return next;
  }

  return {
    SIZE,
    createGame,
    move,
    spawnRandom,
    canMove,
    restart,
    acknowledgeVictory,
  };
});
