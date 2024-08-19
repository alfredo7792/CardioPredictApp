import { HelloWave } from '@/components/HelloWave';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './AuthContext';
import { EXPO_API_URL } from './enviroment';


interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  role_name?: string; // Agregar el nombre del rol
  age: number;
  sex:string;
}

interface Role {
  id: number;
  name: string;
}

const HomeScreen: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isMedico, setIsMedico] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const navigation = useNavigation<any>();

  // Fetch roles only once when the component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${EXPO_API_URL}/roles`);
        if (!response.ok) {
          throw new Error('Error fetching roles');
        }
        const result = await response.json();
        setRoles(result);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []); // Empty dependency array to run only once

  // Fetch user data when user changes and roles are available
  useEffect(() => {
    if (user && roles.length > 0) {
      setIsAdmin(user.role === 'admin');
      setIsMedico(user.role === 'medico');

      const fetchData = async () => {
        try {
          let url = '';
          if (user.role === 'admin') {
            url = `${EXPO_API_URL}/users`;
          } else if (user.role === 'medico') {
            url = `${EXPO_API_URL}/clients`;
          }

          if (url) {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Error fetching data from ${url}`);
            }
            const result = await response.json();
            const usersWithRoles = result.map((user: User) => {
              const role = roles.find(role => role.id === user.role_id);
              return { ...user, role_name: role?.name || 'Unknown' };
            });
            setData(usersWithRoles);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [user, roles]); // Run when user or roles change, but roles should be available first

  const handleEdit = (id: number) => {
    navigation.navigate('editFormUser', { userId: id });
  };

  const handleDelete = async () => {
    if (selectedId === null) return;

    try {
      let url = '';
      if (user?.role === 'admin') {
        url = `${EXPO_API_URL}/users/${selectedId}`;
      } else if (user?.role === 'medico') {
        url = `${EXPO_API_URL}/clients/${selectedId}`;
      }

      if (url) {
        const response = await fetch(url, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Error deleting item from ${url}`);
        }

        // Refresh data after deletion
        const fetchData = async () => {
          try {
            let fetchUrl = '';
            if (user?.role === 'admin') {
              fetchUrl = `${EXPO_API_URL}/users`;
            } else if (user?.role === 'medico') {
              fetchUrl = `${EXPO_API_URL}/clients`;
            }

            if (fetchUrl) {
              const result = await fetch(fetchUrl);
              if (!result.ok) {
                throw new Error(`Error fetching data from ${fetchUrl}`);
              }
              const data = await result.json();
              const usersWithRoles = data.map((user: User) => {
                const role = roles.find(role => role.id === user.role_id);
                return { ...user, role_name: role?.name || 'Unknown' };
              });
              setData(usersWithRoles);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };

        fetchData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setShowModal(false);
      setSelectedId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleConsulta = (id: number, age:number,sex:string) => {
    navigation.navigate('ConsultasScreen', { clientId: id , ageCategory:age, sex:sex });
  };
  

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.first_name} {item.last_name}</Text>
      <Text style={styles.tableCell}>{item.email}</Text>
      {isAdmin && <Text style={styles.tableCell}>{item.role_name}</Text>}
      <View style={styles.tableActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item.id)}>
          <Text style={styles.actionButtonText}>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => confirmDelete(item.id)}>
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleConsulta(item.id, item.age,item.sex)}>
          <Text style={styles.actionButtonText}>Consultas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  

// Resto del código...

return (
  <View style={styles.container}>
    <View style={styles.titleContainer}>
      <Text style={styles.title}>Bienvenido!</Text>
      <HelloWave />
    </View>
    {(isAdmin || isMedico) && (
      <View style={styles.tableContainer}>
        <Text style={styles.subtitle}>{isAdmin ? 'Lista de usuarios' : 'Lista de clientes'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FormNewUser')}>
          <Text style={styles.buttonText}>Nuevo</Text>
        </TouchableOpacity>
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

    {/* Modal for delete confirmation */}
    <Modal
      transparent={true}
      visible={showModal}
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirmar eliminación</Text>
          <Text style={styles.modalMessage}>¿Estás seguro de que quieres eliminar este usuario?</Text>
          <View style={styles.modalButtons}>
            <Button title="Cancelar" onPress={() => setShowModal(false)} />
            <Button title="Eliminar" onPress={handleDelete} />
          </View>
        </View>
      </View>
    </Modal>

    {/* Botón de Consultas */}
    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ConsultasScreen')}>
  <Text style={styles.buttonText}>Consultas</Text>
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
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonConsulta: {
    alignSelf: 'center',
    backgroundColor: '#28a745', // Cambia el color si lo deseas
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },  
});

export default HomeScreen;
