import { useTravelmateStore } from '@/state/TravelmateStore';

export function useAccessibilityViewModel() {
  const { profile } = useTravelmateStore();
  return { profile };
}

