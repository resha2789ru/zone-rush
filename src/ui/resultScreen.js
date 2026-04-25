import { GAME_CONFIG } from '../config/gameConfig.js';
import { formatTime } from './hud.js';

// ==================================================
// RESULT SCREEN UI
// ==================================================

export function showResult(dom, visible) {
  dom.result.classList.toggle('visible', visible);
  dom.result.classList.toggle('hidden', !visible);
}

export function updateResultScreen(game, win, reason) {
  if (win) {
    game.dom.resultTitle.textContent = 'Victory';
    game.dom.resultText.textContent = `You outlasted everyone in ${formatTime(game.lastSurvived)}.`;
    return;
  }

  if (reason === 'timeout') {
    game.dom.resultTitle.textContent = 'Time Up';
    game.dom.resultText.textContent =
      `Match ended at ${formatTime(GAME_CONFIG.matchDuration)}. Try to eliminate all bots faster.`;
    return;
  }

  game.dom.resultTitle.textContent = 'Defeat';
  game.dom.resultText.textContent = `You survived ${formatTime(game.lastSurvived)}.`;
}
