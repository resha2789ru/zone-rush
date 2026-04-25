# Supabase Setup

## Project URL

- `https://mvgxejvsrvjgvwbrxkcm.supabase.co`

## Which Key To Use

- Use only the Supabase publishable / anon public key in [src/config/supabaseConfig.js](/C:/dev/ZoneRush/zone-rush/src/config/supabaseConfig.js).

## Which Keys Not To Use

- Do not use `service_role`.
- Do not use a secret key.
- Do not use a database password.
- Do not use a direct database connection string.

## Existing Tables

- `zone_rush_profiles`
- `zone_rush_matches`
- `zone_rush_match_players`
- `zone_rush_scores`

## Environment Assumptions

- Data API is enabled.
- RLS is enabled.
- Required table policies are already configured.

## Policy Summary

- `zone_rush_profiles`: `SELECT`, `INSERT`, `UPDATE`
- `zone_rush_matches`: `SELECT`, `INSERT`
- `zone_rush_match_players`: `SELECT`, `INSERT`
- `zone_rush_scores`: `SELECT`, `INSERT`

## Frontend Behavior

- If Supabase config is disabled, the game uses localStorage only.
- If the CDN client is missing, the game uses localStorage only.
- If a request takes longer than the configured timeout, the game treats it as failed and keeps the local save.

## Reachability Test

- Test URL: [zone_rush_scores REST endpoint](https://mvgxejvsrvjgvwbrxkcm.supabase.co/rest/v1/zone_rush_scores?select=*)

Opening that URL without an API key may show an API key error. That is normal. The useful signal is whether the Supabase domain itself is reachable.

## How To Disable Supabase

Edit [src/config/supabaseConfig.js](/C:/dev/ZoneRush/zone-rush/src/config/supabaseConfig.js) and set:

```js
enabled: false
```

## Russia / Connectivity Note

Supabase reachability can vary depending on region, ISP, browser restrictions, VPN use, or local filtering. This project is designed so gameplay continues and results are saved locally when online calls fail.

## Security Note

Frontend-only Supabase score submission is suitable for MVP and casual play. It is not cheat-proof. Players can manipulate score submissions from DevTools. RLS limits access and value ranges but does not prove match integrity. For a trusted leaderboard later, validate results in a Supabase Edge Function or Cloudflare Worker before writing to the database.
