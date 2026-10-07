export type SupportOption =
  | 'avoid_sudden_braking'
  | 'motion_sensitive'
  | 'extra_time_exiting'
  | 'child_supervision'
  | 'visual_assistance'
  | 'pregnancy_support'
  | 'elderly_support';

export type CreateJourneySessionRequest = {
  passenger_id: string;
  journey_id: string;
  vehicle_id: string;
  declared_ui_options: SupportOption[];
  consent_to_support_sharing: boolean;
  consent_enhanced_supervision: boolean;
  stop_request: boolean;
};

export type JourneySession = {
  session_id: string;
  passenger_id: string;
  journey_id: string;
  vehicle_id: string;
  declared_ui_options: SupportOption[];
  support_categories: string[];
  consent_to_support_sharing: boolean;
  consent_enhanced_supervision: boolean;
  stop_request: boolean;
  status: 'active' | 'completed';
  created_at: string;
  engine_input: {
    support_categories: string[];
    passenger_event: {
      stop_request: boolean;
      source: string;
      consented: boolean;
    };
    consent_enhanced_supervision: boolean;
  };
};