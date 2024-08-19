import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Button, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';

interface Revision {
  id: number;
  results_id: number;
  start_time: number;
  end_time: number;
  diagnosis: string;
  key_factors: string;
  patient_status: 'LEVE' | 'MEDIO' | 'GRAVE';
  date_created: string;
}

type PatientStatus = 'LEVE' | 'MEDIO' | 'GRAVE';

// Función para convertir segundos a formato hora
const convertSecondsToTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return moment()
    .hours(hours)
    .minutes(minutes)
    .seconds(secs)
    .format('hh:mm A'); // Cambia el formato según tus necesidades
};

// Función para convertir segundos a formato hora
const convertSecondsToTimeForm24 = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return moment()
    .hours(hours)
    .minutes(minutes)
    .seconds(secs)
    .format('HH:mm:ss');
};

const convertTimeToSeconds = (time: string) => {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};

const EXPO_API_URL = 'http://localhost:8000'; // Asegúrate de usar la URL correcta

const RevisionsListScreen: React.FC = () => {
  const [data, setData] = useState<Revision[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newRevision, setNewRevision] = useState<Partial<Revision>>({});
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState("LEVE");
  const [isTimePickerVisible, setIsTimePickerVisible] = useState<boolean>(false);
  const [timeType, setTimeType] = useState<'start_time' | 'end_time' | null>(null);


  // Fetch revisions data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${EXPO_API_URL}/api/revision/list`);
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
    if (revision) {
      console.log("hora de inicio:", revision.start_time);
    }
    setNewRevision(revision ? { ...revision } : {
      start_time: 5,
      end_time: 5,
      diagnosis: '',
      key_factors: '',
      patient_status: 'LEVE',
      date_created: new Date().toISOString(), // Agrega la fecha actual
    });
    setIsDeleteModal(false);
    setShowModal(true);
  };


  const handleDelete = async () => {
    if (selectedId === null) return;

    try {
      const response = await fetch(`${EXPO_API_URL}/api/revision/delete/${selectedId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error deleting revision');
      }

      const fetchData = async () => {
        try {
          const response = await fetch(`${EXPO_API_URL}/api/revision/list`);
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
        ? `${EXPO_API_URL}/api/revision/update/${newRevision.id}`
        : `${EXPO_API_URL}/api/revision/save`;

      const body = {
        results_id: newRevision.results_id || 1, // Asigna un valor por defecto o ajusta según sea necesario
        start_time: convertSecondsToTimeForm24(newRevision.start_time || 0),
        end_time: convertSecondsToTimeForm24(newRevision.end_time || 0),
        diagnosis: newRevision.diagnosis || '',
        key_factors: newRevision.key_factors || '',
        patient_status: newRevision.patient_status || 'LEVE',
        date_created: newRevision.date_created || new Date().toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Error saving revision');
      }

      // Refresh data after save
      const fetchData = async () => {
        try {
          const response = await fetch(`${EXPO_API_URL}/api/revision/list`);
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
    setIsDeleteModal(true);
  };

  const showTimePicker = (type: 'start_time' | 'end_time') => {
    setTimeType(type);
    setIsTimePickerVisible(true);
  };

  const handleTimeConfirm = (date: Date) => {
    const time = moment(date).format('HH:mm:ss');
    if (timeType) {
      setNewRevision({ ...newRevision, [timeType]: time });
    }
    setIsTimePickerVisible(false);
  };

  // -------------------------------- RENDERIZAR ---------------------
  const renderItem = ({ item }: { item: Revision }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.id}</Text>
      <Text style={styles.tableCell}>{convertSecondsToTime(item.start_time)}</Text>
      <Text style={styles.tableCell}>{convertSecondsToTime(item.end_time)}</Text>
      <Text style={styles.tableCell}>{item.diagnosis}</Text>
      <Text style={styles.tableCell}>{item.key_factors}</Text>
      <Text style={styles.tableCell}>{item.patient_status}</Text>
      <View style={styles.tableActions}>
        <TouchableOpacity style={styles.actionButtonEdit} onPress={() => handleEdit(item)}>
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonDelete} onPress={() => confirmDelete(item.id)}>
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ----------------------------------VISTAS ----------------------------------
  return (
    <View style={styles.container}>
      <View style={styles.tableContainer}>
        <Text style={styles.subtitle}>Lista de Revisiones</Text>
        <TouchableOpacity style={styles.button} onPress={() => handleEdit(null)}>
          <Text style={styles.buttonText}>Nueva Revisión</Text>
        </TouchableOpacity>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>ID</Text>
          <Text style={styles.headerCell}>Hora inicio</Text>
          <Text style={styles.headerCell}>Hora final</Text>
          <Text style={styles.headerCell}>Diagnostico</Text>
          <Text style={styles.headerCell}>Comentario</Text>
          <Text style={styles.headerCell}>Estado</Text>
          <Text style={styles.headerCell}>Opciones</Text>
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {/* Modal for save o edit */}
      <Modal
        transparent={true}
        visible={showModal && !isDeleteModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{newRevision.id ? 'Actualizar Revisión' : 'Nueva Revisión'}</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => {
                const formattedText = text;
                const timeInSeconds = convertTimeToSeconds(formattedText);
                setNewRevision({ ...newRevision, start_time: timeInSeconds });
              }}
              value={convertSecondsToTimeForm24(newRevision.start_time || 0)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              onChangeText={(text) => {
                const formattedText = text;
                const timeInSeconds = convertTimeToSeconds(formattedText);
                setNewRevision({ ...newRevision, end_time: timeInSeconds });
              }}
              value={convertSecondsToTimeForm24(newRevision.end_time || 0)}
              keyboardType="numeric"
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
            <Picker
              selectedValue={selectedValue}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setSelectedValue(itemValue as PatientStatus); // Asegura que itemValue es del tipo correcto
                setNewRevision({ ...newRevision, patient_status: itemValue as PatientStatus });
              }}
            >
              <Picker.Item label="LEVE" value="LEVE" />
              <Picker.Item label="MEDIO" value="MEDIO" />
              <Picker.Item label="GRAVE" value="GRAVE" />
            </Picker>
            <View style={styles.modalButtons}>
              <Button title="Guardar" onPress={handleSave} />
              <Button title="Cancelar" onPress={() => setShowModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        transparent={true}
        visible={isDeleteModal}
        animationType="slide"
        onRequestClose={() => setIsDeleteModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text>Are you sure you want to delete this revision?</Text>
            <View style={styles.modalButtons}>
              <Button title="Delete" onPress={handleDelete} />
              <Button title="Cancel" onPress={() => setIsDeleteModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setIsTimePickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  tableContainer: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButtonEdit: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionButtonDelete: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
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
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default RevisionsListScreen;
