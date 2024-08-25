import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { EXPO_API_URL } from './(tabs)/enviroment';
import { useAuth } from './(tabs)/AuthContext';

const API_URL = EXPO_API_URL + '/users';
const API_URL_PASSWORD = EXPO_API_URL + '/usersPassword';
const ROLES_URL = EXPO_API_URL + '/roles';

const EditFormUser: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as { userId: number };
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedSex, setSelectedSex] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState<string>(''); // Estado separado para la nueva contraseña
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/${userId}`);
        if (!response.ok) {
          throw new Error('Error fetching user data');
        }
        const data = await response.json();
        setUserData(data);
        setSelectedRole(data.role_id || null);
        setSelectedSex(data.sex || null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await fetch(ROLES_URL);
        if (!response.ok) {
          throw new Error('Error fetching roles');
        }
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchUserData();
    fetchRoles();
  }, [userId]);

  const validateForm = () => {
    const errors: string[] = [];

    if (!userData?.first_name) errors.push('First name is required');
    if (!userData?.last_name) errors.push('Last name is required');
    if (!userData?.DNI || userData.DNI.length !== 8 || !/^\d+$/.test(userData.DNI)) errors.push('DNI must be exactly 8 numeric characters');
    if (!userData?.age || parseInt(userData.age) <= 0) errors.push('Age must be a positive number');
    if (!selectedSex) errors.push('Sex is required');
    if (!userData?.username) errors.push('Username is required');
    if (!userData?.email || !/\S+@\S+\.\S+/.test(userData.email)) errors.push('Invalid email address');
    if (!selectedRole) errors.push('Role is required');
    if (!userData?.phone) errors.push('Phone number is required');

    setErrorMessages(errors);

    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the highlighted errors.');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare the user data to be sent
      var updatedUserData;
      if (newPassword.trim() !== '') {
        updatedUserData = {
          ...userData,
          sex: selectedSex,
          role_id: parseInt(selectedRole || '0'),
          phone: userData.phone,
          password: newPassword
        };
      } else {
        updatedUserData = {
          ...userData,
          sex: selectedSex,
          role_id: parseInt(selectedRole || '0'),
          phone: userData.phone
        };
      }
      
      var response;
      if (newPassword.trim() !== '') {
        response = await fetch(`${API_URL_PASSWORD}/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUserData),
        });
      } else {
        response = await fetch(`${API_URL}/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUserData),
        });
      }

      if (!response.ok) {
        throw new Error('Error updating user data');
      }
      alert('User updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit User</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={userData?.first_name || ''}
          onChangeText={(text) => setUserData({ ...userData, first_name: text })}
          placeholder="Enter first name"
        />
        {errorMessages.includes('First name is required') && <Text style={styles.errorText}>First name is required</Text>}

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={userData?.last_name || ''}
          onChangeText={(text) => setUserData({ ...userData, last_name: text })}
          placeholder="Enter last name"
        />
        {errorMessages.includes('Last name is required') && <Text style={styles.errorText}>Last name is required</Text>}

        <Text style={styles.label}>DNI</Text>
        <TextInput
          style={styles.input}
          value={userData?.DNI || ''}
          onChangeText={(text) => setUserData({ ...userData, DNI: text })}
          placeholder="Enter DNI"
          keyboardType="numeric"
        />
        {errorMessages.includes('DNI must be exactly 8 numeric characters') && <Text style={styles.errorText}>DNI must be exactly 8 numeric characters</Text>}

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={userData?.age?.toString() || ''}
          onChangeText={(text) => setUserData({ ...userData, age: parseInt(text) })}
          placeholder="Enter age"
          keyboardType="numeric"
        />
        {errorMessages.includes('Age must be a positive number') && <Text style={styles.errorText}>Age must be a positive number</Text>}

        <Text style={styles.label}>Sex</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSex}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedSex(itemValue)}
          >
            <Picker.Item label="Select sex" value={null} />
            <Picker.Item label="Masculino" value="M" />
            <Picker.Item label="Femenino" value="F" />
          </Picker>
        </View>
        {errorMessages.includes('Sex is required') && <Text style={styles.errorText}>Sex is required</Text>}

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={userData?.username || ''}
          onChangeText={(text) => setUserData({ ...userData, username: text })}
          placeholder="Enter username"
        />
        {errorMessages.includes('Username is required') && <Text style={styles.errorText}>Username is required</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={userData?.email || ''}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
          placeholder="Enter email"
          keyboardType="email-address"
        />
        {errorMessages.includes('Invalid email address') && <Text style={styles.errorText}>Invalid email address</Text>}
        
        {(user?.role === 'admin' || user?.role === 'medico') ? (
          <>
            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedRole}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedRole(itemValue)}
              >
                <Picker.Item label="Select role" value={null} />
                {roles.map((role) => (
                  <Picker.Item key={role.id} label={role.name} value={role.id} />
                ))}
              </Picker>
            </View>
            {errorMessages.includes('Role is required') && <Text style={styles.errorText}>Role is required</Text>}
          </>
        ) : null}

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={userData?.phone || ''}
          onChangeText={(text) => setUserData({ ...userData, phone: text })}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        {errorMessages.includes('Phone number is required') && <Text style={styles.errorText}>Phone number is required</Text>}

        <Text style={styles.label}>New Password (optional)</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
          placeholder="Enter new password"
          secureTextEntry
        />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isSaving}>
              <Text style={styles.buttonText}>Update</Text>
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
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
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

export default EditFormUser;
