import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, useColorScheme, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSexDropdownVisible, setIsSexDropdownVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const colorScheme = useColorScheme();
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

  const handleSubmit = async () => {
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
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Register</Text>

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>First Name</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Last Name</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>DNI</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={DNI}
          onChangeText={setDNI}
          placeholder="Enter DNI"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Age</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={age}
          onChangeText={setAge}
          placeholder="Enter age"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Sex</Text>
        <TouchableOpacity
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc', justifyContent: 'center' }]}
          onPress={() => setIsSexDropdownVisible(!isSexDropdownVisible)}
        >
          <Text style={[styles.inputRole, { color: sex ? (colorScheme === 'dark' ? '#fff' : '#000') : colorScheme === 'dark' ? '#aaa' : '#666' }]}>
            {sex ? (sex === 'M' ? 'Masculino' : 'Femenino') : 'Select sex'}
          </Text>
        </TouchableOpacity>

        {isSexDropdownVisible && (
          <View style={[styles.dropdown, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
            <TouchableOpacity
              style={[styles.dropdownItem, { backgroundColor: colorScheme === 'dark' ? '#444' : '#eee' }]}
              onPress={() => {
                setSex('M');
                setIsSexDropdownVisible(false);
              }}
            >
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Masculino</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdownItem, { backgroundColor: colorScheme === 'dark' ? '#444' : '#eee' }]}
              onPress={() => {
                setSex('F');
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
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Password</Text>
        <TextInput
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc' }]}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          secureTextEntry
        />

        <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Role</Text>
        <TouchableOpacity
          style={[styles.input, { borderColor: colorScheme === 'dark' ? '#aaa' : '#ccc', justifyContent: 'center' }]}
          onPress={() => setIsDropdownVisible(!isDropdownVisible)}
        >
          <Text style={[styles.inputRole, { color: selectedRole ? (colorScheme === 'dark' ? '#fff' : '#000') : colorScheme === 'dark' ? '#aaa' : '#666' }]}>
            {selectedRole ? selectedRole : 'Select a role'}
          </Text>
        </TouchableOpacity>

        {isDropdownVisible && (
          <View style={[styles.dropdown, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
            <FlatList
              data={roles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dropdownItem, { backgroundColor: colorScheme === 'dark' ? '#444' : '#eee' }]}
                  onPress={() => {
                    setSelectedRole(item.name);
                    setRoleId(item.id);
                    setIsDropdownVisible(false);
                  }}
                >
                  <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 16,
    flex: 1,
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
    lineHeight: 40,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 8,
  },
});

export default FormScreen;
