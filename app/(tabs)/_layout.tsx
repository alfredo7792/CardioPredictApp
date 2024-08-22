// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useAuth, AuthProvider } from './AuthContext';
import LoginScreen from '../LoginScreen';

const TabLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const { user, login } = useAuth();

  return (
    user ? (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'Chatbot',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart'} color={color} />
          ),
        }}
      />
      {/* Nueva pestaña para "Client Report" */}
      <Tabs.Screen
        name="client-report"
        options={{
          title: 'Client Report',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'briefcase' : 'briefcase-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  ) : (
    <LoginScreen onLogin={login} />
    )
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <TabLayout />
  </AuthProvider>
);

export default TabLayout;