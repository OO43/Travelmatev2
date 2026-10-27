# Step 5: live TfL arrivals and service updates

Requires the existing TfL journey integration and Journey status/map patches.
This is a separate live snapshot; planned route times and journey/session state
are never overwritten by departure predictions.

## TravelmatePOC

```bash
git apply --check ~/Downloads/travelmate-live-updates-backend.patch
git apply ~/Downloads/travelmate-live-updates-backend.patch
```

Use the existing TFL_APP_KEY in TravelmatePOC/.env. No new credentials,
dependencies, database migration or Google API change is needed. Restart FastAPI
if reload is not active:

```bash
source .venv/bin/activate
python3 -m uvicorn travelmate_api.main:app --host 0.0.0.0 --port 8000 --reload
```

New endpoint:

```text
POST /api/v1/journeys/live-updates
```

Example request in /docs (line/stop must be valid TfL identifiers):

```json
{
  "legs": [
    {"leg_index": 1, "line_id": "jubilee", "stop_id": "940GZZLUWSM"}
  ]
}
```

The server requests arrivals for each boarding stop/line and current status for
the selected lines. It uses the fixed TfL HTTPS host and sanitises upstream
errors. Request IDs are validated, each request is capped at six transport legs,
and at most three upstream calls run at once. The endpoint returns independent
section states so service status can succeed while predictions fail, or vice
versa. A 200 response can contain unavailable sections: inspect `state`.

## Travelmatev2

```bash
git apply --check ~/Downloads/travelmate-live-updates-mobile.patch
git apply ~/Downloads/travelmate-live-updates-mobile.patch
npm run lint
npx tsc --noEmit
npx expo start --clear
```

Your existing mobile .env stays unchanged. No new npm package or native rebuild
is required for this increment. If earlier native dependencies are not installed
or included in your development build, finish those earlier installation steps.

## Phone test

1. Plan and confirm a fresh London bus or rail journey.
2. Open Journey status. A live card appears above Route map.
3. Check the line, boarding-stop name, predicted destination/platform and
   expected time for each transport leg. Refresh live updates manually.
4. Leave the screen open for over a minute and check that it refreshes.
5. Navigate away or background the app: requests stop. Return to refresh.
6. After a successful snapshot, disconnect the phone from the network and
   refresh. Old rows must remain explicitly marked outdated. Reconnect and
   refresh to recover. If there was no prior data, show an unavailable state.
7. Check long names and accessibility large-text mode; predicted times and
   destination/platform labels must remain within the card.

Keep FastAPI accessible at your current Mac LAN IP. The expected terminal line
is `POST /api/v1/journeys/live-updates ... 200 OK`.

## Meaning and limits

- Predictions describe arrivals at each boarding stop **now**. They do not
  describe the saved itinerary's selected future date or establish that a
  particular vehicle is the passenger's service.
- This first version requests all directions for the line at the stop. Actual
  destinations/platforms are displayed; the passenger must check them against
  their planned leg. It does not silently guess the right branch/platform.
- Empty predictions do not prove cancellation. Service-status details are
  displayed only when TfL supplies them; missing status is not labelled Good
  Service. Disruption text is line-wide, not necessarily specific to the exact
  portion travelled.
- Some TfL feeds or saved routes lack supported arrivals data. Short numeric
  Journey Planner ICS IDs cannot be used as NaPTAN arrival stop IDs. Those legs
  show unavailable/unsupported guidance while line status can still work.
- New departure and line snapshots are fetched every 60 seconds only while the
  screen is focused and the app active. In-flight requests are cancelled on
  background/blur; late responses cannot replace the new screen's data.
- After 120 seconds without a fresh snapshot, on a failed refresh, or when a
  prediction's source timestamp/expiry indicates old data, show Outdated rather
  than a misleading countdown. London timestamps remain visible.
- Successful empty snapshots replace old rows. Failed sections retain their own
  last successful data and original freshness timestamps. Retry does not make
  retained data fresh before a new successful response arrives.
- Snapshots stay in component state; no database table or AsyncStorage field is
  added. No continuous GPS tracking, staff integration, notifications, GTFS
  import or automatic itinerary replanning is added.
- Existing local API access/authentication limitations still apply. Add shared
  throttling/caching and authenticated access before broad deployment; this
  increment intentionally has no server cache that could reset data age.

## Checks

Backend:
```bash
python3 -m unittest test_live_updates test_places test_tfl_journey test_journey_map test_travelmate_api test_alert_policy_behaviour test_passenger_remaining_onboard_policy
```

Mobile:
```bash
node --test test_live_updates.cjs test_journey_names.cjs test_journey_map.cjs test_device_location.cjs test_places.cjs test_tfl_planner.cjs test_journey_display.cjs test_journey_preview.cjs
npm run lint
npx tsc --noEmit
```

Automated tests mock TfL and mobile lifecycle events. Real stop/feed coverage,
current API-key subscription and phone appearance require testing on your side.

TfL API reference: https://api.tfl.gov.uk/swagger/ui/index.html
