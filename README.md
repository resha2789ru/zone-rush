# Zone Rush


Zone Rush is a lightweight HTML5 Canvas survival arena game built with vanilla JavaScript and browser-native ES modules.

The current MVP also includes an optional Supabase-backed leaderboard and match statistics layer with a full localStorage fallback. If Supabase is disabled, slow, blocked, or misconfigured, gameplay still works and results are kept locally.

## Run

1. Install dependencies with `npm install`.
2. Start the local server with `npm start`.
3. Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

Opening `index.html` directly can work in some browsers, but the local server is the safest way to test modules and mobile checks.

## Controls

- Move: `WASD` or `Arrow Keys`
- Dash: `Space`
- Shoot: `Left Mouse Button` or `F`
- Rocket: `Right Mouse Button`
- Mobile: left joystick plus on-screen `Dash`, `Fire`, and `Rocket` buttons
- Mobile zoom: two-finger pinch

## Project Layout

- `src/main.js`: browser entrypoint
- `src/config/supabaseConfig.js`: optional frontend Supabase settings
- `src/core/`: orchestration, loop, state, input, camera
- `src/persistence/`: local and Supabase save adapters
- `src/services/`: browser service clients
- `src/entities/`: player, bots, rockets, projectiles, particles
- `src/systems/`: combat, zone, collision, bots, audio, mobile behavior, score, leaderboard, stats
- `src/render/`: canvas-only drawing code
- `src/ui/`: DOM HUD, menu, leaderboard, result, and mobile control helpers
- `styles/styles.css`: app styling
- `tools/`: local server and mobile test tooling
- `docs/`: project and architecture notes for future work

## Supabase Notes

- Use only the Supabase publishable / anon public key in frontend config.
- Never use a `service_role`, secret key, direct database password, or connection string in this static frontend.
- Frontend-only score submission is suitable for MVP and casual play, but it is not cheat-proof.

## Validation

- Run mobile layout checks with `npm run test:mobile`.
- Artifacts are written into `test-artifacts/screenshots/mobile`.
