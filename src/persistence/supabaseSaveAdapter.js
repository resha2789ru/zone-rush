import { withSupabaseTimeout } from '../services/supabaseClient.js';
// ==================================================
// SUPABASE SAVE ADAPTER
// ==================================================

function mapLeaderboardRows(rows) {
  return (rows || []).map((row, index) => ({
    rank: index + 1,
    nickname: row.nickname || 'Guest',
    score: row.score || 0,
    kills: row.kills || 0,
    survived_seconds: row.survived_seconds || 0,
    created_at: row.created_at || null,
  }));
}

async function upsertProfile(client, profile) {
  return withSupabaseTimeout(
    client.from('zone_rush_profiles').upsert(
      {
        player_id: profile.playerId,
        nickname: profile.nickname,
        best_score: profile.bestScore,
        wins: profile.wins,
        losses: profile.losses,
        matches_played: profile.matchesPlayed,
        total_kills: profile.totalKills,
        total_damage_dealt: profile.totalDamageDealt,
        total_damage_taken: profile.totalDamageTaken,
        total_survived_seconds: profile.totalSurvivedSeconds,
        updated_at: profile.updatedAt,
      },
      { onConflict: 'player_id' }
    )
  );
}

export function createSupabaseSaveAdapter(client, localAdapter) {
  async function getLeaderboard(limit = 10) {
    try {
      const { data, error } = await withSupabaseTimeout(
        client
          .from('zone_rush_scores')
          .select('nickname, score, kills, survived_seconds, created_at')
          .order('score', { ascending: false })
          .order('kills', { ascending: false })
          .order('survived_seconds', { ascending: false })
          .limit(limit)
      );

      if (error) throw error;
      return {
        ok: true,
        mode: 'supabase',
        rows: mapLeaderboardRows(data),
      };
    } catch (error) {
      console.warn('Leaderboard request failed, using local fallback.', error);
      return {
        ok: false,
        mode: 'local',
        rows: localAdapter.getLeaderboard(limit),
        message: 'Leaderboard unavailable',
      };
    }
  }

  async function saveMatch(payload) {
    const localResult = localAdapter.saveMatch(payload);
    const nextProfile = localResult.profile;

    try {
      const { error: matchError } = await withSupabaseTimeout(
        client.from('zone_rush_matches').insert(payload.matchRow)
      );
      if (matchError) throw matchError;

      const { error: participantsError } = await withSupabaseTimeout(
        client.from('zone_rush_match_players').insert(payload.participantRows)
      );
      if (participantsError) throw participantsError;

      const { error: scoreError } = await withSupabaseTimeout(
        client.from('zone_rush_scores').insert(payload.leaderboardRow)
      );
      if (scoreError) throw scoreError;

      const { error: profileError } = await upsertProfile(client, nextProfile);
      if (profileError) throw profileError;

      const leaderboard = await getLeaderboard();
      return {
        ...localResult,
        ok: true,
        mode: 'supabase',
        statusText: 'Saved online',
        leaderboard: leaderboard.rows,
      };
    } catch (error) {
      console.warn('Online save failed, keeping local save.', error);
      return {
        ...localResult,
        ok: false,
        mode: 'local',
        statusText: 'Online save failed, saved locally',
      };
    }
  }

  return {
    mode: 'supabase',
    ensurePlayerId: localAdapter.ensurePlayerId,
    getNickname: localAdapter.getNickname,
    setNickname: localAdapter.setNickname,
    getProfile: localAdapter.getProfile,
    getBestScore: localAdapter.getBestScore,
    setBestScore: localAdapter.setBestScore,
    getLatestMatch: localAdapter.getLatestMatch,
    getLeaderboard,
    saveMatch,
  };
}
