import { formatTime } from './hud.js';
import {
  UI_TEXT,
  localizeLeaderboardStatus,
  localizeNickname,
  localizeResultReason,
} from './localization.js';

// ==================================================
// LEADERBOARD UI
// ==================================================

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ru-RU');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderLeaderboard(container, rows, emptyMessage = UI_TEXT.leaderboardUnavailable) {
  if (!container) return;

  if (!rows || rows.length <= 0) {
    container.innerHTML = `<div class="leaderboard-empty">${escapeHtml(localizeLeaderboardStatus(emptyMessage))}</div>`;
    return;
  }

  const body = rows
    .map(
      (row) => `
        <tr>
          <td>${row.rank ?? '-'}</td>
          <td>${escapeHtml(localizeNickname(row.nickname || UI_TEXT.guest))}</td>
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
          <th>${UI_TEXT.rank}</th>
          <th>${UI_TEXT.nickname}</th>
          <th>${UI_TEXT.score}</th>
          <th>${UI_TEXT.kills}</th>
          <th>${UI_TEXT.survived}</th>
          <th>${UI_TEXT.date}</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

export function renderStatsTable(container, rows) {
  if (!container) return;

  if (!rows || rows.length <= 0) {
    container.innerHTML = `<div class="leaderboard-empty">${UI_TEXT.noMatchStats}</div>`;
    return;
  }

  const body = rows
    .map(
      (row) => `
        <tr>
          <td>${row.placement}</td>
          <td>${escapeHtml(localizeNickname(row.nickname || UI_TEXT.guest))}</td>
          <td>${row.score}</td>
          <td>${row.kills}</td>
          <td>${Math.round(row.damage_dealt || 0)}</td>
          <td>${formatTime(row.survived_seconds || 0)}</td>
          <td>${escapeHtml(localizeResultReason(row.result_reason || '-'))}</td>
        </tr>
      `
    )
    .join('');

  container.innerHTML = `
    <table class="leaderboard-table stats-table">
      <thead>
        <tr>
          <th>${UI_TEXT.place}</th>
          <th>${UI_TEXT.player}</th>
          <th>${UI_TEXT.score}</th>
          <th>${UI_TEXT.kills}</th>
          <th>${UI_TEXT.damage}</th>
          <th>${UI_TEXT.survived}</th>
          <th>${UI_TEXT.result}</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}
