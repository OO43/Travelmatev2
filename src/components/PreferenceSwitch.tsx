import { StyleSheet, Switch, View } from 'react-native';
import { AppText as Text } from './AppText';
import { COLORS } from '@/theme';

export function PreferenceSwitch({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (value: boolean) => void;
}) {
  return <View style={styles.row}>
    <View style={styles.copy}><Text style={styles.title}>{label}</Text><Text style={styles.detail}>{description}</Text></View>
    <Switch accessibilityLabel={label} accessibilityHint={description} value={value} onValueChange={onChange}
      trackColor={{ false: '#89949F', true: '#144F85' }} thumbColor={COLORS.white} />
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  copy: { flex: 1 }, title: { color: COLORS.ink, fontSize: 16, fontWeight: '700' },
  detail: { color: COLORS.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 4 },
});
