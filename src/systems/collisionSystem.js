import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { applyTrackedDamage } from './statsSystem.js';

// ==================================================
// COLLISION AND CONTACT DAMAGE
// ==================================================

export function applyCollisionDamage(game, dt) {
  if (!game.player?.alive) return;

  for (const bot of game.bots) {
    if (!bot.alive) continue;

    const dx = bot.x - game.player.x;
    const dy = bot.y - game.player.y;
    const distance = Math.hypot(dx, dy) || 1;
    const minDistance = bot.radius + game.player.radius;

    if (distance < minDistance) {
      const overlap = minDistance - distance;
      const nx = dx / distance;
      const ny = dy / distance;

      game.player.x -= nx * overlap * 0.5;
      game.player.y -= ny * overlap * 0.5;
      bot.x += nx * overlap * 0.5;
      bot.y += ny * overlap * 0.5;

      applyTrackedDamage(game, game.player, BALANCE_CONFIG.playerBotCollisionDamagePerSecond * dt, {
        attacker: bot,
        reason: 'collision',
      });
      applyTrackedDamage(game, bot, BALANCE_CONFIG.playerBotCollisionDamagePerSecond * 0.75 * dt, {
        attacker: game.player,
        reason: 'collision',
      });
      game.spawnDashParticles(
        (game.player.x + bot.x) * 0.5,
        (game.player.y + bot.y) * 0.5,
        nx,
        ny,
        '#ff9d7b',
        1
      );
    }
  }
}
