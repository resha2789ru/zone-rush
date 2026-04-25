// ==================================================
// ARENA RENDERING
// ==================================================

export function drawBackground(game) {
  const viewWidth = game.canvas.width / game.camera.zoom;
  const viewHeight = game.canvas.height / game.camera.zoom;
  const gradient = game.ctx.createLinearGradient(0, 0, viewWidth, viewHeight);
  gradient.addColorStop(0, '#090f24');
  gradient.addColorStop(0.5, '#0b1734');
  gradient.addColorStop(1, '#080c1a');
  game.ctx.fillStyle = gradient;
  game.ctx.fillRect(0, 0, viewWidth, viewHeight);

  const gridSize = 70;
  const startX = -((game.camera.x % gridSize) + gridSize);
  const startY = -((game.camera.y % gridSize) + gridSize);

  game.ctx.save();
  game.ctx.strokeStyle = 'rgba(78, 246, 255, 0.08)';
  game.ctx.lineWidth = 1;

  for (let x = startX; x < viewWidth + gridSize; x += gridSize) {
    game.ctx.beginPath();
    game.ctx.moveTo(x, 0);
    game.ctx.lineTo(x, viewHeight);
    game.ctx.stroke();
  }

  for (let y = startY; y < viewHeight + gridSize; y += gridSize) {
    game.ctx.beginPath();
    game.ctx.moveTo(0, y);
    game.ctx.lineTo(viewWidth, y);
    game.ctx.stroke();
  }

  game.ctx.restore();
}

export function drawMapBounds(game) {
  const x = -game.camera.x;
  const y = -game.camera.y;
  game.ctx.save();
  game.ctx.strokeStyle = 'rgba(120, 170, 255, 0.35)';
  game.ctx.lineWidth = 4;
  game.ctx.strokeRect(x, y, game.worldSize, game.worldSize);
  game.ctx.restore();
}

export function drawDangerZone(game) {
  const viewWidth = game.canvas.width / game.camera.zoom;
  const viewHeight = game.canvas.height / game.camera.zoom;
  const sx = game.safeZone.centerX - game.camera.x;
  const sy = game.safeZone.centerY - game.camera.y;
  const pulse = 0.08 + 0.05 * Math.sin(performance.now() / 260);

  game.ctx.save();
  game.ctx.fillStyle = `rgba(255, 45, 98, ${0.14 + pulse})`;
  game.ctx.beginPath();
  game.ctx.rect(0, 0, viewWidth, viewHeight);
  game.ctx.arc(sx, sy, game.safeZone.radius, 0, Math.PI * 2, true);
  game.ctx.fill('evenodd');

  game.ctx.strokeStyle = 'rgba(255, 112, 152, 0.95)';
  game.ctx.shadowColor = '#ff4a7f';
  game.ctx.shadowBlur = 16;
  game.ctx.lineWidth = 5;
  game.ctx.beginPath();
  game.ctx.arc(sx, sy, game.safeZone.radius, 0, Math.PI * 2);
  game.ctx.stroke();
  game.ctx.restore();
}

export function drawTrap(game, trap) {
  const sx = trap.x - game.camera.x;
  const sy = trap.y - game.camera.y;
  const pulse = 1 + Math.sin(performance.now() / 260 + trap.phase) * 0.14;

  game.ctx.save();
  game.ctx.shadowColor = '#ff7a3f';
  game.ctx.shadowBlur = 14;
  game.ctx.fillStyle = 'rgba(255, 124, 61, 0.74)';
  game.ctx.beginPath();
  game.ctx.arc(sx, sy, trap.radius * pulse, 0, Math.PI * 2);
  game.ctx.fill();

  game.ctx.strokeStyle = 'rgba(255, 235, 178, 0.9)';
  game.ctx.lineWidth = 2;
  game.ctx.beginPath();
  game.ctx.arc(sx, sy, trap.radius * 0.66 * pulse, 0, Math.PI * 2);
  game.ctx.stroke();
  game.ctx.restore();
}
