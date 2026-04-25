// ==================================================
// LEADERBOARD DATA FLOW
// ==================================================

export async function refreshLeaderboard(game, options = {}) {
  if (!game.saveAdapter?.getLeaderboard) return [];

  const result = await game.saveAdapter.getLeaderboard(options.limit || 10);
  const rows = Array.isArray(result) ? result : result.rows || [];

  game.uiState.menuLeaderboard = rows;
  game.uiState.resultLeaderboard = rows;
  game.uiState.leaderboardStatus = Array.isArray(result)
    ? (game.saveAdapter.mode === 'local' ? 'Showing local leaderboard' : '')
    : result?.message || (rows.length > 0 ? '' : 'Leaderboard unavailable');

  if (typeof game.renderLeaderboardPanels === 'function') {
    game.renderLeaderboardPanels();
  }

  return rows;
}
