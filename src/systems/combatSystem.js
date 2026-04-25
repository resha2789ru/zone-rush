import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { Explosion } from '../entities/particles.js';
import { Projectile } from '../entities/projectile.js';
import { Rocket } from '../entities/rocket.js';
import { distance } from '../utils/geometry.js';

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

  game.projectiles.push(new Projectile(bulletX, bulletY, vx, vy));
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

  game.rockets.push(new Rocket(rocketX, rocketY, vx, vy));
  game.spawnDashParticles(rocketX, rocketY, -player.lastDirX, -player.lastDirY, '#ffb36c', 10);
  game.sound.rocket();
}

export function explodeRocket(game, x, y) {
  game.explosions.push(new Explosion(x, y, BALANCE_CONFIG.rocketBlastRadius));
  game.spawnDashParticles(x, y, 0, 0, '#ff9d54', 36);
  game.spawnDashParticles(x, y, 0, 0, '#ffe0a8', 24);
  game.sound.explosion();

  for (const bot of game.bots) {
    if (!bot.alive) continue;
    const currentDistance = distance(x, y, bot.x, bot.y);
    if (currentDistance <= BALANCE_CONFIG.rocketBlastRadius) {
      const factor = 1 - currentDistance / BALANCE_CONFIG.rocketBlastRadius;
      bot.takeDamage(BALANCE_CONFIG.rocketBlastDamage * factor);
    }
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
        bot.takeDamage(BALANCE_CONFIG.projectileDamage);
        projectile.alive = false;
        const dx = bot.x - projectile.x;
        const dy = bot.y - projectile.y;
        game.spawnHitSparks(
          projectile.x,
          projectile.y,
          dx / (currentDistance || 1),
          dy / (currentDistance || 1)
        );
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
      explodeRocket(game, rocket.x, rocket.y);
      continue;
    }

    for (const bot of game.bots) {
      if (!bot.alive || !rocket.alive) continue;
      const currentDistance = distance(rocket.x, rocket.y, bot.x, bot.y);
      if (currentDistance <= bot.radius + rocket.radius) {
        bot.takeDamage(BALANCE_CONFIG.rocketDirectDamage);
        rocket.alive = false;
        explodeRocket(game, rocket.x, rocket.y);
      }
    }
  }

  game.rockets = game.rockets.filter((rocket) => rocket.alive);
}
