# Device location: integration step 3

Requires the TfL display and Google Places mobile patches already applied. This
patch adds one foreground position request to the planner's From section.

## Apply in Travelmatev2

```bash
npx expo install expo-location
git apply --check ~/Downloads/travelmate-device-location.patch
git apply ~/Downloads/travelmate-device-location.patch
npm run lint
npx tsc --noEmit
npx expo start --clear
```

The dependency is installed by Expo for the SDK in your own checkout. This patch
does not replace package.json or package-lock.json. Commit the dependency and
lockfile changes along with the patch changes after testing.

No TravelmatePOC patch, API key, new .env variable or database migration is needed.
FastAPI and the phone must still be connected using EXPO_PUBLIC_API_URL. Device
coordinates use the same TfL endpoint as selected Google Places coordinates.
Any unresolved TfL coordinate-planning error from step 2 must still be diagnosed;
device location cannot correct an upstream TfL error.

## Phone test

1. Open Plan a journey and tap **Use current location** below From.
2. Grant **While Using the App** / **Allow Once** when the OS asks. If offered,
   enable precise location for the most useful boarding/walking starting point.
3. From becomes **Your current location**, with a message showing reported
   accuracy. No Google geocoding request is needed to acquire this position.
4. Choose a London destination, date/time and Bus or Train, then Find routes.
5. Confirm the first walking/boarding point makes sense for where you are.

TfL planning still covers London. A valid GPS position in another city does not
make TfL a UK-wide routing provider. You can use manual From entry to test London
journeys when physically outside London.

## Permission and error tests

- Deny permission: a message explains manual entry; the original From value stays.
- Permission permanently denied: **Open location settings** opens app Settings.
  On web, it gives browser/site permission instructions instead.
- Location services off: enable them in the device's system location settings,
  then return and tap Use current location again. App Settings may not contain
  the device-wide location-services switch on every platform.
- Indoors/weak signal: locating times out after 20 seconds of waiting for the
  position, with retry/manual guidance. The OS permission prompt itself is not
  given this deadline.
- Tap **Stop locating** while waiting, then enter a manual origin. A late native
  result must not replace it. Selecting a different From/To, changing planning
  options or leaving the planner also discards the pending result.
- Repeated taps must not start extra requests. Find routes is disabled while
  locating, so the literal placeholder is never used as resolved coordinates.
- Results older than 60 seconds, invalid coordinates or uncertainty over 1 km
  are rejected. Lesser uncertainty is shown for the passenger to review. GPS
  precision does not guarantee an accessible building entrance or bus stop.
- On a simulator, supply a simulated location. Prefer a real phone for testing
  actual permission prompts, services, accuracy and keyboard behaviour.

## Expo Go and development builds

expo-location is included in Expo Go; install the JavaScript package with
`npx expo install expo-location` and restart Metro. Expo Go manages its own
native permission configuration, so its prompt text/settings may use Expo Go's
name rather than TravelMate's.

For a development or production app, rebuild the native binary to include the
new module and app.json location permission configuration. A Metro restart or
OTA update alone cannot add a native module or change permission text.

On web, browser geolocation requires a secure context (HTTPS or localhost).
A phone visiting plain http://MAC_LAN_IP:8081 may not allow geolocation; Expo Go
is the intended phone test path for this iteration.

## Behaviour and privacy

The app asks for foreground permission only when the passenger taps the button.
It does not request background access, subscribe to continuous positions, use
geofencing or start a background service. The permission plugin explicitly keeps
background modes and Android foreground service disabled.

The selected coordinates remain in the mounted planner and are sent to FastAPI
and TfL only when Find routes is pressed. They are not added as a new database
field or stored by this change in AsyncStorage. Existing journey/session storage
behaviour is unchanged. Starting-point labels say Your current location, while
TfL supplies the returned stop/walking details.

This is a position snapshot. Tap Use current location again if you have moved
before searching. A timed-out/cancelled native one-shot fix can still finish
internally because the Expo API has no cancellation argument; its late result
is ignored, and it does not update the planner or get sent to FastAPI.

## Automated checks

```bash
node --test test_device_location.cjs test_places.cjs test_tfl_planner.cjs test_journey_display.cjs test_journey_preview.cjs
npm run lint
npx tsc --noEmit
```

Tests mock the native location APIs and do not request real location permission.
Phone permission and GPS checks remain required after applying the patch.

Expo SDK 57 reference:
https://docs.expo.dev/versions/v57.0.0/sdk/location/
