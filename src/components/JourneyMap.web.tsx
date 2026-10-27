import { AppText as Text } from '@/components/AppText';
import { Card } from '@/components/Card';
import type { Journey } from '@/models/journey';
import { COLORS } from '@/theme';

export function JourneyMap({ journey }: { journey: Journey }) {
  if (journey.source !== 'tfl') return null;
  return <Card><Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '800' }}>Route map</Text>
    <Text style={{ color: COLORS.inkSoft, fontSize: 14, lineHeight: 22 }}>Open this journey in the iOS or Android app to view its interactive map. Journey steps remain available below.</Text></Card>;
}
