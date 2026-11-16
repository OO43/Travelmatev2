# TransportAPI integration and rollback

This is an optional provider alongside the existing TfL integration. No database
migration, new dependency or destructive data reset is required.

## Preserve your actual Mac checkout first

The accompanying `travelmate-before-transportapi.zip` preserves the source available
when this integration was built. Your Mac may contain newer edits or custom styles.
Before applying anything, commit the current changes in **both repositories** using
GitHub Desktop, then run this in each repository:

```bash
git tag travelmate-before-transportapi
```

Keep `.env` files private; the source backup intentionally excludes credentials,
databases, node_modules, virtual environments and Git history. The snapshot is not
a PostgreSQL backup. The forward patches apply only this integration, and the
rollback patches reverse only it. Neither should overwrite unrelated work.

## Apply in the right repositories

In **TravelmatePOC**:

```bash
git apply --check ~/Downloads/travelmate-transportapi-backend.patch
git apply ~/Downloads/travelmate-transportapi-backend.patch
```

In **Travelmatev2**:

```bash
git apply --check ~/Downloads/travelmate-transportapi-mobile.patch
git apply ~/Downloads/travelmate-transportapi-mobile.patch
```

If a check fails, stop and share its output. Do not use `--reject`, force an apply,
or replace complete files with older copies; local customisations may differ.

## Configure backend credentials

Create a TransportAPI developer application at https://developer.transportapi.com/.
Use its **app_id and app_key**, not the existing TfL or Google keys. Add these to
**TravelmatePOC/.env** (not to the mobile app):

```dotenv
TRANSPORTAPI_APP_ID=your_app_id
TRANSPORTAPI_APP_KEY=your_app_key
TRANSPORTAPI_SERVICE=silverrail
```

The selected engine must be included in your subscription. The current official
documentation says `silverrail` covers the country; `traveline` focuses on SW
England; `tfl` covers Greater London. `transportapi_otp` is analytics/bulk-only on
request. An empty service uses TransportAPI's regional default; it does **not**
guarantee nationwide coverage. Do not change engines randomly to bypass access
errors; confirm which product and engine your account can use.

Restart FastAPI from TravelmatePOC with your existing virtual environment:

```bash
python3 -m uvicorn travelmate_api.main:app --host 0.0.0.0 --port 8000 --reload
```

## Enable on mobile

Set this in **Travelmatev2/.env**, keeping your existing API URL:

```dotenv
EXPO_PUBLIC_JOURNEY_PROVIDER=transportapi
```

Then run:

```bash
npx expo start --clear
```

No new package installation or native rebuild is needed for this integration.

## Test on your phone

1. Open a new bus search; select both endpoints from Google suggestions, use the
   location button, or enter full postcodes. TransportAPI receives `lonlat:lon,lat`
   derived from TravelMate's `lat,lon`. TfL station IDs and arbitrary text are not
   valid TransportAPI references. Search suggestions no longer have a London bias
   when this provider is selected.
2. Pick a future date/time and a route in the subscribed engine's coverage. For
   example, try Leicester railway station to Leicester Royal Infirmary if your
   engine covers Leicester. Availability and route results are not guaranteed.
3. Confirm that results say TransportAPI; inspect walking/transit steps, midnight
   dates and route notices. Open the map: supplied geometry and stop coordinates
   should draw; missing paths remain gaps, never invented straight lines.
4. Confirm a route. POST journey-session and GET session still use PostgreSQL as
   before. No physical vehicle is assigned merely by confirming a plan.
5. On journey status, bus departures require the response's ATCO boarding stop
   and service name. Up to four expected departures are shown, across supplied
   destinations, so check direction. Scheduled-only entries are excluded from
   the live board. Cached/unavailable results are labelled accordingly.
6. Switch the mobile env back to `tfl`, restart Expo, and test a London search.
   Saved journeys continue to use their own recorded provider for live updates.

## Explicit limits of this patch

- Route planning, per-leg times, walking/transfer details, supplied map geometry,
  acknowledgements and supported bus live predictions are integrated.
- The current documented journey endpoint has **no step-free request filter**.
  Step-free searches are rejected clearly before an upstream request; use the
  TfL provider for its supported London step-free searches. Do not turn off a
  necessary accessibility requirement merely to obtain a route.
- Extra transfer-time preferences cannot be applied by this endpoint; a notice
  explicitly says the itinerary has not been adjusted. No accessibility guarantee
  or fare is invented.
- Rail live boards, TransportAPI service disruption feeds and moving vehicle
  tracking are not connected in this patch. A route polyline is not a GPS feed.
- Live bus boards depend on your separate Bus Information entitlement and the
  operator's realtime coverage. Missing stop/service identifiers yield a clear
  unsupported state; upstream failures yield unavailable, not a successful empty
  board. Raw provider URLs, which may contain credentials, are never followed or
  returned as IDs.
- The provider's prediction measurement time is not supplied by this adapter;
  freshness uses `request_time` from its response, and the UI labels receipt time.
- TransportAPI boards load on screen opening/refocus, app foregrounding and manual
  refresh. Minute polling is disabled for this provider because trial quotas can
  be small. Each supported boarding leg may consume one request per refresh, up
  to six. TfL keeps its existing minute polling.
- Profile/auth/consent and operational assistance logic are unchanged. No live
  credentials were available here, so real subscription access and phone visuals
  still need testing.

## Return to the current TfL experience without removing code

Change **Travelmatev2/.env** to:

```dotenv
EXPO_PUBLIC_JOURNEY_PROVIDER=tfl
```

Restart Expo with `npx expo start --clear`. This is the fastest way to compare.

## Remove the integration completely

First restore the mobile provider env to `tfl`. In **Travelmatev2**:

```bash
git apply --check ~/Downloads/travelmate-transportapi-mobile-rollback.patch
git apply ~/Downloads/travelmate-transportapi-mobile-rollback.patch
```

In **TravelmatePOC**:

```bash
git apply --check ~/Downloads/travelmate-transportapi-backend-rollback.patch
git apply ~/Downloads/travelmate-transportapi-backend-rollback.patch
```

Restart FastAPI and Expo. These reverse patches restore the pre-integration source
for changed files and remove newly added integration files. They do not delete
profiles, sessions, saved journeys or database rows. New TransportAPI journeys may
lose their provider-specific display after rollback; make a new TfL search.
Do not apply a rollback patch after unrelated later edits without running its
check first. Your Git checkpoint provides a second recovery reference.

## Automated checks

Backend:

```bash
python3 -m unittest test_transportapi test_tfl_journey test_live_updates test_journey_map test_places test_travelmate_api test_postgres_repository
```

Mobile:

```bash
npm run lint
npm run typecheck
node --test test_transportapi.cjs test_tfl_planner.cjs test_live_updates.cjs test_places.cjs test_journey_display.cjs test_journey_map.cjs test_device_location.cjs test_journey_names.cjs
```

Tests mock upstream responses; PostgreSQL integration tests require their separate
test database configuration and otherwise skip. No real API keys are used.

## Official references checked

- https://developer.transportapi.com/docs
- https://docs.transportapi.com/openapi/transportapi.yaml
- https://docs.transportapi.com/openapi/paths/public_journey.yaml
- https://docs.transportapi.com/openapi/paths/bus/stop_timetables.yaml
- https://docs.transportapi.com/openapi/properties/public_journey.yaml

This implementation uses the current documented `/v3/uk/public_journey.json` and
`/v3/uk/bus/stop_timetables/{ATCO}.json` endpoints, rather than guessing older
`public/journey/from/...` paths. Credentials are transmitted in HTTPS headers.
