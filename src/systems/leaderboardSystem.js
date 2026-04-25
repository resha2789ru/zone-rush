// ==================================================
// LEADERBOARD DATA FLOW
// ==================================================

function timeoutAfter(ms) {
  return new Promise((_, reject) => {
    window.setTimeout(() => {
      reject(new Error(`Leaderboard request timed out after ${ms}ms`));
    }, ms);
  });
}

function applyLeaderboardState(game, rows, status) {
  game.uiState.menuLeaderboard = rows;
  game.uiState.resultLeaderboard = rows;
  game.uiState.leaderboardStatus = status;

  if (typeof game.renderLeaderboardPanels === 'function') {
    game.renderLeaderboardPanels();
  }
}

export async function refreshLeaderboard(game, options = {}) {
  if (!game.saveAdapter?.getLeaderboard) {
    applyLeaderboardState(game, [], 'Leaderboard unavailable');
    return [];
  }

  const limit = options.limit || 10;
  const timeoutMs = options.timeoutMs || 6000;

  try {
    const result = await Promise.race([
      Promise.resolve(game.saveAdapter.getLeaderboard(limit)),
      timeoutAfter(timeoutMs),
    ]);
    const rows = Array.isArray(result) ? result : result.rows || [];
    const status = Array.isArray(result)
      ? (game.saveAdapter.mode === 'local' ? 'Showing local leaderboard' : '')
      : result?.message || (rows.length > 0 ? '' : 'Leaderboard unavailable');

    applyLeaderboardState(game, rows, status);
    return rows;
  } catch (error) {
    console.warn('Leaderboard refresh failed, continuing without online leaderboard.', error);
    applyLeaderboardState(game, [], 'Leaderboard unavailable');
    return [];
  }
}
