import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}

const HomeScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigation = useNavigation();

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');

    if (user?.role === 'admin') {
      fetch(`${process.env.EXPO_API_URL}/users`)
        .then(response => response.json())
        .then((data: User[]) => setUsers(data))
        .catch(error => console.error('Error fetching users:', error));
    }
  }, [user]);

  const handleEdit = (userId: number) => {
    console.log(`Edit user ${userId}`);
  };

  const handleDelete = (userId: number) => {
    console.log(`Delete user ${userId}`);
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.first_name} {item.last_name}</Text>
      <Text style={styles.tableCell}>{item.email}</Text>
      <Text style={styles.tableCell}>Role: {item.role_id}</Text>
      <View style={styles.tableActions}>
        <TouchableOpacity onPress={() => handleEdit(item.id)}>
          <Text style={styles.actionButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.actionButton}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome!</Text>
        <HelloWave />
      </View>
      {isAdmin && (
        <View style={styles.tableContainer}>
          <Text style={styles.subtitle}>User List</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Email</Text>
            <Text style={styles.headerCell}>Role</Text>
            <Text style={styles.headerCell}>Actions</Text>
          </View>
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
          />
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FormNewUser' as never)}>
        <Text style={styles.buttonText}>Crear Nuevo Usuario</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tableContainer: {
    marginVertical: 16,
    marginHorizontal: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '30%',
  },
  actionButton: {
    color: '#007BFF',
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;