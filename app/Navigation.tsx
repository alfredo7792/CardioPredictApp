// Navigation.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './(tabs)/index';
import EditFormUser from './editFormUser';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Edit" component={EditFormUser} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
