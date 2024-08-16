import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import { EXPO_API_URL } from './enviroment';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}

const HomeScreen: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isMedico, setIsMedico] = useState<boolean>(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin');
      setIsMedico(user.role === 'medico');
      
      const fetchData = async () => {
        try {
          let url = '';
          if (user.role === 'admin') {
            url = `${EXPO_API_URL}/users`;
          } else if (user.role === 'medico') {
            url = 'http://127.0.0.1:8080/clients';
          }

          if (url) {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Error fetching data from ${url}`);
            }
            const result = await response.json();
            setData(result);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [user]);

  const handleEdit = (id: number) => {
    console.log(`Edit ${user?.role === 'admin' ? 'user' : 'client'} ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Delete ${user?.role === 'admin' ? 'user' : 'client'} ${id}`);
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.first_name} {item.last_name}</Text>
      <Text style={styles.tableCell}>{item.email}</Text>
      {isAdmin && <Text style={styles.tableCell}>Role: {item.role_id}</Text>}
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
      {(isAdmin || isMedico) && (
        <View style={styles.tableContainer}>
          <Text style={styles.subtitle}>{isAdmin ? 'User List' : 'Client List'}</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Email</Text>
            {isAdmin && <Text style={styles.headerCell}>Role</Text>}
            <Text style={styles.headerCell}>Actions</Text>
          </View>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FormNewUser' as never)}>
        <Text style={styles.buttonText}>Create New User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  tableContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#555',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
  tableActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    color: '#007BFF',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
