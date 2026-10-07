import type { PassengerProfile } from '@/models/passenger';
import type {
  CreateJourneySessionRequest,
  JourneySession,
  SupportOption,
} from '@/models/journeySession';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not configured.');
}

export function supportOptionsFromProfile(
  profile: PassengerProfile,
): SupportOption[] {
  const options: SupportOption[] = [];

  if (profile.accessibilityNeeds.visualImpairment) {
    options.push('visual_assistance');
  }

  if (
    profile.accessibilityNeeds.reducedMobility ||
    profile.accessibilityNeeds.wheelchairUser ||
    profile.assistancePreferences.alightingAssistance ||
    profile.assistancePreferences.extraBoardingTime
  ) {
    options.push('extra_time_exiting');
  }

  return [...new Set(options)];
}

export async function createJourneySession(
  payload: CreateJourneySessionRequest,
): Promise<JourneySession> {
  const response = await fetch(`${API_URL}/api/v1/journey-sessions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body.message ?? 'TravelMate could not start this journey.',
    );
  }

  return body as JourneySession;
}