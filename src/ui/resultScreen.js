import { GAME_CONFIG } from '../config/gameConfig.js';
import { formatTime } from './hud.js';
import { renderLeaderboard, renderStatsTable } from './leaderboard.js';
import {
  UI_TEXT,
  formatUiText,
  localizeLeaderboardStatus,
  localizeSaveStatus,
} from './localization.js';

// ==================================================
// RESULT SCREEN UI
// ==================================================

export function showResult(dom, visible) {
  dom.result.classList.toggle('visible', visible);
  dom.result.classList.toggle('hidden', !visible);
}

export function updateResultScreen(game, win, reason) {
  if (win) {
    game.dom.resultTitle.textContent = UI_TEXT.victory;
    game.dom.resultText.textContent = formatUiText(UI_TEXT.victoryMessage, {
      time: formatTime(game.lastSurvived),
    });
  } else if (reason === 'timeout') {
    game.dom.resultTitle.textContent = UI_TEXT.timeUp;
    game.dom.resultText.textContent = formatUiText(UI_TEXT.timeoutMessage, {
      time: formatTime(GAME_CONFIG.matchDuration),
    });
  } else {
    game.dom.resultTitle.textContent = UI_TEXT.defeat;
    game.dom.resultText.textContent = formatUiText(UI_TEXT.defeatMessage, {
      time: formatTime(game.lastSurvived),
    });
  }

  const playerSummary = game.uiState?.resultPlayerSummary;
  const bestScore = game.uiState?.bestScore || 0;
  const saveStatus = localizeSaveStatus(game.uiState?.saveStatusText || UI_TEXT.savedLocally);
  const leaderboardStatus = localizeLeaderboardStatus(
    game.uiState?.leaderboardStatus || UI_TEXT.top10Leaderboard
  );

  if (game.dom.resultScore) {
    game.dom.resultScore.textContent = `${UI_TEXT.score}: ${playerSummary?.score || 0}`;
  }
  if (game.dom.resultBest) {
    game.dom.resultBest.textContent = `${UI_TEXT.best}: ${bestScore}`;
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
    game.uiState?.leaderboardStatus || UI_TEXT.leaderboardUnavailable
  );
}
