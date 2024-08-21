import { HelloWave } from '@/components/HelloWave';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './AuthContext';
import { EXPO_API_URL } from './enviroment';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  DNI: string;
  email: string;
  role_id: number;
  role_name?: string;
  age: number;
  sex: string;
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
  const [lastNameFilter, setLastNameFilter] = useState<string>('');
  const [dniFilter, setDniFilter] = useState<string>('');
  const navigation = useNavigation<any>();


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
  }, []);

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
  }, [user, roles]);

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

  const handleView = (id: number, age: number, sex: string) => {
    navigation.navigate('indexConsultas', { id, age, sex });
  };



  const handleConsulta = (id: number, age: number, sex: string) => {
    navigation.navigate('ConsultasScreen', { clientId: id, ageCategory: age, sex: sex });
  };

  const handleChatBot= (id: number) => {
    navigation.navigate('chatbot2', { clientId: id});
  };

  const filteredData = data.filter(user => {
    return (
      (!lastNameFilter || user.last_name.toLowerCase().includes(lastNameFilter.toLowerCase())) &&
      (!dniFilter || user.DNI.toString().includes(dniFilter))
    );
  });



  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.roleColumn]}>{item.DNI}</Text>
      <Text style={[styles.tableCell, styles.roleColumn]}>{item.first_name} {item.last_name}</Text>
      <Text style={[styles.tableCell, styles.roleColumn]}>{item.email}</Text>
      {isAdmin && <Text style={[styles.tableCell, styles.roleColumn]}>{item.role_name}</Text>}

      <View style={styles.tableActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(item.id)}>
          <Text style={styles.actionButtonText}>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmDelete(item.id)}>
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.consultaButton]} onPress={() => handleConsulta(item.id, item.age, item.sex)}>
          <Text style={styles.actionButtonText}>Consultas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={() => handleChatBot(item.id)}>
          <Text style={styles.actionButtonText}>ChatBot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={() => handleView(item.id, item.age, item.sex)}>
          <Text style={styles.actionButtonText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="Filtrar por apellido"
              value={lastNameFilter}
              onChangeText={setLastNameFilter}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Filtrar por DNI"
              value={dniFilter}
              onChangeText={setDniFilter}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.roleColumn]}>DNI</Text>
            <Text style={[styles.tableCell, styles.roleColumn]}>Name</Text>
            <Text style={[styles.tableCell, styles.roleColumn]}>Email</Text>
            {isAdmin && <Text style={[styles.tableCell, styles.roleColumn]}>Role</Text>}
            <Text style={styles.headerCell}>Acciones</Text>
          </View>
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

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
              <TouchableOpacity style={[styles.actionButton, styles.consultaButton]} onPress={() => setShowModal(false)}>
                <Text style={styles.actionButtonText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                <Text style={styles.actionButtonText}>ELIMINAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tableContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center', // Centra el texto de las cabeceras
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    color: '#333',
    textAlign: 'center', // Centra el texto de las celdas
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  consultaButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center', // Centra el texto de los botones de acción
  },
  roleColumn: {
    flex: 0.5, // Establece el ancho deseado para la columna "Role"
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  filterInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  centerText: {
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '50%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderRadius: 5,
  },
  viewButton: {
    backgroundColor: '#00CED1', // color del botón "Ver"
  },
});

export default HomeScreen;