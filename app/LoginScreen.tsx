import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import {EXPO_API_URL} from "./(tabs)/enviroment";

interface LoginScreenProps {
  onLogin: (user: { user_id: number; username: string; role: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const api = EXPO_API_URL
  const handleLogin = () => {
    fetch(`${api}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Login successful') {
          onLogin({ user_id: data.user_id, username: data.username, role: data.role });
        } else {
          alert('Inicio de sesión fallido');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error de red');
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;
