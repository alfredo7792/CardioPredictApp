import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const API_URL = 'http://127.0.0.1:8080/users';
const ROLES_URL = 'http://127.0.0.1:8080/roles';

const EditFormUser: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as { userId: number };
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [isRoleDropdownVisible, setIsRoleDropdownVisible] = useState(false);
  const [isSexDropdownVisible, setIsSexDropdownVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedSex, setSelectedSex] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/${userId}`);
        if (!response.ok) {
          throw new Error('Error fetching user data');
        }
        const data = await response.json();
        setUserData(data);
        setSelectedRole(data.role_id|| null);
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
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Edit User</Text>

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>First Name</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={userData?.first_name || ''}
          onChangeText={(text) => setUserData({ ...userData, first_name: text })}
          placeholder="Enter first name"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Last Name</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={userData?.last_name || ''}
          onChangeText={(text) => setUserData({ ...userData, last_name: text })}
          placeholder="Enter last name"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>DNI</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={userData?.DNI || ''}
          onChangeText={(text) => setUserData({ ...userData, DNI: text })}
          placeholder="Enter DNI"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Age</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={userData?.age?.toString() || ''}
          onChangeText={(text) => setUserData({ ...userData, age: parseInt(text) })}
          placeholder="Enter age"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Sex</Text>
        <TouchableOpacity
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc', justifyContent: 'center' }]}
          onPress={() => setIsSexDropdownVisible(!isSexDropdownVisible)}
        >
          <Text style={[styles.inputRole, { color: selectedSex ? (colorScheme === 'dark' ? '#fff' : '#000') : colorScheme === 'dark' ? '#aaa' : '#666' }]}>
            {selectedSex ? (selectedSex === 'M' ? 'Masculino' : 'Femenino') : 'Select sex'}
          </Text>
        </TouchableOpacity>

        {isSexDropdownVisible && (
          <View style={[styles.dropdown, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
            <TouchableOpacity
              style={[styles.dropdownItem, { backgroundColor: colorScheme === 'dark' ? '#444' : '#eee' }]}
              onPress={() => {
                setSelectedSex('M');
                setIsSexDropdownVisible(false);
              }}
            >
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Masculino</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdownItem, { backgroundColor: colorScheme === 'dark' ? '#444' : '#eee' }]}
              onPress={() => {
                setSelectedSex('F');
                setIsSexDropdownVisible(false);
              }}
            >
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Femenino</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Username</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={userData?.username || ''}
          onChangeText={(text) => setUserData({ ...userData, username: text })}
          placeholder="Enter username"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={userData?.email || ''}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
          placeholder="Enter email"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Role</Text>
        <TouchableOpacity
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc', justifyContent: 'center' }]}
          onPress={() => setIsRoleDropdownVisible(!isRoleDropdownVisible)}
        >
          <Text style={[styles.inputRole, { color: selectedRole ? (colorScheme === 'dark' ? '#fff' : '#000') : colorScheme === 'dark' ? '#aaa' : '#666' }]}>
            {selectedRole ? roles.find(role => role.id === selectedRole)?.name : 'Select role'}
          </Text>
        </TouchableOpacity>

        {isRoleDropdownVisible && (
          <View style={[styles.dropdown, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[styles.dropdownItem, { backgroundColor: colorScheme === 'dark' ? '#444' : '#eee' }]}
                onPress={() => {
                  setSelectedRole(role.id);
                  setIsRoleDropdownVisible(false);
                }}
              >
                <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>{role.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <Button title="Save" onPress={handleSave} disabled={isSaving} />
          <Button title="Cancel" onPress={() => navigation.goBack()} color="#f00" />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  inputRole: {
    fontSize: 16,
    color: '#666',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default EditFormUser;
