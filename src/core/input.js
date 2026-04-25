import { CONTROLS_CONFIG } from '../config/controlsConfig.js';
import {
  handleAppPinchEnd,
  handleAppPinchTouch,
  handleCanvasTouchPointer,
  releaseCanvasTouchPointer,
  resetJoystick,
  resizeCanvas,
  updateJoystickFromEvent,
  updateResponsiveUi,
  updateViewportInsets,
} from '../systems/mobileSystem.js';

// ==================================================
// INPUT BINDINGS
// ==================================================

export function bindInput(game) {
  const { app, canvas, joystick, dashBtn, shootBtn, rocketBtn, playBtn, playAgainBtn } = game.dom;

  window.addEventListener('keydown', (event) => {
    if (event.code === CONTROLS_CONFIG.dashCode) {
      event.preventDefault();
      game.sound.unlock();
      if (!event.repeat) game.dashQueued = true;
    }

    if (event.code === CONTROLS_CONFIG.quickShootCode) {
      event.preventDefault();
      game.sound.unlock();
      if (!event.repeat) game.shootQueued = true;
    }

    game.keys[event.key.toLowerCase()] = true;
  });

  window.addEventListener('keyup', (event) => {
    game.keys[event.key.toLowerCase()] = false;
  });

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    game.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
    game.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
    game.mouse.active = true;
  });

  canvas.addEventListener('mousedown', (event) => {
    game.sound.unlock();
    if (event.button === 0) {
      game.mouseDown = true;
      game.shootQueued = true;
    }
    if (event.button === 2) {
      event.preventDefault();
      game.rightMouseDown = true;
      game.rocketQueued = true;
    }
  });

  window.addEventListener('mouseup', (event) => {
    if (event.button === 0) game.mouseDown = false;
    if (event.button === 2) game.rightMouseDown = false;
  });

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  app.addEventListener('selectstart', (event) => event.preventDefault());
  app.addEventListener('dragstart', (event) => event.preventDefault());

  canvas.addEventListener('pointerdown', (event) => {
    if (!game.isTouchDevice || event.pointerType !== 'touch') return;
    handleCanvasTouchPointer(game, event);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!game.isTouchDevice || event.pointerType !== 'touch') return;
    handleCanvasTouchPointer(game, event);
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!game.isTouchDevice || event.pointerType !== 'touch') return;
    releaseCanvasTouchPointer(game, event);
  });
  canvas.addEventListener('pointercancel', (event) => {
    if (!game.isTouchDevice || event.pointerType !== 'touch') return;
    releaseCanvasTouchPointer(game, event);
  });

  app.addEventListener(
    'touchstart',
    (event) => {
      if (!game.isTouchDevice || event.touches.length < 2) return;
      handleAppPinchTouch(game, event);
    },
    { passive: false }
  );
  app.addEventListener(
    'touchmove',
    (event) => {
      if (!game.isTouchDevice || event.touches.length < 2) return;
      handleAppPinchTouch(game, event);
    },
    { passive: false }
  );
  app.addEventListener(
    'touchend',
    () => {
      if (!game.isTouchDevice) return;
      handleAppPinchEnd(game);
    },
    { passive: false }
  );
  app.addEventListener(
    'touchcancel',
    () => {
      if (!game.isTouchDevice) return;
      handleAppPinchEnd(game);
    },
    { passive: false }
  );

  for (const eventName of ['gesturestart', 'gesturechange', 'gestureend']) {
    app.addEventListener(
      eventName,
      (event) => {
        if (!game.isTouchDevice) return;
        event.preventDefault();
      },
      { passive: false }
    );
  }

  joystick.addEventListener('pointerdown', (event) => {
    if (!game.isTouchDevice) return;
    event.preventDefault();
    game.sound.unlock();
    game.touchMove.pointerId = event.pointerId;
    game.touchMove.active = true;
    joystick.setPointerCapture(event.pointerId);
    updateJoystickFromEvent(game, event);
  });
  joystick.addEventListener('pointermove', (event) => {
    if (!game.isTouchDevice || !game.touchMove.active || event.pointerId !== game.touchMove.pointerId) {
      return;
    }
    event.preventDefault();
    updateJoystickFromEvent(game, event);
  });
  joystick.addEventListener('pointerup', (event) => {
    if (!game.isTouchDevice || event.pointerId !== game.touchMove.pointerId) return;
    resetJoystick(game);
  });
  joystick.addEventListener('pointercancel', (event) => {
    if (!game.isTouchDevice || event.pointerId !== game.touchMove.pointerId) return;
    resetJoystick(game);
  });

  dashBtn.addEventListener('pointerdown', (event) => {
    if (!game.isTouchDevice) return;
    event.preventDefault();
    game.sound.unlock();
    game.dashQueued = true;
  });
  shootBtn.addEventListener('pointerdown', (event) => {
    if (!game.isTouchDevice) return;
    event.preventDefault();
    game.sound.unlock();
    game.shootQueued = true;
  });
  rocketBtn.addEventListener('pointerdown', (event) => {
    if (!game.isTouchDevice) return;
    event.preventDefault();
    game.sound.unlock();
    game.rocketQueued = true;
  });

  window.addEventListener('resize', () => {
    resizeCanvas(game);
    updateResponsiveUi(game);
    updateViewportInsets();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => updateViewportInsets());
    window.visualViewport.addEventListener('scroll', () => updateViewportInsets());
  }

  playBtn.addEventListener('click', () => {
    game.sound.unlock();
    game.start();
  });
  playAgainBtn.addEventListener('click', () => {
    game.sound.unlock();
    game.start();
  });

  if (game.dom.nicknameInput) {
    const applyNickname = () => game.applyNickname(game.dom.nicknameInput.value);
    game.dom.nicknameInput.addEventListener('change', applyNickname);
    game.dom.nicknameInput.addEventListener('blur', applyNickname);
  }
}
