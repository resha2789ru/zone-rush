import { GAME_CONFIG } from '../config/gameConfig.js';
import { clamp } from '../utils/math.js';

// ==================================================
// CAMERA CONTROL
// ==================================================

export function applyCameraZoom(game) {
  game.userZoom = clamp(game.userZoom, GAME_CONFIG.minUserZoom, GAME_CONFIG.maxUserZoom);
  const minCameraZoom =
    Math.min(game.canvas.width / GAME_CONFIG.worldSize, game.canvas.height / GAME_CONFIG.worldSize) *
    0.98;
  const targetZoom = game.baseZoom * game.userZoom;
  game.camera.zoom = clamp(targetZoom, minCameraZoom, GAME_CONFIG.maxUserZoom);
}

export function updateCamera(game) {
  if (!game.player) return;

  const viewWidth = game.canvas.width / game.camera.zoom;
  const viewHeight = game.canvas.height / game.camera.zoom;
  const halfW = viewWidth / 2;
  const halfH = viewHeight / 2;
  game.camera.x = clamp(game.player.x - halfW, 0, Math.max(0, GAME_CONFIG.worldSize - viewWidth));
  game.camera.y = clamp(game.player.y - halfH, 0, Math.max(0, GAME_CONFIG.worldSize - viewHeight));
}
