import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppHeader, Card, PrimaryButton, ScreenContainer } from '@/components/ui';
import type { PassengerProfile } from '@/models/passenger';
import { COLORS, RADIUS, SPACING } from '@/theme';

export function AccountView({ profile, onManageAccount, onSettings, onReferFriend, onHelp, onLogout }: {
  profile: PassengerProfile; onManageAccount: () => void; onSettings: () => void;
  onReferFriend: () => void; onHelp: () => void; onLogout: () => void;
}) {
  const name = profile.preferredName || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your account';
  return <ScreenContainer header={<AppHeader title="Account" subtitle="Your details, preferences and connections" />}>
    <Pressable accessibilityRole="button" accessibilityLabel={name + ', manage account'}
      accessibilityHint="Opens your personal information" onPress={onManageAccount}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.flex}><Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>TravelMate Passenger{profile.homeLocation ? ' · ' + profile.homeLocation : ''}</Text></View>
        <Ionicons name="chevron-forward" size={22} color={COLORS.forest} />
      </Card>
    </Pressable>
    <View style={styles.options}>
      <AccountCard icon="person-outline" title="Manage account" description="Personal information and contact details" onPress={onManageAccount} />
      <AccountCard icon="settings-outline" title="Settings" description="Support preferences and consent" onPress={onSettings} />
      <AccountCard icon="people-outline" title="Refer a friend" description="Share TravelMate with someone you know" onPress={onReferFriend} />
      <AccountCard icon="help-circle-outline" title="Help" description="Quick answers, guides and Contact us" onPress={onHelp} />
    </View>
    <PrimaryButton label="Log out" icon="log-out" variant="secondary" onPress={onLogout} />
  </ScreenContainer>;
}

function AccountCard({ icon, title, description, onPress }: {
  icon: 'person-outline' | 'settings-outline' | 'people-outline' | 'help-circle-outline';
  title: string; description: string; onPress: () => void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}
    style={({ pressed }) => pressed && styles.pressed}>
    <Card style={styles.option}>
      <View style={styles.optionIcon}><Ionicons name={icon} size={24} color={COLORS.forest} /></View>
      <View style={styles.flex}><Text style={styles.optionTitle}>{title}</Text><Text style={styles.meta}>{description}</Text></View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.inkSoft} />
    </Card>
  </Pressable>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.forestSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.forest, fontSize: 22, fontWeight: '900' },
  name: { color: COLORS.ink, fontSize: 18, fontWeight: '900' },
  meta: { color: COLORS.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 4 },
  options: { gap: SPACING.md },
  option: { flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 90 },
  optionIcon: { width: 46, height: 46, borderRadius: RADIUS.sm, backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 18 },
  pressed: { opacity: 0.75 },
});
