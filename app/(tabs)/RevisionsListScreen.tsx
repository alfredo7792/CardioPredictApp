import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EXPO_API_URL } from './enviroment';

interface Revision {
  id: number;
  results_id: number;
  start_time: string;
  end_time: string;
  diagnosis: string;
  key_factors: string;
  patient_status: 'LEVE' | 'MEDIO' | 'GRAVE';
  date_created: string;
}

const RevisionsListScreen: React.FC = () => {
  const [data, setData] = useState<Revision[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newRevision, setNewRevision] = useState<Partial<Revision>>({});
  const navigation = useNavigation<any>();

  // Fetch revisions data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${EXPO_API_URL}/revisions`);
        if (!response.ok) {
          throw new Error('Error fetching revisions');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching revisions:', error);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (revision: Revision | null) => {
    setNewRevision(revision ? { ...revision } : { 
      start_time: '',
      end_time: '',
      diagnosis: '',
      key_factors: '',
      patient_status: 'LEVE',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (selectedId === null) return;

    try {
      const response = await fetch(`${EXPO_API_URL}/revisions/${selectedId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error deleting revision');
      }

      // Refresh data after deletion
      const fetchData = async () => {
        try {
          const response = await fetch(`${EXPO_API_URL}/revisions`);
          if (!response.ok) {
            throw new Error('Error fetching revisions');
          }
          const result = await response.json();
          setData(result);
        } catch (error) {
          console.error('Error fetching revisions:', error);
        }
      };

      fetchData();
    } catch (error) {
      console.error('Error deleting revision:', error);
    } finally {
      setShowModal(false);
      setSelectedId(null);
    }
  };

  const handleSave = async () => {
    try {
      const method = newRevision.id ? 'PUT' : 'POST';
      const url = newRevision.id 
        ? `${EXPO_API_URL}/revisions/${newRevision.id}`
        : `${EXPO_API_URL}/revisions`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRevision),
      });

      if (!response.ok) {
        throw new Error('Error saving revision');
      }

      // Refresh data after save
      const fetchData = async () => {
        try {
          const response = await fetch(`${EXPO_API_URL}/revisions`);
          if (!response.ok) {
            throw new Error('Error fetching revisions');
          }
          const result = await response.json();
          setData(result);
        } catch (error) {
          console.error('Error fetching revisions:', error);
        }
      };

      fetchData();
    } catch (error) {
      console.error('Error saving revision:', error);
    } finally {
      setShowModal(false);
      setNewRevision({});
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const renderItem = ({ item }: { item: Revision }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>ID: {item.id}</Text>
      <Text style={styles.tableCell}>Start: {item.start_time}</Text>
      <Text style={styles.tableCell}>End: {item.end_time}</Text>
      <Text style={styles.tableCell}>Diagnosis: {item.diagnosis}</Text>
      <Text style={styles.tableCell}>Status: {item.patient_status}</Text>
      <View style={styles.tableActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionButtonText}>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => confirmDelete(item.id)}>
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tableContainer}>
        <Text style={styles.subtitle}>Lista de Revisiones</Text>
        <TouchableOpacity style={styles.button} onPress={() => handleEdit(null)}>
          <Text style={styles.buttonText}>Nueva Revisión</Text>
        </TouchableOpacity>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>ID</Text>
          <Text style={styles.headerCell}>Start Time</Text>
          <Text style={styles.headerCell}>End Time</Text>
          <Text style={styles.headerCell}>Diagnosis</Text>
          <Text style={styles.headerCell}>Status</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {/* Modal for edit and delete confirmation */}
      <Modal
        transparent={true}
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{newRevision.id ? 'Actualizar Revisión' : 'Nueva Revisión'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Start Time"
              value={newRevision.start_time || ''}
              onChangeText={(text) => setNewRevision({ ...newRevision, start_time: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="End Time"
              value={newRevision.end_time || ''}
              onChangeText={(text) => setNewRevision({ ...newRevision, end_time: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Diagnosis"
              value={newRevision.diagnosis || ''}
              onChangeText={(text) => setNewRevision({ ...newRevision, diagnosis: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Key Factors"
              value={newRevision.key_factors || ''}
              onChangeText={(text) => setNewRevision({ ...newRevision, key_factors: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Patient Status"
              value={newRevision.patient_status || 'LEVE'}
              onChangeText={(text) => setNewRevision({ ...newRevision, patient_status: text as 'LEVE' | 'MEDIO' | 'GRAVE' })}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setShowModal(false)} />
              <Button title="Guardar" onPress={handleSave} />
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
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 16,
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
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default RevisionsListScreen;
