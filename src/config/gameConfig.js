// ==================================================
// WORLD AND MATCH CONFIGURATION
// ==================================================

export const GAME_CONFIG = {
  worldSize: 2200,
  matchDuration: 180,
  startingBots: 10,
  trapCount: 6,
  zoneStartRadius: 930,
  zoneMinRadius: 120,
  minUserZoom: 0.08,
  maxUserZoom: 3.4,
};

GAME_CONFIG.zoneShrinkRate =
  (GAME_CONFIG.zoneStartRadius - GAME_CONFIG.zoneMinRadius) / GAME_CONFIG.matchDuration;
