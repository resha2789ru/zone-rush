# Match Stats

## Tracked Stats

Tracked values include:

- kills
- deaths
- damage_dealt
- damage_taken
- shots_fired
- shots_hit
- rockets_fired
- rockets_hit
- dashes_used
- traps_triggered
- zone_damage_taken
- survived_seconds
- placement
- score
- win
- result_reason

## Score Formula

Score is calculated in [scoreSystem.js](/C:/dev/ZoneRush/zone-rush/src/systems/scoreSystem.js):

```text
score = survived_seconds * 10 + kills * 100 + damage_dealt + win_bonus
win_bonus = 1000 if win else 0
```

The final score is rounded and clamped to `0..100000`.

## Participant Rows

- One participant row is generated for the human player.
- One participant row is generated for every bot.
- Bots use stable ids like `bot_1`, `bot_2`, and nicknames like `Bot 1`.

## Supabase Tables Used

- `zone_rush_matches`: one row per match
- `zone_rush_match_players`: one row per participant
- `zone_rush_scores`: fast leaderboard row for the human player
- `zone_rush_profiles`: aggregate profile totals for the guest player

## Known MVP Limitations

- Stats are client-calculated.
- Online save is not cheat-proof.
- Trap contact counts are tracked per damage event, not as a deep collision history.
- Bot statistics are best-effort and use `0` when a more precise source is not available.
