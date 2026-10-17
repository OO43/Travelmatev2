# Planner and Help iteration

Based on the supplied journey-planner screenshot and the Account iteration.

## What's changed

- Planner: white layout, New journey heading and close control, grouped From/To
  inputs, date and Leave at selection, accessibility checkbox, results count,
  two selectable route-preview cards, Best match chip, fare/features, confirmation.
- Dates: next 90 days; times: 15-minute options. Requested date/time affect preview
  options and are stored in the local journey. Routes and fares remain sample data.
- Changing planner inputs invalidates previous results. Only confirmation creates
  a real journey session and adds the confirmed route to the local upcoming list.
- Get help replaces Accessibility in the tab bar. It opens journey assistance.
- Support preferences remain available through Account → Settings.
- Account gains Help: expandable Accounts, Guides, Journeys/tickets and
  Accessibility/assistance topics, plus a Contact us card.
- Contact us: topic, email, message, persisted local draft. Optional configured
  support email opens an email draft in the user's email app.

## Run

Extract Travelmate-planner-help-iteration.zip in a new folder, copy the existing
mobile .env, then run npm install and npx expo start --clear.

Optional, in the mobile .env:

```env
EXPO_PUBLIC_SUPPORT_EMAIL=YOUR_ACTUAL_SUPPORT_ADDRESS
```

Use a real address, then restart Expo. Without it, Contact us saves message drafts
locally and does not claim to send them. Email support opens an external email
composer; it does not automatically send anything or create a support ticket.
Profiles, support and inbox remain local until their backend endpoints are built.

## Test

1. Open planner from Home and Journeys. Compare layout with the reference.
2. Change date and time; find routes; select either card and confirm.
3. Check POST 201 / GET 200, then reopen the same journey session.
4. Refresh results, change destination and ensure old routes cannot be confirmed.
5. Disable accessibility preferences: route tags change, no declared categories
   or enhanced-supervision consent are sent during confirmation.
6. Open Get help; review support settings should open Settings, not loop back.
7. Account → Help: expand each topic; Contact us should open its form.
8. Save a contact draft, leave/reopen the page, and verify persistence.
9. With a support email configured, open an email draft and cancel it.
10. Check large text, narrow screens, keyboard scrolling and native back buttons.

```bash
npm run typecheck
npm run lint
node --test test_journey_preview.cjs
```

## Patch

travelmate-planner-help-update.patch applies on top of the previous
Travelmate-account-iteration.zip. Save/commit your own changes first:

```bash
git apply --check ~/Downloads/travelmate-planner-help-update.patch
git apply ~/Downloads/travelmate-planner-help-update.patch
```

If the check fails, test the separate ZIP instead of forcing the patch.
