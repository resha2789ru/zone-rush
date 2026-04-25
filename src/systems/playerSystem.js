import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { CONTROLS_CONFIG } from '../config/controlsConfig.js';
import { findNearestBot } from './botSystem.js';
import { shootProjectile, shootRocket } from './combatSystem.js';
import { normalize } from '../utils/geometry.js';

// ==================================================
// PLAYER MOVEMENT AND ACTIONS
// ==================================================

export function updatePlayer(game, dt) {
  const player = game.player;
  if (!player?.alive) return;

  const up = CONTROLS_CONFIG.moveUp.some((key) => game.keys[key]);
  const down = CONTROLS_CONFIG.moveDown.some((key) => game.keys[key]);
  const left = CONTROLS_CONFIG.moveLeft.some((key) => game.keys[key]);
  const right = CONTROLS_CONFIG.moveRight.some((key) => game.keys[key]);

  let dirX = game.touchMove.active ? game.touchMove.x : 0;
  let dirY = game.touchMove.active ? game.touchMove.y : 0;

  if (up) dirY -= 1;
  if (down) dirY += 1;
  if (left) dirX -= 1;
  if (right) dirX += 1;

  const moveDirection = normalize(dirX, dirY);
  dirX = moveDirection.x;
  dirY = moveDirection.y;

  if (Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01) {
    player.lastDirX = dirX;
    player.lastDirY = dirY;
  }

  if (game.mouse.active) {
    const worldMouseX = game.mouse.x / game.camera.zoom + game.camera.x;
    const worldMouseY = game.mouse.y / game.camera.zoom + game.camera.y;
    const aimDirection = normalize(worldMouseX - player.x, worldMouseY - player.y);
    if (aimDirection.length > 10) {
      player.lastDirX = aimDirection.x;
      player.lastDirY = aimDirection.y;
    }
  }

  if (game.isTouchDevice) {
    const target = findNearestBot(game, player.x, player.y);
    if (target) {
      const aimDirection = normalize(target.x - player.x, target.y - player.y);
      if (aimDirection.length > 0) {
        player.lastDirX = aimDirection.x;
        player.lastDirY = aimDirection.y;
      }
    }
  }

  if (game.dashQueued && player.dashCooldown <= 0) {
    player.dashCooldown = BALANCE_CONFIG.playerDashCooldown;
    player.dashTimer = BALANCE_CONFIG.playerDashDuration;
    game.spawnDashParticles(player.x, player.y, player.lastDirX, player.lastDirY, '#88f7ff', 26);
    game.sound.dash();
  }
  game.dashQueued = false;

  if (player.dashCooldown > 0) player.dashCooldown -= dt;
  if (player.dashTimer > 0) player.dashTimer -= dt;
  if (player.shootCooldown > 0) player.shootCooldown -= dt;
  if (player.rocketCooldown > 0) player.rocketCooldown -= dt;

  if ((game.shootQueued || game.mouseDown) && player.shootCooldown <= 0) {
    shootProjectile(game, player);
  }
  if ((game.rocketQueued || game.rightMouseDown) && player.rocketCooldown <= 0) {
    shootRocket(game, player);
  }
  game.shootQueued = false;
  game.rocketQueued = false;

  const speed = player.dashTimer > 0 ? BALANCE_CONFIG.playerDashSpeed : BALANCE_CONFIG.playerSpeed;
  const moveX =
    Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01
      ? dirX
      : player.lastDirX * (player.dashTimer > 0 ? 1 : 0);
  const moveY =
    Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01
      ? dirY
      : player.lastDirY * (player.dashTimer > 0 ? 1 : 0);

  game.applyMovement(player, moveX, moveY, speed, dt);

  if (player.dashTimer > 0) {
    game.spawnDashParticles(player.x, player.y, -player.lastDirX, -player.lastDirY, '#5ce9ff', 2);
  }
}
