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
  audioGuidance: boolean;
  vibrationGuidance: boolean;
  boardingAssistance: boolean;
  alightingAssistance: boolean;
  extraBoardingTime: boolean;
  stopAnnouncements: boolean;
};

export type PassengerProfile = {
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
