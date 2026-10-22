# TfL journey planner — React Native

Apply **the backend patch first** in TravelmatePOC and verify its `/api/v1/journeys/plan` endpoint. This mobile patch belongs in **Travelmatev2**, including the current planner/help iteration if that is your working mobile folder.

```bash
git apply --check ~/Downloads/travelmate-tfl-mobile.patch
git apply ~/Downloads/travelmate-tfl-mobile.patch
```

Your app `.env` should contain your Mac's current LAN address, without `/api/v1`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_MAC_IP:8000
EXPO_PUBLIC_JOURNEY_PROVIDER=tfl
```

The provider defaults to TfL when absent. Only `EXPO_PUBLIC_JOURNEY_PROVIDER=demo` selects the old mock planner. There is no automatic fallback to mock results when TfL fails. Do not add TfL keys to the mobile app.

If desired, include `EXPO_PUBLIC_JOURNEY_PROVIDER=tfl` in `.env.example` too. Environment files are not modified by this patch, preserving your current configuration.

Restart Expo to pick up environment changes:

```bash
npx expo start --clear
```

## Phone check

1. Ensure FastAPI is running on `0.0.0.0:8000`, PostgreSQL is running, and phone/Mac can reach each other on the network.
2. Open the planner and choose **Bus**.
3. Replace `Current location` with `51.4965,-0.1447`, and enter `51.5010,-0.1254` as the destination. For this first test, switch off accessibility preferences and choose a sensible London date/time.
4. Tap Find routes. Results should say **TfL route options**, with provider route numbers, times and available fares. Unavailable fares are labelled, not invented.
5. Try `Victoria` to `Westminster` using **Train**. If TfL needs clarification, choose the offered locations, then tap Find routes again.
6. Select a route and confirm. The existing session POST/GET should succeed, and the status timeline should use the selected TfL legs.
7. Enable your saved step-free/extra-transfer-time preferences and search again. The backend requests step-free-to-vehicle and/or slower walking when those settings are selected.
8. Disconnect FastAPI temporarily and search again; expect an error, not a fake successful route.

Times are London local time, including summer time and midnight date changes. This increment does not add GPS input, flights, car hire, automatic stop reminders, real vehicle tracking or staff assistance bookings.

The API returns rail line IDs and bus route numbers, not a passenger's assigned vehicle. A unique planning placeholder is sent to the existing session API; the status view displays **Vehicle: not assigned**. Full route/leg data stays in the app store, while PostgreSQL persists the existing session fields. Persisting all legs for cross-device retrieval will need a later migration.

## Checks

```bash
npm run lint
npm run typecheck
node --test test_journey_preview.cjs test_tfl_planner.cjs
```

`test_journey_preview.cjs` now tests the separately retained `demoJourneyService.ts`; `test_tfl_planner.cjs` verifies the real planner's request/response mapping and error handling with mocked fetch. No new mobile packages are required.
