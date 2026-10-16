(function () {
  'use strict';

  const Engine = window.TSG2048Engine;
  const Input = window.TSG2048Input;
  const BEST_KEY = 'tsg_2048_best_score';
  const SWIPE_THRESHOLD = 30;

  const TILE_CONFIG = {
    2: { asset: '../../assets/photos/tsg-01.png', fit: 'contain', position: '50% 50%', colors: ['#eee4da','#e4d3c1'] },
    4: { asset: '../../assets/photos/tsg-02.png', fit: 'contain', position: '50% 50%', colors: ['#ede0c8','#e6cba1'] },
    8: { asset: '../../assets/photos/tsg-03.png', fit: 'contain', position: '50% 48%', colors: ['#f2b179','#ed9f5f'] },
    16: { asset: '../../assets/photos/tsg-04.png', fit: 'contain', position: '50% 50%', colors: ['#f59563','#ed7d4d'] },
    32: { asset: '../../assets/photos/tsg-05.png', fit: 'contain', position: '50% 48%', colors: ['#f67c5f','#ea6245'] },
    64: { asset: '../../assets/photos/tsg-06.png', fit: 'contain', position: '50% 50%', colors: ['#f65e3b','#e94724'] },
    128: { asset: '../../assets/photos/tsg-07.png', fit: 'contain', position: '50% 50%', colors: ['#edcf72','#dfbd4f'] },
    256: { asset: '../../assets/photos/tsg-08.png', fit: 'contain', position: '50% 48%', colors: ['#edcc61','#dfb93d'] },
    512: { asset: '../../assets/photos/tsg-09.png', fit: 'contain', position: '50% 50%', colors: ['#edc850','#dbae2d'] },
    1024: { asset: '../../assets/photos/tsg-10.png', fit: 'contain', position: '50% 50%', colors: ['#edc53f','#dca917'] },
    2048: { asset: '../../assets/photos/tsg-11.png', fit: 'contain', position: '50% 50%', colors: ['#edc22e','#f09a2b'] },
    4096: { asset: '../../assets/photos/tsg-12.jpg', fit: 'cover', position: '50% 30%', colors: ['#bba1ff','#8e6ee7'] },
    8192: { asset: '../../assets/photos/tsg-13.jpg', fit: 'cover', position: '46% 32%', colors: ['#7ddbb1','#4eb88a'] },
    16384: { asset: '../../assets/photos/tsg-14.jpg', fit: 'cover', position: '50% 31%', colors: ['#66bff2','#3d8fd0'] },
  };

  let state;
  let bestScore = 0;
  let elements = {};
  let touchStart = null;
  let toastTimer = null;

  function safeStorageGet() {
    try {
      const value = Number(window.localStorage.getItem(BEST_KEY));
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch (_error) {
      return 0;
    }
  }

  function safeStorageSet(value) {
    try {
      window.localStorage.setItem(BEST_KEY, String(value));
    } catch (_error) {
      // Private browsing / denied storage: gameplay must continue in memory.
    }
  }

  function cacheElements() {
    elements = {
      board: document.getElementById('board'),
      score: document.getElementById('score'),
      best: document.getElementById('best-score'),
      victory: document.getElementById('victory-overlay'),
      gameover: document.getElementById('gameover-overlay'),
      toast: document.getElementById('tier-toast'),
    };
  }

  function tileMarkup(value, shouldPop) {
    const config = TILE_CONFIG[value];
    if (!config) {
      return `<div class="tile tile-mystery${shouldPop ? ' tile-pop' : ''}"><div class="tile-number">${value}<br>未知 TSG</div></div>`;
    }
    const [a, b] = config.colors;
    return `<div class="tile${shouldPop ? ' tile-pop' : ''}" style="--tile-a:${a};--tile-b:${b};--photo-fit:${config.fit};--photo-position:${config.position}">
      <div class="tile-photo"><img src="${config.asset}" alt="TSG ${value}" draggable="false"></div>
      <div class="tile-number">${value}</div>
    </div>`;
  }

  function renderBoard(mergedValues = []) {
    const popCounts = new Map();
    for (const value of mergedValues) popCounts.set(value, (popCounts.get(value) || 0) + 1);
    const fragments = [];
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        const value = state.board[r][c];
        let shouldPop = false;
        if (value && popCounts.get(value) > 0) {
          shouldPop = true;
          popCounts.set(value, popCounts.get(value) - 1);
        }
        fragments.push(`<div class="board-cell" data-row="${r}" data-col="${c}">${value ? tileMarkup(value, shouldPop) : ''}</div>`);
      }
    }
    elements.board.innerHTML = fragments.join('');
  }

  function updateBestScore() {
    if (state.score > bestScore) {
      bestScore = state.score;
      safeStorageSet(bestScore);
    }
  }

  function renderHud() {
    updateBestScore();
    elements.score.textContent = String(state.score);
    elements.best.textContent = String(bestScore);
  }

  function renderOverlays() {
    const showVictory = state.won2048 && !state.victoryAcknowledged;
    elements.victory.hidden = !showVictory;
    elements.gameover.hidden = showVictory || !state.gameOver;
  }

  function render(mergedValues = []) {
    renderBoard(mergedValues);
    renderHud();
    renderOverlays();
  }

  function showTierFeedback(value) {
    if (value < 4096) return;
    clearTimeout(toastTimer);
    const message = value === 16384 ? '✨ 16384 · 终极喝水 TSG！' : `⚡ TSG 进化至 ${value}！`;
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 1500);
  }

  function handleDirection(direction) {
    if (!direction || !state || (state.won2048 && !state.victoryAcknowledged) || state.gameOver) return false;
    const result = Engine.move(state, direction);
    state = result.state;
    if (!result.changed) {
      renderHud();
      renderOverlays();
      return false;
    }
    render(result.mergedValues);
    if (result.mergedValues.length) showTierFeedback(Math.max(...result.mergedValues));
    return true;
  }

  function restart() {
    state = Engine.restart(state);
    render();
  }

  function continueAfterWin() {
    state = Engine.acknowledgeVictory(state);
    render();
  }

  function onKeyDown(event) {
    const direction = Input.directionFromKey(event.key);
    if (!direction) return;
    event.preventDefault();
    handleDirection(direction);
  }

  function onTouchStart(event) {
    if (!event.touches || event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event) {
    if (!touchStart || !event.changedTouches || event.changedTouches.length !== 1) {
      touchStart = null;
      return;
    }
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    const direction = Input.directionFromSwipe(dx, dy, SWIPE_THRESHOLD);
    if (!direction) return;
    event.preventDefault();
    handleDirection(direction);
  }

  function wireEvents() {
    document.addEventListener('keydown', onKeyDown, { passive: false });
    elements.board.addEventListener('touchstart', onTouchStart, { passive: true });
    elements.board.addEventListener('touchend', onTouchEnd, { passive: false });

    document.querySelectorAll('[data-direction]').forEach((button) => {
      button.addEventListener('click', () => handleDirection(button.dataset.direction));
    });
    document.getElementById('restart-button').addEventListener('click', restart);
    document.getElementById('victory-restart-button').addEventListener('click', restart);
    document.getElementById('gameover-restart-button').addEventListener('click', restart);
    document.getElementById('continue-button').addEventListener('click', continueAfterWin);
  }

  function start() {
    cacheElements();
    bestScore = safeStorageGet();
    state = Engine.createGame();
    wireEvents();
    render();
  }

  window.TSG2048App = {
    start: start,
    handleDirection: handleDirection,
    restart: restart,
    continueAfterWin: continueAfterWin,
    __debugGetState: () => JSON.parse(JSON.stringify(state)),
    __debugSetState: (nextState) => { state = JSON.parse(JSON.stringify(nextState)); render(); },
    __tileConfig: TILE_CONFIG,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
