import { useState } from 'react';
import { useTravelmateStore } from '@/state/TravelmateStore';
export function useAlertsViewModel() {
  const { alerts, markRead, markAllRead, dismissAlert, loadSampleAlerts } = useTravelmateStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'journey'>('all');
  return { alerts: alerts.filter(alert => filter === 'all' || (filter === 'unread' ? alert.unread : alert.category === 'journey')),
    totalCount: alerts.length, unreadCount: alerts.filter(alert => alert.unread).length,
    filter, setFilter, markRead, markAllRead, dismissAlert, loadSampleAlerts };
}

