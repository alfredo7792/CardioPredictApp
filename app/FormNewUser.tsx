import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { EXPO_API_URL } from './(tabs)/enviroment';

const FormScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [DNI, setDNI] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${EXPO_API_URL}/roles`);
        if (!response.ok) {
          throw new Error('Error fetching roles');
        }
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  const validateForm = () => {
    const errors: string[] = [];

    if (!firstName) errors.push('First name is required');
    if (!lastName) errors.push('Last name is required');
    if (!DNI || DNI.length !== 8 || !/^\d+$/.test(DNI)) errors.push('DNI must be exactly 8 numeric characters');
    if (!age || parseInt(age) <= 0) errors.push('Age must be a positive number');
    if (!sex) errors.push('Sex is required');
    if (!username) errors.push('Username is required');
    if (!email || !/\S+@\S+\.\S+/.test(email)) errors.push('Invalid email address');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters long');
    if (!roleId) errors.push('Role is required');

    setErrorMessages(errors);

    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the highlighted errors.');
      return;
    }

    const newUser = {
      first_name: firstName,
      last_name: lastName,
      DNI,
      age: parseInt(age),
      sex,
      username,
      email,
      password,
      role_id: parseInt(roleId),
    };

    try {
      const response = await fetch(`${EXPO_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Error in form submission');
      }

      console.log('Form submitted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
        />
        {errorMessages.includes('First name is required') && <Text style={styles.errorText}>First name is required</Text>}

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
        />
        {errorMessages.includes('Last name is required') && <Text style={styles.errorText}>Last name is required</Text>}

        <Text style={styles.label}>DNI</Text>
        <TextInput
          style={styles.input}
          value={DNI}
          onChangeText={setDNI}
          placeholder="Enter DNI"
          keyboardType="numeric"
        />
        {errorMessages.includes('DNI must be exactly 8 numeric characters') && <Text style={styles.errorText}>DNI must be exactly 8 numeric characters</Text>}

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter age"
          keyboardType="numeric"
        />
        {errorMessages.includes('Age must be a positive number') && <Text style={styles.errorText}>Age must be a positive number</Text>}

        <Text style={styles.label}>Sex</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sex ?? ""}
            style={styles.picker}
            onValueChange={(itemValue) => setSex(itemValue)}
          >
            <Picker.Item label="Select sex" value="" />
            <Picker.Item label="Masculino" value="M" />
            <Picker.Item label="Femenino" value="F" />
          </Picker>
        </View>
        {errorMessages.includes('Sex is required') && <Text style={styles.errorText}>Sex is required</Text>}

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />
        {errorMessages.includes('Username is required') && <Text style={styles.errorText}>Username is required</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
        />
        {errorMessages.includes('Invalid email address') && <Text style={styles.errorText}>Invalid email address</Text>}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
        {errorMessages.includes('Password must be at least 6 characters long') && <Text style={styles.errorText}>Password must be at least 6 characters long</Text>}

        <Text style={styles.label}>Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={roleId ?? ""}
            style={styles.picker}
            onValueChange={(itemValue) => setRoleId(itemValue)}
          >
            <Picker.Item label="Select a role" value="" />
            {roles.map((role) => (
              <Picker.Item key={role.id} label={role.name} value={role.id} />
            ))}
          </Picker>
        </View>
        {errorMessages.includes('Role is required') && <Text style={styles.errorText}>Role is required</Text>}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>        
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    height: 40,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ccc',
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: '#f44336',
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 4,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  cancelButtonText: {
    color: '#fff',
  },
});

export default FormScreen;
