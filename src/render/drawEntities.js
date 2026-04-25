import { clamp } from '../utils/math.js';

// ==================================================
// ENTITY RENDERING
// ==================================================

export function drawEntity(game, entity, isPlayer = false) {
  if (!entity?.alive) return;

  const sx = entity.x - game.camera.x;
  const sy = entity.y - game.camera.y;
  const dirX = (isPlayer ? game.player.lastDirX : entity.lastDirX) || 0;
  const dirY = (isPlayer ? game.player.lastDirY : entity.lastDirY) || 1;
  const angle = Math.atan2(dirY, dirX) + Math.PI / 2;
  const bodyColor = isPlayer ? '#6df3ff' : '#ff7acb';
  const armorColor = isPlayer ? '#163a56' : '#5a2553';
  const glowColor = isPlayer ? '#67f4ff' : '#ff77cf';
  const renderRadius = entity.radius * (game.isTouchDevice ? 1.16 : 1.08);

  game.ctx.save();
  game.ctx.translate(sx, sy);
  game.ctx.rotate(angle);
  game.ctx.shadowColor = glowColor;
  game.ctx.shadowBlur = isPlayer ? 18 : 12;

  game.ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  game.ctx.beginPath();
  game.ctx.ellipse(0, renderRadius * 0.8, renderRadius * 0.9, renderRadius * 0.56, 0, 0, Math.PI * 2);
  game.ctx.fill();

  game.ctx.fillStyle = armorColor;
  game.ctx.beginPath();
  game.ctx.ellipse(0, renderRadius * 0.12, renderRadius * 0.82, renderRadius * 1.02, 0, 0, Math.PI * 2);
  game.ctx.fill();

  game.ctx.fillStyle = bodyColor;
  game.ctx.beginPath();
  game.ctx.ellipse(0, renderRadius * 0.1, renderRadius * 0.56, renderRadius * 0.76, 0, 0, Math.PI * 2);
  game.ctx.fill();

  game.ctx.fillStyle = armorColor;
  game.ctx.beginPath();
  game.ctx.arc(-renderRadius * 0.55, renderRadius * 0.02, renderRadius * 0.22, 0, Math.PI * 2);
  game.ctx.arc(renderRadius * 0.55, renderRadius * 0.02, renderRadius * 0.22, 0, Math.PI * 2);
  game.ctx.fill();

  game.ctx.fillStyle = '#ffd7b5';
  game.ctx.beginPath();
  game.ctx.arc(0, -renderRadius * 0.76, renderRadius * 0.4, 0, Math.PI * 2);
  game.ctx.fill();

  game.ctx.strokeStyle = '#f5fbff';
  game.ctx.lineWidth = game.isTouchDevice ? 3.8 : 3;
  game.ctx.lineCap = 'round';
  game.ctx.beginPath();
  game.ctx.moveTo(0, -renderRadius * 0.04);
  game.ctx.lineTo(0, -renderRadius * 1.28);
  game.ctx.stroke();

  if (isPlayer) {
    game.ctx.strokeStyle = '#9efcff';
    game.ctx.lineWidth = game.isTouchDevice ? 4.2 : 3.4;
    game.ctx.beginPath();
    game.ctx.moveTo(0, -renderRadius * 1.28);
    game.ctx.lineTo(0, -renderRadius * 1.62);
    game.ctx.stroke();
  }

  game.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  game.ctx.lineWidth = 1.4;
  game.ctx.beginPath();
  game.ctx.arc(0, 0, renderRadius * 0.92, 0, Math.PI * 2);
  game.ctx.stroke();
  game.ctx.restore();

  if (!isPlayer) {
    const hpRatio = clamp(entity.hp / entity.maxHp, 0, 1);
    const barW = 28;
    const barH = 5;
    const barX = sx - barW * 0.5;
    const barY = sy - renderRadius - 16;

    game.ctx.save();
    game.ctx.fillStyle = 'rgba(4, 10, 24, 0.85)';
    game.ctx.fillRect(barX, barY, barW, barH);
    game.ctx.fillStyle = hpRatio > 0.45 ? '#6eff9d' : hpRatio > 0.2 ? '#ffd773' : '#ff6f7c';
    game.ctx.fillRect(barX, barY, barW * hpRatio, barH);
    game.ctx.strokeStyle = 'rgba(180, 226, 255, 0.7)';
    game.ctx.lineWidth = 1;
    game.ctx.strokeRect(barX, barY, barW, barH);
    game.ctx.restore();
  }
}

export function drawProjectile(game, projectile) {
  const sx = projectile.x - game.camera.x;
  const sy = projectile.y - game.camera.y;
  game.ctx.save();
  game.ctx.shadowColor = '#92f8ff';
  game.ctx.shadowBlur = 12;
  game.ctx.fillStyle = '#d8feff';
  game.ctx.beginPath();
  game.ctx.arc(sx, sy, projectile.radius, 0, Math.PI * 2);
  game.ctx.fill();
  game.ctx.restore();
}

export function drawRocket(game, rocket) {
  const sx = rocket.x - game.camera.x;
  const sy = rocket.y - game.camera.y;
  const angle = Math.atan2(rocket.vy, rocket.vx);
  const pulse = 0.8 + Math.sin(performance.now() / 80) * 0.2;

  game.ctx.save();
  game.ctx.translate(sx, sy);
  game.ctx.rotate(angle);
  game.ctx.shadowColor = '#ffb366';
  game.ctx.shadowBlur = 12;
  game.ctx.fillStyle = '#ffc988';
  game.ctx.beginPath();
  game.ctx.moveTo(10, 0);
  game.ctx.lineTo(-8, -4.5);
  game.ctx.lineTo(-8, 4.5);
  game.ctx.closePath();
  game.ctx.fill();

  game.ctx.fillStyle = '#ff6f5f';
  game.ctx.beginPath();
  game.ctx.moveTo(-8, -3.2);
  game.ctx.lineTo(-14 - pulse * 4, 0);
  game.ctx.lineTo(-8, 3.2);
  game.ctx.closePath();
  game.ctx.fill();
  game.ctx.restore();
}
