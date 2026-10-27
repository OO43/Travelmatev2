# Step 4: selected journey map

Apply after the TfL display, Places and device location patches. No migration.

## TravelmatePOC

```bash
git apply --check ~/Downloads/travelmate-map-backend.patch
git apply ~/Downloads/travelmate-map-backend.patch
```

Restart FastAPI if reload is not active. The existing journey planning endpoint
now includes each leg's `path`, `departure_coordinate` and `arrival_coordinate`.
The geometry comes from TfL, not Google directions. TfL credentials stay in the
backend .env. There are no new backend dependencies or environment variables.

## Travelmatev2

```bash
npx expo install react-native-maps
git apply --check ~/Downloads/travelmate-map-mobile.patch
git apply ~/Downloads/travelmate-map-mobile.patch
npm run lint
npx tsc --noEmit
npx expo start --clear
```

Package and lockfile changes are made by Expo in your own checkout rather than
replaced by the patch. Commit them along with the source changes after testing.

Run a NEW search, select a route and tap **View route on map** above Confirm
journey. The same map button is available on Journey status. Old saved plans may
not have geometry; they show a message asking for a new search. Refresh session
does not re-plan the route or add missing map geometry to an old journey.

## Expo Go

react-native-maps is included in Expo Go. It uses the platform's default map:
Apple Maps on iOS and Google Maps on Android. No new map API key is needed for
this Expo Go test. The server Places key must remain off the phone.

## Native development / release builds

Rebuild after adding a native module. Restarting Metro or an OTA update cannot
add it to an existing standalone app binary.

For iOS this implementation uses Apple Maps, with no Apple Maps API key or
Google Maps iOS key. The map itself does not request location permission or
show a moving blue dot. Device location remains the explicit planner action.

For Android standalone builds:

1. Enable **Maps SDK for Android** in Google Cloud.
2. Create a separate Android Maps key. Restrict it to that SDK, your app's
   Android package name and its signing certificate SHA-1. Development and Play
   release signing certificates can differ.
3. Add to the MOBILE build environment or local .env:

```dotenv
GOOGLE_MAPS_ANDROID_API_KEY=your_restricted_android_maps_sdk_key
```

4. The new app.config.js preserves app.json configuration and adds the maps
   plugin when this variable is supplied. Make it available to EAS Build via
   its environment settings, then rebuild. It is embedded in the native app;
   Android application/API restrictions are essential.

This is distinct from GOOGLE_PLACES_API_KEY in TravelmatePOC. Do not reuse the
server key. If your checkout already has app.config.js/ts, merge this small maps
plugin addition into it rather than replacing its other configuration.

## Display behaviour

- Solid blue lines: transport legs. Dashed grey lines: walking/interchanges.
- Green pin: origin; blue pins: boarding/alighting points; orange pin: destination.
- Tap pins to see labels. Pan/zoom and **Fit route** adjust the map.
- Native map attribution remains visible and is not covered with overlays.
- Missing/invalid paths are left undrawn, with a section count. Endpoint pins
  can still be shown when TfL supplies endpoint coordinates. No straight-line
  replacement is invented. If no coordinates exist, no interactive map opens.
- Text stop labels remain below the map for accessibility and route review.
- The native map displays TfL geometry and endpoint metadata only. Google Places
  predictions are not copied into Apple Maps or plotted separately.
- Times and geometry are planned snapshots. No moving vehicles, continuous user
  tracking, live navigation, notifications or staff booking are introduced.
- The web build safely displays a native-app message instead of importing native
  map code. An interactive browser map is a separate implementation.

## Phone checks

Test a fresh London route with walking sections and another with a transfer.
Confirm the paths follow actual streets/rail lines and the pins match the stop
names. Test pin labels, long names, large text, panning, Fit route, closing and
reopening, different selected routes, and old saved journeys. Check missing
geometry messaging and connection failure while retaining the text itinerary.
Google map tiles on Android standalone builds require the configured SDK key.

If route search still reports TfL cannot resolve locations, capture the exact
FastAPI error first. A map cannot be drawn until a journey search succeeds.

## Automated checks

Backend:
```bash
python3 -m unittest test_journey_map test_places test_tfl_journey test_travelmate_api
```

Mobile:
```bash
node --test test_journey_map.cjs test_device_location.cjs test_places.cjs test_tfl_planner.cjs test_journey_display.cjs test_journey_preview.cjs
npm run lint
npx tsc --noEmit
```

References:
https://docs.expo.dev/versions/v57.0.0/sdk/map-view/
https://github.com/react-native-maps/react-native-maps
