// ==================================================
// RUSSIAN UI LOCALIZATION HELPERS
// ==================================================

export const UI_TEXT = {
  ready: 'Готов',
  readyFemale: 'Готова',
  guest: 'Гость',
  bot: 'Бот',
  top10: 'Топ 10',
  leaderboard: 'Рейтинг',
  leaderboardUnavailable: 'Рейтинг недоступен',
  top10Leaderboard: 'Топ 10 рейтинга',
  showingLocalLeaderboard: 'Показан локальный рейтинг',
  savedOnline: 'Сохранено онлайн',
  savedLocally: 'Сохранено локально',
  savingOnline: 'Сохранение онлайн...',
  onlineSaveFailed: 'Онлайн-сохранение не удалось, сохранено локально',
  noMatchStats: 'Статистика матча пока недоступна.',
  victory: 'Победа',
  defeat: 'Поражение',
  timeUp: 'Время вышло',
  matchOver: 'Матч окончен',
  score: 'Очки',
  best: 'Рекорд',
  rank: 'Место',
  nickname: 'Никнейм',
  kills: 'Убийства',
  survived: 'Время',
  date: 'Дата',
  place: 'Место',
  player: 'Игрок',
  damage: 'Урон',
  result: 'Результат',
};

export const RESULT_REASON_LABELS = {
  win: 'Победа',
  death: 'Гибель',
  dead: 'Гибель',
  timeout: 'Время вышло',
  alive: 'Выжил',
  projectile: 'Снаряд',
  rocket_direct: 'Ракета',
  rocket_blast: 'Взрыв',
  collision: 'Столкновение',
  zone: 'Зона',
  trap: 'Ловушка',
  unknown: 'Неизвестно',
};

export function localizeResultReason(reason) {
  return RESULT_REASON_LABELS[reason] || reason || '-';
}

export function localizeNickname(nickname) {
  if (!nickname || nickname === 'Guest') return UI_TEXT.guest;
  return nickname.replace(/^Bot (\d+)$/u, `${UI_TEXT.bot} $1`);
}

export function localizeSaveStatus(statusText) {
  const map = {
    'Saved online': UI_TEXT.savedOnline,
    'Saved locally': UI_TEXT.savedLocally,
    'Saving online...': UI_TEXT.savingOnline,
    'Online save failed, saved locally': UI_TEXT.onlineSaveFailed,
  };

  return map[statusText] || statusText || UI_TEXT.savedLocally;
}

export function localizeLeaderboardStatus(statusText) {
  const map = {
    'Leaderboard unavailable': UI_TEXT.leaderboardUnavailable,
    'Top 10 leaderboard': UI_TEXT.top10Leaderboard,
    'Showing local leaderboard': UI_TEXT.showingLocalLeaderboard,
    'Loading leaderboard...': 'Загрузка рейтинга...',
  };

  return map[statusText] || statusText || UI_TEXT.top10Leaderboard;
}
