export type CommunicationMethod = 'audio' | 'vibration' | 'visual' | 'combined';

export type AccessibilityNeeds = {
  visualImpairment: boolean;
  hearingImpairment: boolean;
  reducedMobility: boolean;
  wheelchairUser: boolean;
  cognitiveSupportRequired: boolean;
  assistanceAnimalSupport: boolean;
  temporaryAccessibilityNeed: boolean;
};

export type AssistancePreferences = {
  largeText?: boolean;
  highContrast?: boolean;
  stepFreeRoutes?: boolean;
  extraTransferTime?: boolean;
  prioritySeating?: boolean;
  audioGuidance: boolean;
  vibrationGuidance: boolean;
  boardingAssistance: boolean;
  alightingAssistance: boolean;
  extraBoardingTime: boolean;
  stopAnnouncements: boolean;
};

export type PassengerProfile = {
  firstName?: string;
  lastName?: string;
  emergencyContact?: string;
  sharingPreference?: 'needed' | 'always' | 'never';
  personalisedSuggestions?: boolean;
  enhancedSupervision?: boolean;
  passengerId: string;
  preferredName: string;
  phoneNumber: string;
  emailAddress: string;
  preferredLanguage: string;
  homeLocation: string;
  communicationMethod: CommunicationMethod;
  accessibilityNeeds: AccessibilityNeeds;
  assistancePreferences: AssistancePreferences;
};
