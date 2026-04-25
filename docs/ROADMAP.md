# Roadmap

## MVP Stabilization

- Finish reducing orchestration size in `src/core/game.js`
- Add lightweight smoke checks for desktop gameplay flow
- Keep mobile controls stable during refactors
- Monitor Supabase request failure rates and fallback UX on slow networks

## Content Expansion

- Add new weapons and combat variations
- Add arena hazards and pickups
- Improve encounter variety
- Expand leaderboard and profile screens beyond the current MVP preview

## Mobile Polish

- Refine touch feedback
- Improve button readability on small screens
- Tune mobile camera behavior per device size

## Multiplayer Prototype

- Isolate simulation assumptions
- Evaluate networking approach later
- Prototype simple synced arena matches

## Long-Term Improvements

- Additional maps
- Settings and accessibility options
- Better bots and progression systems
- Move trusted competitive leaderboard validation into a Supabase Edge Function or Cloudflare Worker
