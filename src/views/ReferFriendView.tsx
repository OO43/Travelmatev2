import { StyleSheet } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import { COLORS } from '@/theme';

export function ReferFriendView({ onBack, onShare, error, sharing }: {
  onBack: () => void; onShare: () => void; error: string; sharing: boolean;
}) {
  return <ScreenContainer header={<AppHeader title="Refer a friend" onBack={onBack} />}>
    <Card><Text style={styles.title}>Travel is better together</Text>
      <Text style={styles.body}>Know someone who could benefit from clearer journey information and accessibility support? Tell them about TravelMate.</Text>
      <Text style={styles.body}>Choose how to share your invitation on the next screen.</Text></Card>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <PrimaryButton label="Share TravelMate" icon="share-outline" onPress={onShare} loading={sharing} />
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: COLORS.ink },
  body: { fontSize: 16, lineHeight: 24, color: COLORS.inkSoft, marginTop: 12 },
  error: { fontSize: 14, color: COLORS.error },
});
