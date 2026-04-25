import { formatTime } from './hud.js';

// ==================================================
// LEADERBOARD UI
// ==================================================

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderLeaderboard(container, rows, emptyMessage = 'Leaderboard unavailable') {
  if (!container) return;

  if (!rows || rows.length <= 0) {
    container.innerHTML = `<div class="leaderboard-empty">${escapeHtml(emptyMessage)}</div>`;
    return;
  }

  const body = rows
    .map(
      (row) => `
        <tr>
          <td>${row.rank ?? '-'}</td>
          <td>${escapeHtml(row.nickname || 'Guest')}</td>
          <td>${row.score ?? 0}</td>
          <td>${row.kills ?? 0}</td>
          <td>${formatTime(row.survived_seconds || 0)}</td>
          <td>${formatDate(row.created_at)}</td>
        </tr>
      `
    )
    .join('');

  container.innerHTML = `
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Nickname</th>
          <th>Score</th>
          <th>Kills</th>
          <th>Survived</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

export function renderStatsTable(container, rows) {
  if (!container) return;

  if (!rows || rows.length <= 0) {
    container.innerHTML = '<div class="leaderboard-empty">No match statistics yet.</div>';
    return;
  }

  const body = rows
    .map(
      (row) => `
        <tr>
          <td>${row.placement}</td>
          <td>${escapeHtml(row.nickname || 'Guest')}</td>
          <td>${row.score}</td>
          <td>${row.kills}</td>
          <td>${Math.round(row.damage_dealt || 0)}</td>
          <td>${formatTime(row.survived_seconds || 0)}</td>
          <td>${escapeHtml(row.result_reason || '-')}</td>
        </tr>
      `
    )
    .join('');

  container.innerHTML = `
    <table class="leaderboard-table stats-table">
      <thead>
        <tr>
          <th>Place</th>
          <th>Player</th>
          <th>Score</th>
          <th>Kills</th>
          <th>Damage</th>
          <th>Survived</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}
