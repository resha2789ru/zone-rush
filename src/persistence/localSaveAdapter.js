import {
  PLAYER_PROFILE_KEYS,
  applyMatchToProfile,
  createDefaultProfile,
  generateGuestPlayerId,
  normalizeNickname,
} from './playerProfile.js';

// ==================================================
// LOCAL STORAGE SAVE ADAPTER
// ==================================================

function readJson(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch (error) {
    console.warn(`Failed to read localStorage key ${key}.`, error);
    return fallbackValue;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write localStorage key ${key}.`, error);
  }
}

export function createLocalSaveAdapter() {
  function ensurePlayerId() {
    let playerId = localStorage.getItem(PLAYER_PROFILE_KEYS.guestId);
    if (!playerId) {
      playerId = generateGuestPlayerId();
      localStorage.setItem(PLAYER_PROFILE_KEYS.guestId, playerId);
    }
    return playerId;
  }

  function getNickname() {
    return normalizeNickname(localStorage.getItem(PLAYER_PROFILE_KEYS.nickname) || 'Guest');
  }

  function setNickname(nickname) {
    const safeNickname = normalizeNickname(nickname);
    localStorage.setItem(PLAYER_PROFILE_KEYS.nickname, safeNickname);

    const profile = getProfile();
    const nextProfile = { ...profile, nickname: safeNickname, updatedAt: new Date().toISOString() };
    writeJson(PLAYER_PROFILE_KEYS.profileStats, nextProfile);
    return safeNickname;
  }

  function getProfile() {
    const playerId = ensurePlayerId();
    const nickname = getNickname();
    const savedProfile = readJson(PLAYER_PROFILE_KEYS.profileStats, null);

    if (!savedProfile || savedProfile.playerId !== playerId) {
      const nextProfile = createDefaultProfile(playerId, nickname);
      writeJson(PLAYER_PROFILE_KEYS.profileStats, nextProfile);
      return nextProfile;
    }

    return {
      ...createDefaultProfile(playerId, nickname),
      ...savedProfile,
      playerId,
      nickname: normalizeNickname(savedProfile.nickname || nickname),
    };
  }

  function getBestScore() {
    return Math.max(0, Number(localStorage.getItem(PLAYER_PROFILE_KEYS.bestScore) || 0));
  }

  function setBestScore(bestScore) {
    const safeBestScore = Math.max(0, Math.round(bestScore || 0));
    localStorage.setItem(PLAYER_PROFILE_KEYS.bestScore, String(safeBestScore));

    const profile = getProfile();
    const nextProfile = {
      ...profile,
      bestScore: Math.max(profile.bestScore || 0, safeBestScore),
      updatedAt: new Date().toISOString(),
    };
    writeJson(PLAYER_PROFILE_KEYS.profileStats, nextProfile);
    return nextProfile.bestScore;
  }

  function getLatestMatch() {
    return readJson(PLAYER_PROFILE_KEYS.latestMatch, null);
  }

  function getLeaderboard(limit = 10) {
    const matchHistory = readJson(PLAYER_PROFILE_KEYS.matchHistory, []);
    const fallbackProfile = getProfile();

    if (matchHistory.length <= 0) {
      return [
        {
          rank: 1,
          nickname: fallbackProfile.nickname,
          score: fallbackProfile.bestScore || 0,
          kills: 0,
          survived_seconds: 0,
          created_at: fallbackProfile.updatedAt,
          isLocalFallback: true,
        },
      ].filter((row) => row.score > 0);
    }

    return matchHistory
      .slice()
      .sort((left, right) => {
        if ((right.score || 0) !== (left.score || 0)) return (right.score || 0) - (left.score || 0);
        if ((right.kills || 0) !== (left.kills || 0)) return (right.kills || 0) - (left.kills || 0);
        return (right.survived_seconds || 0) - (left.survived_seconds || 0);
      })
      .slice(0, limit)
      .map((row, index) => ({ ...row, rank: index + 1, isLocalFallback: true }));
  }

  function saveMatch(payload) {
    const matchHistory = readJson(PLAYER_PROFILE_KEYS.matchHistory, []);
    const playerSummary = payload.playerSummary;
    const profile = getProfile();
    const nextProfile = applyMatchToProfile(profile, playerSummary);

    writeJson(PLAYER_PROFILE_KEYS.latestMatch, payload);
    writeJson(PLAYER_PROFILE_KEYS.profileStats, nextProfile);
    localStorage.setItem(
      PLAYER_PROFILE_KEYS.bestScore,
      String(Math.max(nextProfile.bestScore || 0, playerSummary.score || 0))
    );
    writeJson(
      PLAYER_PROFILE_KEYS.matchHistory,
      [payload.leaderboardRow, ...matchHistory].slice(0, 25)
    );

    return {
      ok: true,
      mode: 'local',
      statusText: 'Saved locally',
      profile: nextProfile,
      leaderboard: getLeaderboard(),
      latestMatch: payload,
    };
  }

  return {
    mode: 'local',
    ensurePlayerId,
    getNickname,
    setNickname,
    getProfile,
    getBestScore,
    setBestScore,
    getLatestMatch,
    getLeaderboard,
    saveMatch,
  };
}
