# Project Overview

## What Zone Rush Is

Zone Rush is a fast top-down browser arena game where the player survives inside a shrinking safe zone while eliminating AI bots.

## Current MVP Status

The MVP is playable and includes the menu, desktop and mobile controls, pinch zoom, dash, bullets, rockets, safe-zone pressure, bots, HUD cooldowns, synthesized sounds, result screens, and a three-minute match timer.

## Gameplay Loop

1. Start from the main menu.
2. Spawn into the arena near the center.
3. Move, dash, shoot, and use rockets to outlast bots.
4. Stay inside the shrinking safe zone.
5. Win by being the last survivor, or lose by death or timeout.

## Technical Approach

- Vanilla JavaScript ES modules
- HTML5 Canvas for rendering
- DOM overlays for menu, HUD, and result screens
- No framework, no build step, no runtime dependencies in the browser

## Current Constraints

- Browser-first architecture must remain simple and portable
- Rendering should stay separate from gameplay state updates
- Mobile input support is a core requirement, not a nice-to-have
- Refactors should preserve current MVP behavior
