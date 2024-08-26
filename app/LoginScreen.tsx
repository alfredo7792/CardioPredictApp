import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { EXPO_API_URL } from "./(tabs)/enviroment";

interface LoginScreenProps {
  onLogin: (user: { user_id: number; username: string; role: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const api = EXPO_API_URL;

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
      {/* <Image source={require('./assets/logo.png')} style={styles.logo} /> */}
      <Text style={styles.title}>Ingresar al app CardioPredict</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <Image 
        source={{ uri: 'https://source.unsplash.com/random/800x600' }} 
        style={styles.logo} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#e6f2ff',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#004d99',
  },
  input: {
    height: 50,
    borderColor: '#004d99',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#004d99',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#004d99',
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});

export default LoginScreen;
