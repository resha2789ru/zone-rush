import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { Explosion } from '../entities/particles.js';
import { Projectile } from '../entities/projectile.js';
import { Rocket } from '../entities/rocket.js';
import { distance } from '../utils/geometry.js';
import {
  applyTrackedDamage,
  incrementRocketHit,
  incrementRocketsFired,
  incrementShotsFired,
  incrementShotsHit,
} from './statsSystem.js';

// ==================================================
// WEAPONS AND COMBAT RESOLUTION
// ==================================================

export function shootProjectile(game, player) {
  player.shootCooldown = BALANCE_CONFIG.playerShootCooldown;
  const muzzleDistance = player.radius + 8;
  const bulletX = player.x + player.lastDirX * muzzleDistance;
  const bulletY = player.y + player.lastDirY * muzzleDistance;
  const vx = player.lastDirX * BALANCE_CONFIG.projectileSpeed;
  const vy = player.lastDirY * BALANCE_CONFIG.projectileSpeed;

  const projectile = new Projectile(bulletX, bulletY, vx, vy);
  projectile.owner = player;
  game.projectiles.push(projectile);
  incrementShotsFired(game, player);
  game.spawnDashParticles(bulletX, bulletY, player.lastDirX, player.lastDirY, '#b5fdff', 5);
  game.sound.shoot();
}

export function shootRocket(game, player) {
  player.rocketCooldown = BALANCE_CONFIG.playerRocketCooldown;
  const muzzleDistance = player.radius + 12;
  const rocketX = player.x + player.lastDirX * muzzleDistance;
  const rocketY = player.y + player.lastDirY * muzzleDistance;
  const vx = player.lastDirX * BALANCE_CONFIG.rocketSpeed;
  const vy = player.lastDirY * BALANCE_CONFIG.rocketSpeed;

  const rocket = new Rocket(rocketX, rocketY, vx, vy);
  rocket.owner = player;
  rocket.statsHitCounted = false;
  game.rockets.push(rocket);
  incrementRocketsFired(game, player);
  game.spawnDashParticles(rocketX, rocketY, -player.lastDirX, -player.lastDirY, '#ffb36c', 10);
  game.sound.rocket();
}

export function explodeRocket(game, x, y, rocket = null) {
  game.explosions.push(new Explosion(x, y, BALANCE_CONFIG.rocketBlastRadius));
  game.spawnDashParticles(x, y, 0, 0, '#ff9d54', 36);
  game.spawnDashParticles(x, y, 0, 0, '#ffe0a8', 24);
  game.sound.explosion();

  let hitAnyTarget = false;
  for (const bot of game.bots) {
    if (!bot.alive) continue;
    const currentDistance = distance(x, y, bot.x, bot.y);
    if (currentDistance <= BALANCE_CONFIG.rocketBlastRadius) {
      const factor = 1 - currentDistance / BALANCE_CONFIG.rocketBlastRadius;
      const { actualDamage } = applyTrackedDamage(game, bot, BALANCE_CONFIG.rocketBlastDamage * factor, {
        attacker: rocket?.owner || null,
        reason: 'rocket_blast',
      });
      if (actualDamage > 0) hitAnyTarget = true;
    }
  }

  if (hitAnyTarget && rocket?.owner && !rocket.statsHitCounted) {
    rocket.statsHitCounted = true;
    incrementRocketHit(game, rocket.owner);
  }
}

export function updateProjectiles(game, dt) {
  for (const projectile of game.projectiles) {
    if (!projectile.alive) continue;
    projectile.update(dt);

    for (const bot of game.bots) {
      if (!bot.alive || !projectile.alive) continue;
      const currentDistance = distance(projectile.x, projectile.y, bot.x, bot.y);
      if (currentDistance <= bot.radius + projectile.radius) {
        const { actualDamage } = applyTrackedDamage(game, bot, BALANCE_CONFIG.projectileDamage, {
          attacker: projectile.owner || null,
          reason: 'projectile',
        });
        projectile.alive = false;
        const dx = bot.x - projectile.x;
        const dy = bot.y - projectile.y;
        game.spawnHitSparks(
          projectile.x,
          projectile.y,
          dx / (currentDistance || 1),
          dy / (currentDistance || 1)
        );
        if (actualDamage > 0 && projectile.owner) incrementShotsHit(game, projectile.owner);
        game.sound.hit();
      }
    }
  }

  game.projectiles = game.projectiles.filter((projectile) => projectile.alive);
}

export function updateRockets(game, dt) {
  for (const rocket of game.rockets) {
    if (!rocket.alive) continue;
    rocket.update(dt);

    const length = Math.hypot(rocket.vx, rocket.vy) || 1;
    const dirX = rocket.vx / length;
    const dirY = rocket.vy / length;
    game.spawnDashParticles(
      rocket.x - dirX * 10,
      rocket.y - dirY * 10,
      -dirX,
      -dirY,
      Math.random() > 0.45 ? '#ff9b48' : '#ffdba4',
      2
    );

    if (!rocket.alive) {
          explodeRocket(game, rocket.x, rocket.y, rocket);
          continue;
        }

    for (const bot of game.bots) {
      if (!bot.alive || !rocket.alive) continue;
      const currentDistance = distance(rocket.x, rocket.y, bot.x, bot.y);
      if (currentDistance <= bot.radius + rocket.radius) {
        const { actualDamage } = applyTrackedDamage(game, bot, BALANCE_CONFIG.rocketDirectDamage, {
          attacker: rocket.owner || null,
          reason: 'rocket_direct',
        });
        rocket.alive = false;
        if (actualDamage > 0 && rocket.owner && !rocket.statsHitCounted) {
          rocket.statsHitCounted = true;
          incrementRocketHit(game, rocket.owner);
        }
        explodeRocket(game, rocket.x, rocket.y, rocket);
      }
    }
  }

  game.rockets = game.rockets.filter((rocket) => rocket.alive);
}
