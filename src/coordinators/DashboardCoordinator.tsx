import { router } from 'expo-router';

import type { TransportMode } from '@/models/journey';
import { useDashboardViewModel } from '@/viewModels/useDashboardViewModel';
import { DashboardView } from '@/views/DashboardView';

export default function DashboardCoordinator() {
  const viewModel = useDashboardViewModel();
  const openPlanner = (mode: TransportMode) => router.push({ pathname: '/journey-planner', params: { mode } });
  return <DashboardView {...viewModel} onSelectMode={openPlanner} onScanTicket={() => router.push('/ticket-scanner')} onOpenJourney={() => router.push('/journey-status')} onOpenProfile={() => router.push('/profile')} />;
}
