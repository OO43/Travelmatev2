import { useState } from 'react';
import { Share } from 'react-native';
import { router } from 'expo-router';
import { ReferFriendView } from '@/views/ReferFriendView';

export default function ReferFriendCoordinator() {
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  async function share() {
    try {
      setSharing(true); setError('');
      await Share.share({ title: 'Try TravelMate',
        message: 'I’ve been trying TravelMate — an app for journey planning and personalised accessibility support. I thought you might be interested!' });
    } catch {
      setError('Unable to open sharing. Please try again.');
    } finally { setSharing(false); }
  }
  return <ReferFriendView onBack={() => router.back()} onShare={() => { void share(); }}
    error={error} sharing={sharing} />;
}
