import type { PassengerProfile } from '@/models/passenger';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ProfileResponse = {
  passenger_id: string;
  first_name: string;
  last_name: string;
  preferred_name: string;
  phone_number: string;
  email_address: string;
  emergency_contact: string;
  preferred_language: string;
  home_location: string;
  communication_method: 'audio' | 'visual' | 'combined';
  accessibility_needs: {
    visual_impairment: boolean;
    hearing_impairment: boolean;
    reduced_mobility: boolean;
    wheelchair_user: boolean;
    cognitive_support_required: boolean;
    assistance_animal_support: boolean;
    temporary_accessibility_need: boolean;
  };
  assistance_preferences: {
    audio_guidance: boolean;
    vibration_guidance: boolean;
    boarding_assistance: boolean;
    alighting_assistance: boolean;
    extra_boarding_time: boolean;
    stop_announcements: boolean;
    large_text: boolean;
    high_contrast: boolean;
    step_free_routes: boolean;
    extra_transfer_time: boolean;
    priority_seating: boolean;
  };
  sharing_preference: 'needed' | 'always' | 'never';
  personalised_suggestions: boolean;
  enhanced_supervision: boolean;
  created_at: string;
  updated_at: string;
};

export class PassengerProfileApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'PassengerProfileApiError';
  }
}

function apiUrl() {
  if (!API_URL) {
    throw new Error('Set EXPO_PUBLIC_API_URL in .env to connect the passenger-profile backend.');
  }
  return API_URL.replace(/\/$/, '');
}

async function readResponse(response: Response): Promise<ProfileResponse> {
  const body = await response.json().catch(() => null) as
    | ProfileResponse
    | { message?: string; detail?: unknown }
    | null;
  if (!response.ok) {
    const message = body && 'message' in body && body.message
      ? body.message
      : `Passenger profile request failed (${response.status}).`;
    throw new PassengerProfileApiError(message, response.status);
  }
  return body as ProfileResponse;
}

function toPassengerProfile(response: ProfileResponse): PassengerProfile {
  return {
    passengerId: response.passenger_id,
    firstName: response.first_name,
    lastName: response.last_name,
    preferredName: response.preferred_name,
    phoneNumber: response.phone_number,
    emailAddress: response.email_address,
    emergencyContact: response.emergency_contact,
    preferredLanguage: response.preferred_language,
    homeLocation: response.home_location,
    communicationMethod: response.communication_method,
    sharingPreference: response.sharing_preference,
    personalisedSuggestions: response.personalised_suggestions,
    enhancedSupervision: response.enhanced_supervision,
    accessibilityNeeds: {
      visualImpairment: response.accessibility_needs.visual_impairment,
      hearingImpairment: response.accessibility_needs.hearing_impairment,
      reducedMobility: response.accessibility_needs.reduced_mobility,
      wheelchairUser: response.accessibility_needs.wheelchair_user,
      cognitiveSupportRequired: response.accessibility_needs.cognitive_support_required,
      assistanceAnimalSupport: response.accessibility_needs.assistance_animal_support,
      temporaryAccessibilityNeed: response.accessibility_needs.temporary_accessibility_need,
    },
    assistancePreferences: {
      audioGuidance: response.assistance_preferences.audio_guidance,
      vibrationGuidance: response.assistance_preferences.vibration_guidance,
      boardingAssistance: response.assistance_preferences.boarding_assistance,
      alightingAssistance: response.assistance_preferences.alighting_assistance,
      extraBoardingTime: response.assistance_preferences.extra_boarding_time,
      stopAnnouncements: response.assistance_preferences.stop_announcements,
      largeText: response.assistance_preferences.large_text,
      highContrast: response.assistance_preferences.high_contrast,
      stepFreeRoutes: response.assistance_preferences.step_free_routes,
      extraTransferTime: response.assistance_preferences.extra_transfer_time,
      prioritySeating: response.assistance_preferences.priority_seating,
    },
  };
}

function requestBody(profile: PassengerProfile) {
  return {
    first_name: profile.firstName ?? '',
    last_name: profile.lastName ?? '',
    preferred_name: profile.preferredName,
    phone_number: profile.phoneNumber,
    email_address: profile.emailAddress,
    emergency_contact: profile.emergencyContact ?? '',
    preferred_language: profile.preferredLanguage,
    home_location: profile.homeLocation,
    communication_method: profile.communicationMethod === 'vibration'
      ? 'combined'
      : profile.communicationMethod,
    accessibility_needs: {
      visual_impairment: profile.accessibilityNeeds.visualImpairment,
      hearing_impairment: profile.accessibilityNeeds.hearingImpairment,
      reduced_mobility: profile.accessibilityNeeds.reducedMobility,
      wheelchair_user: profile.accessibilityNeeds.wheelchairUser,
      cognitive_support_required: profile.accessibilityNeeds.cognitiveSupportRequired,
      assistance_animal_support: profile.accessibilityNeeds.assistanceAnimalSupport,
      temporary_accessibility_need: profile.accessibilityNeeds.temporaryAccessibilityNeed,
    },
    assistance_preferences: {
      audio_guidance: profile.assistancePreferences.audioGuidance,
      vibration_guidance: profile.assistancePreferences.vibrationGuidance,
      boarding_assistance: profile.assistancePreferences.boardingAssistance,
      alighting_assistance: profile.assistancePreferences.alightingAssistance,
      extra_boarding_time: profile.assistancePreferences.extraBoardingTime,
      stop_announcements: profile.assistancePreferences.stopAnnouncements,
      large_text: Boolean(profile.assistancePreferences.largeText),
      high_contrast: Boolean(profile.assistancePreferences.highContrast),
      step_free_routes: Boolean(profile.assistancePreferences.stepFreeRoutes),
      extra_transfer_time: Boolean(profile.assistancePreferences.extraTransferTime),
      priority_seating: Boolean(profile.assistancePreferences.prioritySeating),
    },
    sharing_preference: profile.sharingPreference ?? 'needed',
    personalised_suggestions: profile.personalisedSuggestions ?? true,
    enhanced_supervision: profile.enhancedSupervision ?? false,
  };
}

export async function getPassengerProfile(passengerId: string): Promise<PassengerProfile> {
  const response = await fetch(
    `${apiUrl()}/api/v1/passengers/${encodeURIComponent(passengerId)}/profile`,
    { headers: { Accept: 'application/json' } },
  );
  return toPassengerProfile(await readResponse(response));
}

export async function savePassengerProfile(profile: PassengerProfile): Promise<PassengerProfile> {
  const response = await fetch(
    `${apiUrl()}/api/v1/passengers/${encodeURIComponent(profile.passengerId)}/profile`,
    {
      method: 'PUT',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody(profile)),
    },
  );
  return toPassengerProfile(await readResponse(response));
}
