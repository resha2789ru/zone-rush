import { GAME_CONFIG } from '../config/gameConfig.js';
import { clamp } from '../utils/math.js';

// ==================================================
// MOBILE AND RESPONSIVE HELPERS
// ==================================================

export function detectTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
}

export function updateResponsiveUi(game) {
  game.dom.mobileControls.classList.toggle('active', game.isTouchDevice);
  game.baseZoom = game.isTouchDevice && game.canvas.height > game.canvas.width ? 0.72 : 1;
  game.applyCameraZoom();
}

export function updateViewportInsets() {
  const rootStyle = document.documentElement.style;
  const viewport = window.visualViewport;

  if (!viewport) {
    rootStyle.setProperty('--browser-ui-top', '0px');
    rootStyle.setProperty('--browser-ui-bottom', '0px');
    rootStyle.setProperty('--app-height', `${window.innerHeight}px`);
    return;
  }

  const topInset = Math.max(0, Math.round(viewport.offsetTop));
  const bottomInset = Math.max(
    0,
    Math.round(window.innerHeight - viewport.height - viewport.offsetTop)
  );

  rootStyle.setProperty('--browser-ui-top', `${topInset}px`);
  rootStyle.setProperty('--browser-ui-bottom', `${bottomInset}px`);
  rootStyle.setProperty('--app-height', `${Math.round(viewport.height)}px`);
}

export function resizeCanvas(game) {
  const rect = game.dom.app.getBoundingClientRect();
  const nextWidth = Math.max(320, Math.round(rect.width));
  const nextHeight = Math.max(180, Math.round(rect.height));

  if (game.canvas.width !== nextWidth || game.canvas.height !== nextHeight) {
    game.canvas.width = nextWidth;
    game.canvas.height = nextHeight;
    game.mouse.x = game.canvas.width * 0.5;
    game.mouse.y = game.canvas.height * 0.5;
  }
}

export function updateJoystickFromEvent(game, event) {
  const rect = game.dom.joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const maxRadius = rect.width * 0.32;
  const distance = Math.hypot(dx, dy);

  if (distance > maxRadius) {
    dx = (dx / distance) * maxRadius;
    dy = (dy / distance) * maxRadius;
  }

  game.touchMove.x = dx / maxRadius;
  game.touchMove.y = dy / maxRadius;
  game.dom.joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}

export function resetJoystick(game) {
  game.touchMove.active = false;
  game.touchMove.pointerId = null;
  game.touchMove.x = 0;
  game.touchMove.y = 0;
  game.dom.joystickKnob.style.transform = 'translate(-50%, -50%)';
}

function getCanvasTouchPosition(game, event) {
  const rect = game.canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function getTouchDistance(game) {
  const points = Array.from(game.touchPoints.values());
  if (points.length < 2) return 0;
  const [a, b] = points;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getDistanceFromTouches(game, touches) {
  if (!touches || touches.length < 2) return 0;
  const rect = game.canvas.getBoundingClientRect();
  const ax = touches[0].clientX - rect.left;
  const ay = touches[0].clientY - rect.top;
  const bx = touches[1].clientX - rect.left;
  const by = touches[1].clientY - rect.top;
  return Math.hypot(ax - bx, ay - by);
}

export function handleCanvasTouchPointer(game, event) {
  event.preventDefault();
  game.sound.unlock();
  game.touchPoints.set(event.pointerId, getCanvasTouchPosition(game, event));

  if (game.touchPoints.size >= 2) {
    const distance = getTouchDistance(game);
    if (!game.pinch.active) {
      game.pinch.active = true;
      game.pinch.startDistance = distance || 1;
      game.pinch.startZoom = game.userZoom;
    } else if (distance > 0) {
      game.userZoom = clamp(
        game.pinch.startZoom * (distance / game.pinch.startDistance),
        GAME_CONFIG.minUserZoom,
        GAME_CONFIG.maxUserZoom
      );
      game.applyCameraZoom();
    }
  }
}

export function releaseCanvasTouchPointer(game, event) {
  game.touchPoints.delete(event.pointerId);
  if (game.touchPoints.size < 2) {
    game.pinch.active = false;
    game.pinch.startDistance = 0;
    game.pinch.startZoom = game.userZoom;
  }
}

export function handleAppPinchTouch(game, event) {
  event.preventDefault();
  game.sound.unlock();

  const distance = getDistanceFromTouches(game, event.touches);
  if (!distance) return;

  if (!game.pinch.active) {
    game.pinch.active = true;
    game.pinch.startDistance = distance;
    game.pinch.startZoom = game.userZoom;
    return;
  }

  game.userZoom = clamp(
    game.pinch.startZoom * (distance / game.pinch.startDistance),
    GAME_CONFIG.minUserZoom,
    GAME_CONFIG.maxUserZoom
  );
  game.applyCameraZoom();
}

export function handleAppPinchEnd(game) {
  game.pinch.active = false;
  game.pinch.startDistance = 0;
  game.pinch.startZoom = game.userZoom;
}
