import { GAME_CONFIG } from '../config/gameConfig.js';
import { detectTouchDevice } from '../systems/mobileSystem.js';

// ==================================================
// GAME STATE FACTORY
// ==================================================

export function createGameState(canvas) {
  return {
    worldSize: GAME_CONFIG.worldSize,
    state: 'menu',
    player: null,
    bots: [],
    safeZone: null,
    traps: [],
    particles: [],
    projectiles: [],
    rockets: [],
    explosions: [],
    camera: { x: 0, y: 0, zoom: 1 },
    baseZoom: 1,
    userZoom: 1,
    mouse: { x: canvas.width * 0.5, y: canvas.height * 0.5, active: false },
    touchMove: { active: false, x: 0, y: 0, pointerId: null },
    touchPoints: new Map(),
    pinch: { active: false, startDistance: 0, startZoom: 1 },
    elapsed: 0,
    lastTime: 0,
    dashQueued: false,
    shootQueued: false,
    mouseDown: false,
    rocketQueued: false,
    rightMouseDown: false,
    resultReason: 'lose',
    lastSurvived: 0,
    matchStats: null,
    uiState: {
      bestScore: 0,
      saveStatusText: '',
      leaderboardStatus: 'Loading leaderboard...',
      menuLeaderboard: [],
      resultLeaderboard: [],
      resultStatsRows: [],
      resultPlayerSummary: null,
    },
    keys: Object.create(null),
    isTouchDevice: detectTouchDevice(),
  };
}
