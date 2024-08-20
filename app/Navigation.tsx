// Navigation.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from './(tabs)/index';
import ConsultasScreen from './ConsultasScreen';
import EditFormUser from './editFormUser';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Edit" component={EditFormUser} />
        <Stack.Screen name="ConsultasScreen" component={ConsultasScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
