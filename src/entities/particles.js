// ==================================================
// VISUAL EFFECT ENTITIES
// ==================================================

export class Particle {
  constructor(x, y, vx, vy, life, size, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.color = color;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.life -= dt;
  }

  draw(ctx, camera) {
    if (this.life <= 0) return;
    const alpha = this.life / this.maxLife;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(sx, sy, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Explosion {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.life = 0.34;
    this.maxLife = 0.34;
  }

  update(dt) {
    this.life -= dt;
  }

  draw(ctx, camera) {
    if (this.life <= 0) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const progress = 1 - this.life / this.maxLife;
    const currentRadius = this.radius * (0.35 + progress * 0.8);
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha * 0.95;
    ctx.fillStyle = '#ff9e5c';
    ctx.beginPath();
    ctx.arc(sx, sy, currentRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ffe3ae';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(sx, sy, currentRadius * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
