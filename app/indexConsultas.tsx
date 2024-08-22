import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { ActivityIndicator, ScrollView, View, Text, TouchableOpacity, FlatList, TextInput, Modal, Button, StyleSheet } from 'react-native';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { EXPO_API_URL } from "./(tabs)/enviroment";


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
// ------------------------------------------------------------------------
const IndexConsultas: React.FC = () => {
  const route = useRoute<any>();
  const { id, age, sex } = route.params;
  const [dataResultados, setDataResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [newRevision, setNewRevision] = useState<Partial<Revision>>({});
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [showEditModalRevision, setIsEditModal] = useState<boolean>(false);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);


  const handleAnalyze = () => {
    navigation.navigate('ConsultasScreen', { clientId: id, ageCategory: age, sex: sex });
  };

  useEffect(() => {
    fetch(`${EXPO_API_URL}/results/with_state_revision/${id}`)
      .then((response) => response.json())
      .then((json) => {
        setDataResultados(json);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  const handleSave = async () => {
    try {
      const method = newRevision.id ? 'PUT' : 'POST';
      const url = newRevision.id
        ? `${EXPO_API_URL}/api/revision/update/${newRevision.id}`
        : `${EXPO_API_URL}/api/revision/save`;

      const body = {
        results_id: newRevision.results_id || 1,
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

    } catch (error) {
      console.error('Error saving revision:', error);
    } finally {
      setIsEditModal(false);
      setNewRevision({});
    }
  };
  const formatHeartDisease = (value: number) => {
    return value === 1 ? 'Si Tiene' : 'No Tiene';
  };

  const handleEditRevision = (idResult: number) => {
    fetch(`${EXPO_API_URL}/api/revision/by_result_id/${idResult}`)
      .then((response) => response.json())
      .then((data: Revision) => {
        setNewRevision(data);
        setIsEditModal(true);
      })
      .catch((error) => {
        console.error('Error fetching revision:', error);
      });
  };

  const handleSaveRevision = (idResult: number) => {
    setNewRevision({
      results_id: idResult,
      start_time: 0,
      end_time: 0,
      diagnosis: '',
      key_factors: '',
      patient_status: 'LEVE',
      date_created: new Date().toISOString(),
    });
    setIsEditModal(true);
  };

  const keys = ["id", "Enfermedad cardiaca", "Porcentaje de riesgo", "Fecha de registro"];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
        <Text style={styles.analyzeButtonText}>Analizar</Text>
      </TouchableOpacity>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          {keys.map((key) => (
            <View key={key} style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>{key}</Text>
            </View>
          ))}
          <View style={styles.tableHeaderCellAcciones}>
            <Text style={styles.tableHeaderText}>Acciones</Text>
          </View>
        </View>
        {dataResultados.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{item.id}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{formatHeartDisease(item.HeartDisease)}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{item.RiskPercentage}%</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>
                {new Date(item.dateRegistration).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.tableCellActions}>
              <TouchableOpacity style={styles.buttonEdit}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDelete}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonView}>
                <Text style={styles.buttonText}>Ver</Text>
              </TouchableOpacity>
              {item.status_revision == 1 && (
                <TouchableOpacity style={styles.buttonReview} onPress={() => handleEditRevision(item.id)}>
                  <Text style={styles.buttonText}>Ver revision</Text>
                </TouchableOpacity>
              )}
              {item.status_revision == 0 && (
                <TouchableOpacity style={styles.buttonReview} onPress={() => handleSaveRevision(item.id)}>
                  <Text style={styles.buttonText}>Revisar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      <Modal
        transparent={true}
        visible={showEditModalRevision && !isDeleteModal}
        animationType="slide"
        onRequestClose={() => setIsEditModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{newRevision.id ? 'Actualizar Revisión' : 'Nueva Revisión'}</Text>
            <Button title="Seleccionar Hora de Inicio" onPress={() => setStartTimePickerVisible(true)} />

            <DateTimePicker
              isVisible={isStartTimePickerVisible}
              mode="time"
              onConfirm={(date) => {
                setStartTimePickerVisible(false);
                const timeInSeconds = convertTimeToSeconds(date.toLocaleTimeString());
                setNewRevision({ ...newRevision, start_time: timeInSeconds });
              }}
              onCancel={() => setStartTimePickerVisible(false)}
            />

            {/* Botón para seleccionar la hora de fin */}
            <Button title="Seleccionar Hora de Fin" onPress={() => setEndTimePickerVisible(true)} />

            <DateTimePicker
              isVisible={isEndTimePickerVisible}
              mode="time"
              onConfirm={(date) => {
                setEndTimePickerVisible(false);
                const timeInSeconds = convertTimeToSeconds(date.toLocaleTimeString());
                setNewRevision({ ...newRevision, end_time: timeInSeconds });
              }}
              onCancel={() => setEndTimePickerVisible(false)}
            />


            {/* <TextInput
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
            /> */}
            <TextInput
              style={styles.input}
              placeholder="Diagnóstico"
              onChangeText={(text) => setNewRevision({ ...newRevision, diagnosis: text })}
              value={newRevision.diagnosis}
            />
            <TextInput
              style={styles.input}
              placeholder="Factores Clave"
              onChangeText={(text) => setNewRevision({ ...newRevision, key_factors: text })}
              value={newRevision.key_factors}
            />
            <Picker
              selectedValue={newRevision.patient_status || 'LEVE'}
              style={styles.picker}
              onValueChange={(itemValue) => setNewRevision({ ...newRevision, patient_status: itemValue })}
            >
              <Picker.Item label="Leve" value="LEVE" />
              <Picker.Item label="Medio" value="MEDIO" />
              <Picker.Item label="Grave" value="GRAVE" />
            </Picker>
            <View style={styles.modalButtons}>
              <Button title="Guardar" onPress={handleSave} color="blue" />
              <Button title="Cancelar" onPress={() => setIsEditModal(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={isDeleteModal}
        animationType="slide"
        onRequestClose={() => setIsDeleteModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Estás seguro de que deseas eliminar esta revisión?</Text>
            <View style={styles.modalButtons}>
              <Button title="Confirmar" onPress={() => setIsDeleteModal(false)} />
              <Button title="Cancelar" onPress={() => setIsDeleteModal(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  container: {
    padding: 10,
    justifyContent:'center',
    backgroundColor: '#f0f0f0',
  },
  table: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    flex: 0.5,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#e0e0e0',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
   tableHeaderCellAcciones: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#e0e0e0',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  tableCell: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableCellText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
  tableCellActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonEdit: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonDelete: {
    backgroundColor: '#f44336',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonView: {
    backgroundColor: '#2196F3',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonReview: {
    backgroundColor: '#2111F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8, // Reducir el padding vertical
    paddingHorizontal: 16, // Reducir el padding horizontal
    borderRadius: 5,
    alignSelf: 'flex-end', // Alinear a la derecha
    marginBottom:8
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ------revisiones

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
  rowSubTitle: {
    flexDirection: 'row', // Alinea los elementos en una fila
    justifyContent: 'space-between', // Distribuye el espacio entre los elementos
    alignItems: 'center', // Alinea los elementos verticalmente al centro
    marginBottom: 20, // Ajusta el espacio debajo del contenedor
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  newRevisionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: 'flex-end', // Alinea el botón a la derecha
    marginBottom: 10,
    alignItems: 'center',
    width: 100, // Ajusta el ancho del botón según sea necesario
  },
  saveButton: {
    backgroundColor: '#4CAF50', // Color de fondo para el botón de guardar
  },
  cancelButton: {
    backgroundColor: '#f44336', // Color de fondo para el botón de cancelar
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
    textAlign: 'center'
  },
  input: {
    borderWidth: 0.5,
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

export default IndexConsultas;
