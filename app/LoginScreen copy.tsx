import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LoginScreenProps {
  onLogin: (user: { user_id: number; username: string; role: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // Datos de usuario ficticios
  const fakeUser = {
    user_id: 1,
    username: 'fakeuser',
    role: 'user',
  };

  // Simular el inicio de sesión
  const handleLogin = () => {
    onLogin(fakeUser);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresar al app CardioPredict</Text>
      <Text style={styles.subtitle}>Inicio de sesión desactivado temporalmente</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#004d99',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#888',
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
});

export default LoginScreen;