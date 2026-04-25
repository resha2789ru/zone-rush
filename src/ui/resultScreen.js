import { GAME_CONFIG } from '../config/gameConfig.js';
import { formatTime } from './hud.js';
import { renderLeaderboard, renderStatsTable } from './leaderboard.js';

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
  } else if (reason === 'timeout') {
    game.dom.resultTitle.textContent = 'Time Up';
    game.dom.resultText.textContent =
      `Match ended at ${formatTime(GAME_CONFIG.matchDuration)}. Try to eliminate all bots faster.`;
  } else {
    game.dom.resultTitle.textContent = 'Defeat';
    game.dom.resultText.textContent = `You survived ${formatTime(game.lastSurvived)}.`;
  }

  const playerSummary = game.uiState?.resultPlayerSummary;
  const bestScore = game.uiState?.bestScore || 0;
  const saveStatus = game.uiState?.saveStatusText || 'Saved locally';
  const leaderboardStatus = game.uiState?.leaderboardStatus || 'Top 10 leaderboard';

  if (game.dom.resultScore) {
    game.dom.resultScore.textContent = `Score: ${playerSummary?.score || 0}`;
  }
  if (game.dom.resultBest) {
    game.dom.resultBest.textContent = `Best: ${bestScore}`;
  }
  if (game.dom.resultSaveStatus) {
    game.dom.resultSaveStatus.textContent = saveStatus;
  }
  if (game.dom.resultLeaderboardStatus) {
    game.dom.resultLeaderboardStatus.textContent = leaderboardStatus;
  }

  renderStatsTable(game.dom.resultStatsTable, game.uiState?.resultStatsRows || []);
  renderLeaderboard(
    game.dom.resultLeaderboard,
    game.uiState?.resultLeaderboard || [],
    game.uiState?.leaderboardStatus || 'Leaderboard unavailable'
  );
}
