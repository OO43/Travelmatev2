# TravelMate mobile feature iteration

This is the React Native/Expo app, updated from Travelmatev2. No backend migrations
are included. Existing POST/GET journey-session calls remain connected to FastAPI.

## Run in a separate folder

Unzip Travelmate-mobile-iteration.zip and open its folder in VS Code.
Use Node 22.13+ and a compatible Expo Go/development build for SDK 57.

```bash
npm install
npm run typecheck
npm run lint
npx expo start --clear
```

Create a root .env with your current backend Mac address:

```env
EXPO_PUBLIC_API_URL=http://YOUR_MAC_IP:8000
```

Restart Expo after changing .env. Without it, the app can still open for local UI
testing; journey confirmation will show a configuration error rather than crashing
at import time. For backend testing, start PostgreSQL and FastAPI as before.
Keep the phone and backend Mac on the same network.

Demo login: oore@travelmate.com / password123. This remains demo authentication,
not a production account service.

## Test checklist

1. Account: tap the identity card or Manage account card. Both should open the
   same personal-information screen. Enter first name, last name, preferred name and emergency contact.
   Select a preferred language from the dropdown, Save, then restart the app.
   Values should remain. The language choice stores a preference; it does not
   translate the mobile app yet. Existing local profile fields are merged with
   the new defaults rather than reset.
2. Account > Settings contains the support preferences. Get help's quick settings
   use the same saved values.
   Toggle seeing/hearing and moving/boarding preferences. Each change
   saves locally, produces a preference alert, and shows Saved. Large text should
   enlarge app text; high contrast strengthens muted text and card/field outlines.
   Keep extra transfer time and extra boarding time as separate settings.
3. Consent: choose Only when needed, Every journey, or Never. The first prompts
   before session confirmation. Never sends no declared support categories and
   no sharing/enhanced-supervision consent, and blocks local assistance drafts.
   Updating a saved preference does not alter an already-created backend session.
4. Journeys: plan a route; it appears in Upcoming. Confirm to create a real backend
   session, then reopen it from Journeys or the dashboard. Session IDs persist
   so the GET endpoint can fetch the same session after an app restart.
5. Saved places: add Work and a destination. Plan a journey here should pre-fill
   To. Remove the place and restart to confirm removal persists.
6. Local history: Move to local history archives the plan on the device and adds
   a feedback alert. It does NOT complete or modify the PostgreSQL session.
   Plan this route again should pre-fill the destination.
7. Assistance: open Get help from the dashboard. Select boarding, wheelchair or
   urgent help (one choice at a time). Save test request requires a current journey.
   Verify a Saved locally message, a request-history entry and a local inbox alert.
   No staff notification or wheelchair reservation is made. Live chat and call
   support remain disabled pending real contact services. Quick support toggles
   share the same preferences as Account > Settings.
8. Alerts: load the four labelled sample alerts; check All/Unread/My journeys,
   counts, Mark as read, Mark all as read, Dismiss and Share feedback.
   Unread indicators should not overlap timestamps. Reload to check persistence.
   Samples are explicit test data; they are never presented as actual staff
   acknowledgements or live service updates.
9. Regression: login/signup navigation, ticket scanner permission/preview,
   ticket-to-planner prefill and existing feedback navigation should still open.
   Camera and native layout checks require a phone/simulator.
10. Account: return after saving personal information and check that the identity
    card reflects the saved name/location. Test its press target, all three cards,
    back navigation, and Log out.
11. Refer a friend: Share TravelMate opens the native share sheet with invitation
    text. Cancel it and verify the page stays usable. This is text sharing only;
    no referral tracking or reward system is implemented.

## Integration boundaries

Profiles, preferences, saved places, local history, inbox read/dismiss state and
assistance drafts are stored using AsyncStorage for this iteration. Passenger
profile, assistance and notification backend endpoints are still to be built.
Journey planning remains the existing mock service. Saving route preferences
does not enable real accessible route filtering, audio guidance, background
vibration reminders or live transport tracking.

The existing feedback screen is retained and still uses its existing local flow.
Authentication/user isolation is demo-only. Use test data.

## Apply to an existing checkout

The companion travelmate-mobile-iteration.patch is based on the main commit
recorded in ITERATION_BASE_COMMIT.txt. Commit your own changes first, then:

```bash
git switch -c feature/mobile-passenger-iteration
git apply --check ~/Downloads/travelmate-mobile-iteration.patch
git apply ~/Downloads/travelmate-mobile-iteration.patch
npm run typecheck
npm run lint
npx expo start --clear
```

If the check fails, use the separate ZIP for testing rather than forcing the patch.
Your existing .env is not included or overwritten.
