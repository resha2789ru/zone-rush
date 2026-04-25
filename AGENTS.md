# AGENTS.md

## Project Description

Zone Rush is a browser-based top-down survival arena game built with HTML5 Canvas and vanilla JavaScript ES modules. The project is intentionally lightweight and should stay framework-free unless a future task explicitly requires otherwise.

## How To Run

1. `npm install`
2. `npm start`
3. Open `http://127.0.0.1:4173`

Mobile layout checks:

1. Start the local server.
2. Run `npm run test:mobile`.

## Coding Rules

- Preserve current gameplay behavior unless a bug fix requires a change.
- Keep the browser build tool-free: no React, TypeScript, bundlers, or canvas libraries unless explicitly requested.
- Keep rendering code in `src/render/` draw-only.
- Put constants in `src/config/` when moving them is behavior-safe.
- Add short section comments for major gameplay areas, especially in `src/core/game.js`.
- Prefer focused modules over giant multi-purpose files.
- Keep files ASCII unless an existing file already needs something else.

## Important Systems

- `src/core/game.js`: match orchestration and update order
- `src/core/input.js`: keyboard, mouse, touch, joystick, and button binding
- `src/systems/mobileSystem.js`: pinch zoom, responsive sizing, viewport inset handling
- `src/systems/combatSystem.js`: bullets, rockets, explosions
- `src/systems/zoneSystem.js`: safe zone shrink and damage
- `src/systems/botSystem.js`: bot movement decisions
- `src/render/renderer.js`: top-level canvas rendering flow
- `src/ui/hud.js`: HUD text and cooldown display

## Common Edit Map

- Add or tune gameplay constants: `src/config/balanceConfig.js` or `src/config/gameConfig.js`
- Change player controls: `src/config/controlsConfig.js` and `src/core/input.js`
- Add a new weapon or attack behavior: `src/systems/combatSystem.js` plus `src/render/`
- Adjust bot behavior: `src/systems/botSystem.js`
- Change safe zone rules: `src/systems/zoneSystem.js`
- Update HUD or overlays: `src/ui/`
- Update canvas visuals: `src/render/`

## Warnings

- Do not break mobile controls.
- Re-check joystick, Dash, Fire, Rocket, pinch zoom, portrait layout, and fullscreen mobile layout after touch-related edits.
- Do not move state mutation into drawing helpers.
- Do not reintroduce a monolithic `game.js`.
