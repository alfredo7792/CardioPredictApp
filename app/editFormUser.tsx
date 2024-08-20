import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { EXPO_API_URL } from './(tabs)/enviroment';

const API_URL = EXPO_API_URL + '/users';
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, sex: selectedSex, role_id: parseInt(selectedRole || '0') }),
      });
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

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={userData?.last_name || ''}
          onChangeText={(text) => setUserData({ ...userData, last_name: text })}
          placeholder="Enter last name"
        />

        <Text style={styles.label}>DNI</Text>
        <TextInput
          style={styles.input}
          value={userData?.DNI || ''}
          onChangeText={(text) => setUserData({ ...userData, DNI: text })}
          placeholder="Enter DNI"
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={userData?.age?.toString() || ''}
          onChangeText={(text) => setUserData({ ...userData, age: parseInt(text) })}
          placeholder="Enter age"
          keyboardType="numeric"
        />

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

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={userData?.username || ''}
          onChangeText={(text) => setUserData({ ...userData, username: text })}
          placeholder="Enter username"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={userData?.email || ''}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
          placeholder="Enter email"
        />

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
