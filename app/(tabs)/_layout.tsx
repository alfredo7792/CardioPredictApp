import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth, AuthProvider } from './AuthContext';
import LoginScreen from '../LoginScreen';
import ReportsComponent from './reports';
import Chatbot from '../chatbot';

// Importa manualmente los tabs que deseas incluir
import Profile from './profile';
import Home from './index';

const Tab = createBottomTabNavigator();

function Tabs() {
  const { user, login } = useAuth();
  return (
    user ? (
    <Tab.Navigator>
      <Tab.Screen
          name="Home"
          component={Home}
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
      <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
            ),
          }}
        />
        {user.role === "paciente" && (
          <Tab.Screen
            name="Chatbot"
            component={Chatbot}
            options={{
              title: 'Chatbot',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} />
              ),
            }}
          />
        )}
      {user.role === "admin" && (
          <Tab.Screen
            name="Reports"
            component={ReportsComponent}
            options={{
              title: 'Reports',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart'} color={color} />
              ),
            }}
          />
        )}
    </Tab.Navigator>
    ) : (
      <LoginScreen onLogin={login} />
    )
  );
}

export default Tabs;
