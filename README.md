# TravelMate Main 2.0

TravelMate is an accessible journey companion built with React Native, Expo SDK 57, TypeScript, Expo Router, and an MVVM-C-inspired architecture.

## MVP

The MVP centres on journey planning with transport-specific quick actions:

- Bus — primary MVP flow
- Train — platform and transfer-aware flow
- Flight — airport, security, gate, and boarding flow
- Car hire — visible as a planned later feature

The app starts with a welcome and demo login flow. All dashboard, profile, ticket-intelligence, journey-planning, status, and feedback routes are session-protected.

After login, the main application uses five persistent bottom tabs: Home,
Journeys, Accessibility, Alerts, and Profile. Journey planning, live status,
ticket scanning, and feedback open as protected detail routes.

Demo credentials:

```text
Email: oore@travelmate.com
Password: password123
```

The dashboard also includes Ticket Intelligence. QR codes and barcodes are decoded locally using `expo-camera`. Printed tickets are photographed and sent to a configured document-intelligence API. When no endpoint is configured, the app returns explicitly marked demo OCR data so the complete user flow remains testable.

## Architecture

```text
src/
├── app/           # Expo Router route adapters only
├── coordinators/  # Navigation and flow decisions
├── views/         # Presentation-focused screens
├── viewModels/    # State, validation, and business actions
├── models/        # Shared domain contracts
├── services/      # Journey and ticket-intelligence integrations
├── state/         # Persisted application state
├── components/    # Reusable UI
└── constants/     # Design tokens
```

## Fast edit map

Junior developers should not need to trace the whole architecture for routine
changes:

- Dashboard UI: `src/views/DashboardView.tsx`
- Dashboard quick actions: `src/viewModels/useDashboardViewModel.ts`
- Dashboard navigation: `src/coordinators/DashboardCoordinator.tsx`
- Global colours: `src/theme/colors.ts`
- Global spacing: `src/theme/spacing.ts`
- Global typography: `src/theme/typography.ts`
- Global corner radius: `src/theme/radius.ts`
- Shared UI exports: `src/components/ui.tsx`
- Full guide: `DEVELOPER_GUIDE.md`

## Run locally

Use Node.js 22.13 or newer.

```bash
npm install
npx expo start --clear
```

Open Expo Go on a physical device signed into the same Expo account and scan the QR code.

## Verification

```bash
npm run typecheck
npm run lint
npx expo-doctor@latest
```

## Ticket-intelligence API contract

Set `EXPO_PUBLIC_TICKET_INTELLIGENCE_API_URL` and implement:

```text
POST /v1/tickets/analyse
Content-Type: multipart/form-data
Field: ticket (JPEG image)
```

The response must match `TicketIntelligenceResult` in `src/models/ticket.ts`. The backend is responsible for OCR, provider-specific parsing, validation, privacy controls, and deletion/retention policy.
