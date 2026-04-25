# File Map

## Root

- `index.html`: app shell and browser entry
- `README.md`: quick start and structure summary
- `AGENTS.md`: guidance for future AI agents
- `package.json`: scripts and metadata
- `version.json`: manual version token file

## Source

- `src/main.js`: bootstraps the game
- `src/config/gameConfig.js`: match, world, zone, and zoom constants
- `src/config/balanceConfig.js`: combat, HP, speed, and cooldown values
- `src/config/controlsConfig.js`: keyboard mapping constants
- `src/core/game.js`: orchestration for match setup, update order, and end-state checks
- `src/core/loop.js`: animation frame loop
- `src/core/state.js`: initial state factory
- `src/core/input.js`: keyboard, mouse, touch, joystick, and button listeners
- `src/core/camera.js`: camera position and zoom rules

## Entities

- `src/entities/player.js`: base entity and player class
- `src/entities/bot.js`: bot class and bot direction choice
- `src/entities/projectile.js`: bullet movement and lifetime
- `src/entities/rocket.js`: rocket movement and lifetime
- `src/entities/particles.js`: particles and explosion visuals

## Systems

- `src/systems/combatSystem.js`: shooting, rockets, impacts, explosions
- `src/systems/zoneSystem.js`: safe zone shrink, zone damage, trap helpers
- `src/systems/collisionSystem.js`: player and bot contact resolution
- `src/systems/botSystem.js`: nearest-target lookup and bot movement
- `src/systems/audioSystem.js`: synthesized sound generation
- `src/systems/mobileSystem.js`: responsive canvas sizing, pinch zoom, joystick helpers

## Rendering

- `src/render/renderer.js`: top-level render dispatch
- `src/render/drawArena.js`: background, bounds, danger zone, traps
- `src/render/drawEntities.js`: player, bots, bullets, rockets
- `src/render/drawHud.js`: menu backdrop decoration
- `src/render/drawEffects.js`: particles and explosions

## UI

- `src/ui/menu.js`: menu visibility
- `src/ui/hud.js`: HUD visibility, timer, and cooldown text
- `src/ui/resultScreen.js`: result overlay state and text
- `src/ui/mobileControls.js`: mobile-control visibility

## Support Folders

- `styles/styles.css`: all styling
- `tools/local-server.js`: simple static file server
- `tools/mobile-check.js`: Playwright mobile layout check
- `test-artifacts/screenshots/`: captured screenshots and mobile reports
- `docs/`: project documentation for future contributors
