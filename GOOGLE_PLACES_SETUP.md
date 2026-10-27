# Google Places autocomplete for TravelMate

Requires the existing TfL integration and the journey display patch (mobile v3).
Google finds places; TfL still plans the London bus/rail journey. No migration,
new native module or additional npm package is needed.

## 1. Configure Google Cloud

1. Create or select a Google Cloud project and enable billing.
2. Enable **Places API (New)**, not just the legacy Places API.
3. Create a separate API key restricted to **Places API (New)**.
4. This key is for server-to-server requests. When deploying, restrict it to the
   backend's outbound public IP addresses. An iOS, Android or website/referrer
   restriction will not work for this FastAPI proxy. Your Mac's LAN IP is not
   its outbound public IP. Keep any development key private and set quotas.
5. Add to your existing **TravelmatePOC/.env**, preserving DATABASE_URL and TFL_APP_KEY:

```dotenv
GOOGLE_PLACES_API_KEY=your_google_places_key
```

Do not put the key in Travelmatev2, an EXPO_PUBLIC variable, screenshots or Git.
Do not replace the TfL key; both services use their own key. Do not overwrite
your existing .env by copying .env.example over it.

## 2. Apply the backend patch in TravelmatePOC

```bash
git apply --check ~/Downloads/travelmate-google-places-backend.patch
git apply ~/Downloads/travelmate-google-places-backend.patch
```

Stop the existing Uvicorn process with Ctrl+C and restart it after editing .env:

```bash
source .venv/bin/activate
python3 -m uvicorn travelmate_api.main:app --host 0.0.0.0 --port 8000 --reload
```

Existing requirements_api.txt already includes httpx; no Alembic command is needed.

## 3. Apply the mobile patch in Travelmatev2

```bash
git apply --check ~/Downloads/travelmate-google-places-mobile.patch
git apply ~/Downloads/travelmate-google-places-mobile.patch
npm run lint
npx tsc --noEmit
npx expo start --clear
```

Keep the existing mobile .env:

```dotenv
EXPO_PUBLIC_API_URL=http://YOUR_MAC_LAN_IP:8000
EXPO_PUBLIC_JOURNEY_PROVIDER=tfl
```

No new mobile environment variable is needed.

## 4. Test on your phone

- Open Plan a journey and tap From. A search sheet slides up from the bottom.
- Enter `Victoria Station`, pause, and select the London result.
- Tap To, enter `Westminster Abbey`, and select a result.
- Set a future departure date/time, select Bus or Train, and tap Find routes.
- Confirm that the route endpoint names and boarding/walking legs make sense.
  A point's coordinates improve location matching but do not guarantee the
  correct building entrance or step-free access.
- Type quickly, clear the query, switch fields, or close while searching. Old
  predictions must not overwrite newer results or update a closed sheet.
- Reopen a selected field, change it, and select another suggestion. Old routes
  should clear when the new selection is committed.
- Try manual entry with a station or postcode. TfL's existing disambiguation
  flow remains available. Closing a sheet without selection keeps the old value.
- With no backend Google key, show a useful error and allow manual entry.
- Test long addresses, larger text and the keyboard on both platforms.

Expected FastAPI log routes:

```text
POST /api/v1/places/autocomplete 200
POST /api/v1/places/resolve 200
POST /api/v1/journeys/plan 200
```

## Request behaviour and data

Autocomplete waits 350ms after editing and starts at 3 characters. Requests are
aborted on edits, dismissal and unmount. A unique token is created each time a
field opens and reused for autocomplete plus its selected Place Details call.
Predictions are GB-only with a London location bias; this is a bias, not a strict
London boundary. TfL can still reject journeys outside its supported area.

Only typed search text and session token are sent to Google autocomplete. Place
Details requests use the place ID and token. Passenger profile, accessibility,
consent, email and ticket data are not sent to Google.

Selected coordinates are converted to `latitude,longitude` for the existing TfL
request. Predictions, attribution and coordinates are held in the mounted
planner only, not cached or added to PostgreSQL or AsyncStorage. Saved journey
endpoint labels use the passenger's typed query; TfL supplies the route legs.
Google prediction labels appear only in the place picker and selected fields.

## Troubleshooting

- `PLACES_NOT_CONFIGURED`: missing or empty GOOGLE_PLACES_API_KEY; restart FastAPI.
- `PLACES_CONFIGURATION`: verify billing, Places API (New), key/project and
  server-compatible API restrictions in Google Cloud. The upstream key is never
  returned to the device.
- 429: the local proxy allows 60 place requests per minute per client IP.
- `PLACES_LIMIT`: check Google quota/billing. No automatic retries add billed calls.
- Timeout/network errors: check phone Wi-Fi, EXPO_PUBLIC_API_URL and Mac connectivity.
- Google place IDs are never sent to TfL as station IDs; coordinates are resolved first.

## Before public deployment

These endpoints fit the existing local pilot; authentication is not yet built
into the POC. Add authenticated access and shared abuse controls before exposing
this paid proxy publicly. The included bounded per-process limiter is not a
replacement for that. Set Google quotas; budget alerts alone are not a hard cap.

Publish TravelMate's own Terms and Privacy Policy describing Google use before
release. The search sheet includes Google privacy/terms links and Google Maps
text attribution for the compact interface. Do not remove attribution. Do not
persist or repurpose predictions, selected coordinates or provider content
without checking the applicable Google content-storage rules. No map is added.

## Checks

TravelmatePOC:
```bash
python3 -m unittest test_places test_tfl_journey test_travelmate_api
```

Travelmatev2:
```bash
node --test test_places.cjs test_tfl_planner.cjs test_journey_display.cjs test_journey_preview.cjs
npm run lint
npx tsc --noEmit
```

Automated tests use mocked Google responses and do not incur Google charges.
Real-key, billing and phone UI checks must be run in your environment.

Official references:
- https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
- https://developers.google.com/maps/documentation/places/web-service/place-details
- https://developers.google.com/maps/documentation/places/web-service/place-session-tokens
- https://developers.google.com/maps/documentation/places/web-service/policies
