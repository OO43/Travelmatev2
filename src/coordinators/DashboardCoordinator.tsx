import { router } from 'expo-router';

import type { TransportMode } from '@/models/journey';
import { useDashboardViewModel } from '@/viewModels/useDashboardViewModel';
import { DashboardView } from '@/views/DashboardView';
import { useTravelmateStore } from '@/state/TravelmateStore';

export default function DashboardCoordinator() {
  const viewModel = useDashboardViewModel();
  const { journeys, currentJourney, alerts } = useTravelmateStore();
  const sessionId = journeys.find(item => item.journey.id === currentJourney?.id)?.sessionId;
  const openPlanner = (mode: TransportMode) => router.push({ pathname: '/journey-planner', params: { mode } });
  return <DashboardView {...viewModel} unreadCount={alerts.filter(alert => alert.unread).length}
    onAssistance={() => router.push('/assistance')} onAlerts={() => router.navigate('/alerts')}
    onSelectMode={openPlanner} onScanTicket={() => router.push('/ticket-scanner')}
    onOpenJourney={() => router.push({ pathname: '/journey-status', params: sessionId ? { sessionId } : {} })}
    onOpenProfile={() => router.push('/profile')} />;
}
