import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { COLORS } from '@/theme';

export const unstable_settings = { anchor: 'dashboard' };

export default function MainTabsLayout() {
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.forest,
        tabBarInactiveTintColor: COLORS.inkSoft,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.line,
          minHeight: 64,
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'TravelMate home',
          tabBarIcon: ({ focused, size }) => <Ionicons name="home" color={focused ? COLORS.forest : COLORS.inkSoft} size={size} />,
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: 'Journeys',
          tabBarIcon: ({ focused, size }) => <Ionicons name="map" color={focused ? COLORS.forest : COLORS.inkSoft} size={size} />,
        }}
      />
      <Tabs.Screen
        name="accessibility"
        options={{
          title: 'Get help',
          tabBarIcon: ({ focused, size }) => <Ionicons name="hand-left" color={focused ? COLORS.forest : COLORS.inkSoft} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused, size }) => <Ionicons name="notifications" color={focused ? COLORS.forest : COLORS.inkSoft} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused, size }) => <Ionicons name="person" color={focused ? COLORS.forest : COLORS.inkSoft} size={size} />,
        }}
      />
    </Tabs>
  );
}

