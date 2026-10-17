# Account navigation update

Profile is now labelled Account in the tab bar. The existing /profile route is
retained so dashboard shortcuts remain compatible.

- Pressable identity card retains styles.identity, avatar, name and location.
- Identity and Manage account cards both open /manage-account.
- Personal information and its existing Save flow live in ManageAccountView.
- Settings opens /settings and shares support preferences with the Support tab.
- Refer a friend opens /refer-friend and offers the native text-sharing sheet.
- Log out remains on the Account landing screen.

The separate travelmate-account-update.patch applies on top of the earlier
Travelmate-mobile-iteration.zip source. Save/commit local edits before applying:

```bash
git apply --check ~/Downloads/travelmate-account-update.patch
git apply ~/Downloads/travelmate-account-update.patch
npm run typecheck
npm run lint
npx expo start --clear
```

Alternatively extract the complete Travelmate-account-iteration.zip into a new
folder, copy your mobile .env, run npm install and start Expo.
