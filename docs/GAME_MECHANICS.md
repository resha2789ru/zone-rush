# Game Mechanics

## Match Rules

- Match length is capped at 3 minutes.
- The player starts near the center of the arena.
- Bots also spawn near the center, with spacing from the player spawn.

## Player Controls

- Move with `WASD` or `Arrow Keys`.
- Dash with `Space`.
- Shoot with left click or `F`.
- Fire a rocket with right click.

## HP

- The player starts with 100 HP.
- Bots have their own HP pool and visible HP bars.

## Dash

- Dash uses a cooldown.
- While dashing, the player moves faster and emits particles.

## Bullets

- Bullets travel quickly, expire after a short lifetime, and damage bots on hit.

## Rockets

- Rockets have a cooldown.
- A direct rocket hit is lethal to a bot.
- Rockets also create an explosion with blast damage falloff.

## Cooldowns

- Dash, shoot, and rocket cooldowns are tracked in the HUD.
- Rocket cooldown also drives a dedicated progress bar.

## Safe Zone

- The circular safe zone shrinks over time.
- Standing outside the zone causes damage over time.
- Zone damage scales up as the match progresses.

## Bots

- Bots wander and steer back toward safety when they drift too far from the zone center.
- Bots can die from bullets, rockets, traps, collisions, or zone damage.

## Win And Lose Conditions

- Win by being the last survivor.
- Lose by reaching 0 HP.
- If the timer expires, the match ends in timeout.

## Score And Statistics

- Score is calculated as `survived_seconds * 10 + kills * 100 + damage_dealt + win_bonus`.
- `win_bonus` is `1000` for a win and `0` otherwise.
- Match statistics are tracked for the human player and every bot.
- The result screen shows score, best score, save status, a participant table, and a leaderboard preview.

## Saving And Leaderboard

- The game creates a local guest player id and nickname for MVP progression.
- Local storage is always written first.
- If Supabase is configured and reachable, the game also writes match rows and leaderboard scores online.
- If Supabase fails or times out, the UI falls back to local save status without blocking gameplay.

## Mobile Controls

- Left joystick controls movement.
- On-screen buttons trigger Dash, Fire, and Rocket.
- Two-finger pinch adjusts zoom.
- Portrait and fullscreen mobile layouts are expected to stay supported.
