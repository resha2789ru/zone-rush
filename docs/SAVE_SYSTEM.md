# Save System

## Local Fallback

Zone Rush always keeps a local save layer in localStorage.

Stored values include:

- guest player id
- nickname
- best score
- latest match payload
- aggregate local profile stats
- recent local leaderboard rows

## Guest Identity

- Guest ids are stored under `zoneRushPlayerId`.
- Ids look like `guest_xxxxx`.
- Nickname defaults to `Guest`.
- Nickname is clamped to 24 characters.

## Save Flow

1. The game builds end-of-match stats and a deterministic score.
2. The local adapter stores the match payload first.
3. If Supabase is available, the Supabase adapter tries to write the same payload online.
4. If online save succeeds, the result screen shows `Saved online`.
5. If online save fails or times out, the result screen shows `Online save failed, saved locally`.

## Failure Behavior

- Supabase disabled: local only
- Supabase CDN missing: local only
- invalid publishable key: local only
- request timeout: local only
- insert/update error: local only

Gameplay never waits on Supabase before letting the player start a match.
