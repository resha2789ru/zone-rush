# Code Guide

## Architecture

The game is split into orchestration, systems, rendering, UI, entities, configs, and utilities.

- `core/` coordinates the match and loop
- `systems/` owns isolated gameplay responsibilities
- `render/` draws to canvas only
- `ui/` updates DOM overlays only
- `config/` holds constants

## Naming Conventions

- Use descriptive camelCase for functions and variables.
- Use PascalCase for classes like `Game`, `Player`, and `Bot`.
- Keep filenames aligned to their main responsibility.

## Where To Add New Systems

- Put new update-time gameplay logic in `src/systems/`.
- Call new systems from `src/core/game.js` in the correct update order.

## Where To Add Config Values

- Match and world constants go in `src/config/gameConfig.js`.
- Balance and combat values go in `src/config/balanceConfig.js`.
- Input mappings go in `src/config/controlsConfig.js`.

## Rendering Rules

- Rendering helpers should only draw.
- Do not mutate HP, movement, cooldowns, or spawn state from `src/render/`.
- Canvas visuals should receive current state and paint it.

## Update Loop Rules

- Keep update order explicit in `src/core/game.js`.
- Mutate state in systems and core only.
- Re-run HUD updates after gameplay systems change state.
- Keep end-condition checks near the end of the frame update.
