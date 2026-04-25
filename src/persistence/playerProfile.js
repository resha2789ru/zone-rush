// ==================================================
// PLAYER PROFILE HELPERS
// ==================================================

export const PLAYER_PROFILE_KEYS = {
  guestId: 'zoneRushPlayerId',
  nickname: 'zoneRushNickname',
  bestScore: 'zoneRushBestScore',
  latestMatch: 'zoneRushLatestMatch',
  profileStats: 'zoneRushProfileStats',
  matchHistory: 'zoneRushMatchHistory',
};

export function normalizeNickname(value) {
  const trimmed = String(value || '').trim().replace(/\s+/g, ' ');
  if (trimmed === 'Guest') return 'Гость';
  return trimmed.slice(0, 24) || 'Гость';
}

export function generateGuestPlayerId() {
  return `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultProfile(playerId, nickname = 'Гость') {
  return {
    playerId,
    nickname: normalizeNickname(nickname),
    bestScore: 0,
    wins: 0,
    losses: 0,
    matchesPlayed: 0,
    totalKills: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    totalSurvivedSeconds: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function applyMatchToProfile(profile, participantStats) {
  const nextProfile = {
    ...profile,
    nickname: normalizeNickname(profile.nickname),
    bestScore: Math.max(profile.bestScore || 0, participantStats.score || 0),
    wins: (profile.wins || 0) + (participantStats.win ? 1 : 0),
    losses: (profile.losses || 0) + (participantStats.win ? 0 : 1),
    matchesPlayed: (profile.matchesPlayed || 0) + 1,
    totalKills: (profile.totalKills || 0) + (participantStats.kills || 0),
    totalDamageDealt: (profile.totalDamageDealt || 0) + Math.round(participantStats.damage_dealt || 0),
    totalDamageTaken: (profile.totalDamageTaken || 0) + Math.round(participantStats.damage_taken || 0),
    totalSurvivedSeconds:
      (profile.totalSurvivedSeconds || 0) + Math.round(participantStats.survived_seconds || 0),
    updatedAt: new Date().toISOString(),
  };

  return nextProfile;
}
