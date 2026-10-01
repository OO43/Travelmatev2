import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { TransportMode } from '@/models/journey';
import { useTravelmateStore } from '@/state/TravelmateStore';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type QuickAction = {
  mode: TransportMode;
  title: string;
  detail: string;
  icon: IconName;
  tone: 'mint' | 'blue' | 'lilac' | 'coral';
  enabled: boolean;
};

const quickActions: QuickAction[] = [
  { mode: 'bus', title: 'Bus', detail: 'MVP journey planning', icon: 'bus', tone: 'mint', enabled: true },
  { mode: 'train', title: 'Train', detail: 'Platforms and transfers', icon: 'train', tone: 'blue', enabled: true },
  { mode: 'flight', title: 'Flight', detail: 'Airport-to-gate support', icon: 'airplane', tone: 'lilac', enabled: true },
  { mode: 'car', title: 'Car hire', detail: 'Planned for a later release', icon: 'car', tone: 'coral', enabled: false },
];

export function useDashboardViewModel() {
  const { profile, currentJourney, latestTicket } = useTravelmateStore();
  return {
    passengerName: profile.preferredName,
    currentJourney,
    latestTicket,
    quickActions,
  };
}
