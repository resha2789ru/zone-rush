import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { distance } from '../utils/geometry.js';
import { rand } from '../utils/random.js';

// ==================================================
// SAFE ZONE AND ENVIRONMENTAL HAZARDS
// ==================================================

export function createSafeZone(centerX, centerY) {
  return {
    centerX,
    centerY,
    radius: GAME_CONFIG.zoneStartRadius,
    update(dt) {
      this.radius = Math.max(GAME_CONFIG.zoneMinRadius, this.radius - GAME_CONFIG.zoneShrinkRate * dt);
    },
    getProgress() {
      return (
        1 -
        (this.radius - GAME_CONFIG.zoneMinRadius) /
          (GAME_CONFIG.zoneStartRadius - GAME_CONFIG.zoneMinRadius)
      );
    },
  };
}

export function createTrap(x, y) {
  return {
    x,
    y,
    radius: BALANCE_CONFIG.trapRadius,
    phase: rand(0, Math.PI * 2),
  };
}

export function updateSafeZone(game, dt) {
  game.safeZone.update(dt);
}

export function applyZoneDamage(game, dt) {
  const progress = game.safeZone.getProgress();
  const zoneDamagePerSecond =
    BALANCE_CONFIG.zoneBaseDamagePerSecond +
    progress * BALANCE_CONFIG.zoneMaxBonusDamagePerSecond;

  for (const entity of [game.player, ...game.bots]) {
    if (!entity || !entity.alive) continue;
    const currentDistance = distance(entity.x, entity.y, game.safeZone.centerX, game.safeZone.centerY);
    const outside = currentDistance > game.safeZone.radius - entity.radius;
    if (outside) entity.takeDamage(zoneDamagePerSecond * dt);
  }
}

export function applyTrapDamage(game, dt) {
  for (const trap of game.traps) {
    for (const entity of [game.player, ...game.bots]) {
      if (!entity || !entity.alive) continue;
      if (distance(entity.x, entity.y, trap.x, trap.y) < trap.radius + entity.radius) {
        entity.takeDamage(BALANCE_CONFIG.trapDamagePerSecond * dt);
      }
    }
  }
}
