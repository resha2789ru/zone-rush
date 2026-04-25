import { calculateScore } from './scoreSystem.js';

// ==================================================
// MATCH STATISTICS TRACKING
// ==================================================

function createBaseStats(identity) {
  return {
    player_id: identity.playerId,
    nickname: identity.nickname,
    isHuman: identity.isHuman,
    kills: 0,
    deaths: 0,
    damage_dealt: 0,
    damage_taken: 0,
    shots_fired: 0,
    shots_hit: 0,
    rockets_fired: 0,
    rockets_hit: 0,
    dashes_used: 0,
    traps_triggered: 0,
    zone_damage_taken: 0,
    survived_seconds: 0,
    placement: 0,
    score: 0,
    win: false,
    result_reason: 'alive',
    created_at: new Date().toISOString(),
  };
}

function getStore(game) {
  if (!game.matchStats?.participants) {
    game.matchStats = {
      matchId: null,
      participants: new Map(),
      finalized: false,
      saveStatusText: '',
    };
  }
  return game.matchStats;
}

export function initializeMatchStats(game) {
  game.matchStats = {
    matchId: null,
    participants: new Map(),
    finalized: false,
    saveStatusText: '',
  };

  registerParticipant(game, game.player, {
    playerId: game.player.playerId,
    nickname: game.player.nickname,
    isHuman: true,
  });

  for (const bot of game.bots) {
    registerParticipant(game, bot, {
      playerId: bot.playerId,
      nickname: bot.nickname,
      isHuman: false,
    });
  }
}

export function registerParticipant(game, entity, identity) {
  const store = getStore(game);
  entity.playerId = identity.playerId;
  entity.nickname = identity.nickname;
  store.participants.set(identity.playerId, createBaseStats(identity));
}

export function getParticipantStats(game, entityOrId) {
  const store = getStore(game);
  const key = typeof entityOrId === 'string' ? entityOrId : entityOrId?.playerId;
  return key ? store.participants.get(key) || null : null;
}

export function incrementDashUsed(game, entity) {
  const stats = getParticipantStats(game, entity);
  if (stats) stats.dashes_used += 1;
}

export function incrementShotsFired(game, entity) {
  const stats = getParticipantStats(game, entity);
  if (stats) stats.shots_fired += 1;
}

export function incrementShotsHit(game, entity) {
  const stats = getParticipantStats(game, entity);
  if (stats) stats.shots_hit += 1;
}

export function incrementRocketsFired(game, entity) {
  const stats = getParticipantStats(game, entity);
  if (stats) stats.rockets_fired += 1;
}

export function incrementRocketHit(game, entity) {
  const stats = getParticipantStats(game, entity);
  if (stats) stats.rockets_hit += 1;
}

export function applyTrackedDamage(game, target, amount, options = {}) {
  if (!target?.alive || amount <= 0) {
    return { actualDamage: 0, wasKilled: false };
  }

  const attackerStats = getParticipantStats(game, options.attacker || options.attackerId);
  const targetStats = getParticipantStats(game, target);
  const previousHp = target.hp;
  const wasAlive = target.alive;
  target.takeDamage(amount);
  const actualDamage = Math.max(0, previousHp - target.hp);
  const wasKilled = wasAlive && !target.alive;

  if (attackerStats && actualDamage > 0) {
    attackerStats.damage_dealt += actualDamage;
  }

  if (targetStats && actualDamage > 0) {
    targetStats.damage_taken += actualDamage;
    if (options.reason === 'zone') targetStats.zone_damage_taken += actualDamage;
    if (options.reason === 'trap') targetStats.traps_triggered += 1;
  }

  if (wasKilled) {
    if (targetStats) {
      targetStats.deaths += 1;
      targetStats.result_reason = options.reason || 'dead';
      targetStats.survived_seconds = Math.round(game.elapsed || 0);
    }
    if (attackerStats && attackerStats.player_id !== target.playerId) {
      attackerStats.kills += 1;
    }
  }

  return { actualDamage, wasKilled };
}

export function finalizeMatchStats(game, endReason) {
  const store = getStore(game);
  if (store.finalized) return store;

  const participants = Array.from(store.participants.values()).map((stats) => {
    const entity =
      stats.player_id === game.player?.playerId
        ? game.player
        : game.bots.find((bot) => bot.playerId === stats.player_id);

    const survivedSeconds = Math.min(
      Math.round(game.elapsed),
      entity?.alive ? Math.round(game.elapsed) : Math.round(stats.survived_seconds || game.elapsed)
    );

    const win = stats.player_id === game.player.playerId ? endReason === 'win' : false;
    const resultReason = win
      ? 'win'
      : stats.deaths > 0
        ? stats.result_reason || 'death'
        : endReason === 'timeout'
          ? 'timeout'
          : entity?.alive
            ? 'alive'
            : 'death';

    return {
      ...stats,
      survived_seconds: survivedSeconds,
      win,
      result_reason: resultReason,
      score: calculateScore({
        survived_seconds: survivedSeconds,
        kills: stats.kills,
        damage_dealt: stats.damage_dealt,
        win,
      }),
    };
  });

  participants.sort((left, right) => {
    if ((right.win ? 1 : 0) !== (left.win ? 1 : 0)) return (right.win ? 1 : 0) - (left.win ? 1 : 0);
    if ((right.score || 0) !== (left.score || 0)) return (right.score || 0) - (left.score || 0);
    return (right.survived_seconds || 0) - (left.survived_seconds || 0);
  });

  participants.forEach((stats, index) => {
    stats.placement = index + 1;
  });

  store.participants = new Map(participants.map((stats) => [stats.player_id, stats]));
  store.finalized = true;
  return store;
}

export function buildMatchPersistencePayload(game, endReason) {
  const store = finalizeMatchStats(game, endReason);
  const participants = Array.from(store.participants.values());
  const playerSummary = participants.find((entry) => entry.player_id === game.player.playerId);
  const createdAt = new Date().toISOString();
  const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  store.matchId = matchId;

  return {
    matchId,
    playerSummary,
    matchRow: {
      match_id: matchId,
      mode: 'solo',
      duration_seconds: Math.round(game.elapsed),
      winner_player_id: playerSummary.win ? playerSummary.player_id : null,
      end_reason: endReason,
      created_at: createdAt,
    },
    participantRows: participants.map((stats) => ({
      match_id: matchId,
      player_id: stats.player_id,
      nickname: stats.nickname,
      placement: stats.placement,
      score: stats.score,
      survived_seconds: Math.round(stats.survived_seconds),
      kills: stats.kills,
      deaths: stats.deaths,
      damage_dealt: Math.round(stats.damage_dealt),
      damage_taken: Math.round(stats.damage_taken),
      shots_fired: stats.shots_fired,
      shots_hit: stats.shots_hit,
      rockets_fired: stats.rockets_fired,
      rockets_hit: stats.rockets_hit,
      dashes_used: stats.dashes_used,
      traps_triggered: stats.traps_triggered,
      zone_damage_taken: Math.round(stats.zone_damage_taken),
      win: stats.win,
      result_reason: stats.result_reason,
      created_at: createdAt,
    })),
    leaderboardRow: {
      player_id: playerSummary.player_id,
      nickname: playerSummary.nickname,
      match_id: matchId,
      score: playerSummary.score,
      placement: playerSummary.placement,
      survived_seconds: Math.round(playerSummary.survived_seconds),
      kills: playerSummary.kills,
      damage_dealt: Math.round(playerSummary.damage_dealt),
      win: playerSummary.win,
      reason: playerSummary.result_reason,
      created_at: createdAt,
    },
    resultRows: participants,
  };
}
