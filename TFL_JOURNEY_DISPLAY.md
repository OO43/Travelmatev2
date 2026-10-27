# TfL journey display update

Apply after the TfL integration. This increment changes presentation, not the provider's route calculation. Google Maps, geolocation and a new migration are not required.

## Mobile — Travelmatev2

```bash
git apply --check ~/Downloads/travelmate-tfl-display-mobile.patch
git apply ~/Downloads/travelmate-tfl-display-mobile.patch
npx expo start --clear
```

If `--check` fails, stop and share the output. Do not force the patch. The standalone timeline wrapping patch is not a prerequisite: this patch adds a separate detailed timeline for TfL legs and preserves the existing fallback timeline/styles.

- Route cards distinguish total journey duration from walking time, and show walking/bus/rail chips in order.
- **View journey steps** expands the selected card's data without selecting it or confirming a journey.
- Each step shows mode/line, duration, London departure/arrival times, origin, destination, instruction, and supplied notices. Transport legs label the boarding and alighting points.
- Positive gaps between legs appear as scheduled waits/connections; no service frequency, countdown or live arrival prediction is invented.
- Times have their own line in the new breakdown. Long stop/line names wrap, including with large text.
- The same breakdown appears in the status screen. It uses retained `journey.legs`, so previously saved TfL journeys with legs also work.
- Notices use the data returned by the provider. “No disruption notices were included” means the response contained none; it is not a guarantee of good service.
- Fetch time is shown in London local time. It is a snapshot, not continuous tracking.

No new mobile dependencies. Session confirmation and consent behaviour are preserved.

## Backend — TravelmatePOC

```bash
git apply --check ~/Downloads/travelmate-tfl-display-backend.patch
git apply ~/Downloads/travelmate-tfl-display-backend.patch
```

Uvicorn reloads if running with `--reload`. Otherwise restart it. No migration is required. The backend patch retains planned-work notices alongside leg disruptions and top-level TfL stop messages. It preserves the existing response structure and Python 3.9 compatibility. It does not add line-status polling or guarantee that every notice displayed in another app is available in this journey response.

Run a **new search** to receive the enriched notices; old saved route snapshots will not gain newly fetched data automatically. The mobile patch also works with the earlier response, but cannot display notices it did not receive.

## QA on your phone

1. Search a bus journey with walking legs. Compare total duration, each leg's times, walking total, boarding and alighting stops.
2. Open/close View journey steps on a route. Verify that this does not change which route is selected.
3. Try a route with a change; check that walking legs do not count as vehicle changes and connection gaps are shown separately.
4. Select a route and confirm; verify that the status screen displays the same leg order, places and times.
5. Enable large text and test the long “St Thomas' Hospital / County Hall” instruction. All times should remain visible below the heading.
6. If the response includes disruptions/planned works, verify their wording is retained. If it has none, do not expect fabricated notices.
7. Compare other apps using the exact same coordinates/date/time/mode/accessibility settings. This patch makes TravelMate's returned data visible; it does not force other providers to return identical routes.

Checks:

```bash
npm run lint
npm run typecheck
node --test test_journey_preview.cjs test_tfl_planner.cjs test_journey_display.cjs
```

Backend:

```bash
python -m unittest test_tfl_journey test_travelmate_api
```
