import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '@/theme';
import type { FeedbackRating } from '@/models/feedback';

const choices: { value: FeedbackRating; label: string }[] = [
  { value: 'helpful', label: 'Helpful' },
  { value: 'somewhat_helpful', label: 'Somewhat helpful' },
  { value: 'not_helpful', label: 'Not helpful' },
];

export function FeedbackView({ onBack, onSubmit }: { onBack: () => void; onSubmit: (rating: FeedbackRating, comment: string) => void }) {
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState('');
  return <ScreenContainer header={<AppHeader title="Journey feedback" subtitle="Help TravelMate improve" onBack={onBack} />}><View style={styles.section}><Text style={styles.question}>Was the journey guidance helpful?</Text>{choices.map((choice) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: rating === choice.value }} key={choice.value} onPress={() => setRating(choice.value)} style={[styles.choice, rating === choice.value && styles.selected]}><Text style={[styles.choiceText, rating === choice.value && styles.selectedText]}>{choice.label}</Text></Pressable>)}</View><View style={styles.section}><Text style={styles.label}>Anything else we should know?</Text><TextInput multiline value={comment} onChangeText={setComment} placeholder="Optional feedback" placeholderTextColor={COLORS.inkSoft} style={styles.input} /></View><PrimaryButton label="Submit feedback" icon="send" disabled={!rating} onPress={() => rating && onSubmit(rating, comment)} /></ScreenContainer>;
}

const styles = StyleSheet.create({ section: { gap: 10 }, question: { color: COLORS.ink, fontSize: 20, fontWeight: '900', marginBottom: 6 }, choice: { minHeight: 52, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' }, selected: { backgroundColor: COLORS.forest, borderColor: COLORS.forest }, choiceText: { color: COLORS.ink, fontWeight: '800' }, selectedText: { color: COLORS.white }, label: { color: COLORS.ink, fontWeight: '800' }, input: { minHeight: 120, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, padding: SPACING.md, textAlignVertical: 'top', color: COLORS.ink } });
