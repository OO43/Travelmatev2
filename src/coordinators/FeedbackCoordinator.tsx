import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import type { FeedbackRating } from '@/models/feedback';
import { FeedbackView } from '@/views/FeedbackView';

export default function FeedbackCoordinator() {
  function submit(rating: FeedbackRating, comment: string) {
    console.log('Journey feedback', { rating, comment });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Feedback received', 'Thank you for helping TravelMate improve.', [{ text: 'Done', onPress: () => router.replace('/') }]);
  }
  return <FeedbackView onBack={() => router.back()} onSubmit={submit} />;
}
