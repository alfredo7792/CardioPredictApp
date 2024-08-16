// FormScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FormScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const colorScheme = useColorScheme(); // Obtén el esquema de color del dispositivo
  const navigation = useNavigation();

  const handleSubmit = () => {
    // Implementa la lógica para enviar los datos del formulario
    console.log('Form submitted with:', { firstName, lastName, email, role });
    // Redirige al usuario a la pantalla anterior o realiza otra acción
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>First Name</Text>
      <TextInput
        style={[styles.input, { borderColor: colorScheme === 'dark' ? '#fff' : '#000' }]}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
      />
      
      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Last Name</Text>
      <TextInput
        style={[styles.input, { borderColor: colorScheme === 'dark' ? '#fff' : '#000' }]}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
      />
      
      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Email</Text>
      <TextInput
        style={[styles.input, { borderColor: colorScheme === 'dark' ? '#fff' : '#000' }]}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
      />
      
      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Role</Text>
      <TextInput
        style={[styles.input, { borderColor: colorScheme === 'dark' ? '#fff' : '#000' }]}
        value={role}
        onChangeText={setRole}
        placeholder="Enter role"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
      />

      <Button title="Submit" onPress={handleSubmit} color={colorScheme === 'dark' ? '#007BFF' : '#007BFF'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default FormScreen;
