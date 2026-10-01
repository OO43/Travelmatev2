# TravelMate developer guide

This project uses MVVM-C, but common edits should still be easy to find.

## I want to edit the dashboard

| Change | File |
| --- | --- |
| Dashboard layout, cards, labels and local styles | `src/views/DashboardView.tsx` |
| Bus, Train, Flight and Car quick-action text/config | `src/viewModels/useDashboardViewModel.ts` |
| What dashboard buttons open | `src/coordinators/DashboardCoordinator.tsx` |
| Dashboard route entry | `src/app/(protected)/dashboard.tsx` |
| Global app colours | `src/theme/colors.ts` |
| Global spacing | `src/theme/spacing.ts` |
| Global typography | `src/theme/typography.ts` |
| Global corner radius | `src/theme/radius.ts` |
| Shared buttons, cards, headers and inputs | `src/components/ui.tsx` |

The route file is intentionally small. Expo Router finds it and hands the
screen to the coordinator. The coordinator connects navigation, the ViewModel
provides state, and the View renders the interface.

## Where each kind of change belongs

| You are changing… | Start in… |
| --- | --- |
| A screen's layout or styles | `src/views/` |
| Screen data, validation or actions | `src/viewModels/` |
| Navigation after a tap | `src/coordinators/` |
| A domain type or interface | `src/models/` |
| API, OCR, authentication or data access | `src/services/` |
| Shared app state | `src/state/` |
| A reusable visual component | `src/components/` |
| Colours | `src/theme/colors.ts` |
| Spacing | `src/theme/spacing.ts` |
| Typography | `src/theme/typography.ts` |
| Corner radius | `src/theme/radius.ts` |
| A URL/route | `src/app/` |

## Bottom navigation

The five bottom tabs are configured in
`src/app/(protected)/(tabs)/_layout.tsx`. Change tab labels, icons and tab-bar
styling there. Each tab route is a small adapter in the same folder; its actual
UI remains in `src/views/`.

## Common examples

### Change the primary green colour

Edit `forest` in `src/theme/colors.ts`:

```ts
forest: '#176B5B',
```

### Change spacing or typography globally

Edit `src/theme/spacing.ts` for the spacing scale and
`src/theme/typography.ts` for shared text sizes, line heights, weights and
letter spacing. New UI should import all design tokens from `@/theme`.

### Change the Scan ticket button colour

The dashboard passes `variant="coral"` in `src/views/DashboardView.tsx`.
The actual coral button styling lives in `src/components/PrimaryButton.tsx`,
and the colour value lives in `src/theme/colors.ts`.

### Change a quick action

Edit the `quickActions` array in
`src/viewModels/useDashboardViewModel.ts`. Change `enabled` to control whether
an action can be pressed.

### Add a new screen

1. Add its domain types to `src/models/` if required.
2. Add its service functions to `src/services/` if required.
3. Create its ViewModel in `src/viewModels/`.
4. Create its View in `src/views/`.
5. Create its Coordinator in `src/coordinators/`.
6. Add a small route adapter in `src/app/`.

## Before committing

```bash
npm run typecheck
npm run lint
```
