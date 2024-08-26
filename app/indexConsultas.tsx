import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { ActivityIndicator, ScrollView, View, Text, TouchableOpacity, Alert, TextInput, Modal, Button, StyleSheet } from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { EXPO_API_URL, WHATSAPP_API_URL } from "./(tabs)/enviroment";


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

interface Historial {
  id: number;
  client_id: number;
  HeartDisease: number;
  RiskPercentage: number;
  Factors: string;
  Sex: number;
  GeneralHealth: number;
  PhysicalHealthDays: number;
  MentalHealthDays: number;
  PhysicalActivities: number;
  SleepHours: number;
  HadStroke: number;
  HadKidneyDisease: number;
  HadDiabetes: number;
  DifficultyWalking: number;
  SmokerStatus: number;
  RaceEthnicityCategory: number;
  AgeCategory: number;
  BMI: number;
  AlcoholDrinkers: number;
  HadHighBloodCholesterol: number;
  dateRegistration: string;
  results_id: number;
  start_time: number;
  end_time: number;
  diagnosis: string;
  key_factors: string;
  patient_status: string;
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
  const { id, age, sex, phone } = route.params;
  const [dataResultados, setDataResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [newRevision, setNewRevision] = useState<Partial<Revision>>(
    {
      start_time: 0,
      end_time: 0,
    }
  );
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [showEditModalRevision, setIsEditModal] = useState<boolean>(false);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [startTime, setStartTime] = useState(''); // Para mostrar la hora de inicio en formato 12 horas
  const [endTime, setEndTime] = useState(''); // Para mostrar la hora de fin en formato 12 horas

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
    if (newRevision.start_time !== undefined && newRevision.end_time !== undefined) {
      if (newRevision.end_time <= newRevision.start_time) {
        Alert.alert('Error', 'La hora de fin debe ser posterior a la hora de inicio');
        return;
      }
    }
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



  const handleSendMessage = async (idResult: number) => {
    try {
      // Paso 1: Obtener los datos de la revisión
      const revisionResponse = await fetch(`${EXPO_API_URL}/api/revision/by_result_id/${idResult}`);
      if (!revisionResponse.ok) {
        throw new Error('Error fetching revision data');
      }
      const revisionData: Revision = await revisionResponse.json();
  
      // Paso 2: Obtener todos los resultados del cliente
      const resultsResponse = await fetch(`${EXPO_API_URL}/results/${id}`);
      if (!resultsResponse.ok) {
        throw new Error('Error fetching client results');
      }
      const allResults: Historial[] = await resultsResponse.json();
      // Filtrar para obtener el resultado específico
      const result = allResults.find((historial) => historial.id === idResult);
      if (!result) {
        throw new Error('Result not found for the given results_id');
      }
  
      // Constantes para formatear los valores
      const SEX = { 1: 'Masculino', 2: 'Femenino' };
      const GEN_HEALTH = { 1: "Excelente", 2: "Muy buena", 3: "Buena", 4: "Regular", 5: "Mala" };
      const DIABETES = { 1: "Sí", 2: "Sí, pero solo durante el embarazo (mujer)", 3: "No", 4: "No, prediabetes o diabetes borderline" };
      const SMOKER_STATUS = { 1: "Fumador actual - fuma todos los días", 2: "Fumador actual - fuma algunos días", 3: "Exfumador", 4: "Nunca ha fumado" };
      const RACE = { 1: "Blanco solamente, no hispano", 2: "Negro solamente, no hispano", 3: "Otra raza solamente, no hispano", 4: "Multirracial, no hispano", 5: "Hispano" };
      const AGE_CATEGORY = {
        1: "Edad 18 a 24", 2: "Edad 25 a 29", 3: "Edad 30 a 34", 4: "Edad 35 a 39", 5: "Edad 40 a 44",
        6: "Edad 45 a 49", 7: "Edad 50 a 54", 8: "Edad 55 a 59", 9: "Edad 60 a 64", 10: "Edad 65 a 69",
        11: "Edad 70 a 74", 12: "Edad 75 a 79", 13: "Edad 80 o más"
      };
      const YES_NO = { 1: "Sí", 0: "No" };
  
      // Formatear el mensaje
      const message = `
        *Revisión:*
        - ID: ${revisionData.id}
        - Results ID: ${revisionData.results_id}
        - Start Time: ${new Date(revisionData.start_time).toLocaleString()}
        - End Time: ${new Date(revisionData.end_time).toLocaleString()}
        - Diagnosis: ${revisionData.diagnosis}
        - Key Factors: ${revisionData.key_factors}
        - Patient Status: ${revisionData.patient_status}
        - Date Created: ${revisionData.date_created}
  
        *Resultado del Cliente:*
        - ID: ${result.id}
        - Client ID: ${result.client_id}
        - Enfermedad Cardiaca: ${YES_NO[result.HeartDisease  as keyof typeof YES_NO]}
        - Porcentaje de Riesgo: ${result.RiskPercentage}%
        - Factores: ${result.Factors}
        - Sexo: ${SEX[result.Sex  as keyof typeof SEX]}
        - Salud General: ${GEN_HEALTH[result.GeneralHealth  as keyof typeof GEN_HEALTH]}
        - Días de Salud Física: ${result.PhysicalHealthDays}
        - Días de Salud Mental: ${result.MentalHealthDays}
        - Actividades Físicas: ${YES_NO[result.PhysicalActivities  as keyof typeof YES_NO]}
        - Horas de Sueño: ${result.SleepHours}
        - Ha Tenido un Derrame Cerebral: ${YES_NO[result.HadStroke  as keyof typeof YES_NO]}
        - Ha Tenido Enfermedad Renal: ${YES_NO[result.HadKidneyDisease  as keyof typeof YES_NO]}
        - Ha Tenido Diabetes: ${DIABETES[result.HadDiabetes  as keyof typeof DIABETES]}
        - Dificultad para Caminar: ${YES_NO[result.DifficultyWalking  as keyof typeof YES_NO]}
        - Estado de Fumador: ${SMOKER_STATUS[result.SmokerStatus  as keyof typeof SMOKER_STATUS]}
        - Raza/Etnicidad: ${RACE[result.RaceEthnicityCategory  as keyof typeof RACE]}
        - Categoría de Edad: ${AGE_CATEGORY[result.AgeCategory  as keyof typeof AGE_CATEGORY]}
        - IMC: ${result.BMI}
        - Consumidor de Alcohol: ${YES_NO[result.AlcoholDrinkers  as keyof typeof YES_NO]}
        - Colesterol Alto: ${YES_NO[result.HadHighBloodCholesterol  as keyof typeof YES_NO]}
        - Fecha de Registro: ${new Date(result.dateRegistration).toLocaleString()}
        - Start Time: ${new Date(result.start_time).toLocaleString()}
        - End Time: ${new Date(result.end_time).toLocaleString()}
        - Diagnosis: ${result.diagnosis}
        - Factores Clave: ${result.key_factors}
        - Estado del Paciente: ${result.patient_status}
        - Fecha de Creación: ${result.date_created}
      `;
  
      // Preparar el cuerpo del mensaje
      const body = {
        phone: phone,
        message: message.trim(),  // Asegúrate de que no haya espacios en blanco al principio y al final
        mediaUrl: "https://www.muhealth.org/sites/default/files/2019-01/hearthealth-compressor.jpg"
      };
  
      // Paso 3: Enviar el mensaje
      const messageResponse = await fetch(`${WHATSAPP_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
  
      if (messageResponse.ok) {
        const result = await messageResponse.json();
        console.log('Mensaje enviado exitosamente:', result);
        // Aquí puedes manejar lo que sucede después de enviar el mensaje exitosamente
      } else {
        console.error('Error al enviar el mensaje:', messageResponse.statusText);
        // Aquí puedes manejar los errores de la petición
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      // Aquí puedes manejar errores de red o problemas inesperados
    }
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

  const keys = ["id", "Enfermedad cardiaca", "Porcentaje de riesgo"];
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
            <View style={styles.tableCellId}>
              <Text style={styles.tableCellText}>{item.id}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{formatHeartDisease(item.HeartDisease)}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{item.RiskPercentage}%</Text>
            </View>
            {/* <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>
                {new Date(item.dateRegistration).toLocaleDateString()}
              </Text>
            </View> */}
            <View style={styles.tableCellActions}>
              <TouchableOpacity style={styles.buttonEdit}>
                <Icon name="pencil-outline" size={15} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDelete}>
                <Icon name="trash-outline" size={15} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonView}>
                <Icon name="eye-outline" size={15} color="white" />
              </TouchableOpacity>
              {item.status_revision == 1 && (
                <>
                <TouchableOpacity style={styles.buttonReviewNew} onPress={() => handleEditRevision(item.id)}>
                  <Icon name="document-outline" size={15} color="yellow" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonWhatsapp} onPress={() => handleSendMessage(item.id)}>
                  <Icon name="send" size={15} color="white" />
                </TouchableOpacity>
                </>
              )}
              {item.status_revision == 0 && (
                <TouchableOpacity style={styles.buttonReviewEdit} onPress={() => handleSaveRevision(item.id)}>
                  <Icon name="document-outline" size={15} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Modal para ver revisiones */}
      <Modal
        transparent={true}
        visible={showEditModalRevision && !isDeleteModal}
        animationType="slide"
        onRequestClose={() => setIsEditModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{newRevision.id ? 'Actualizar Revisión' : 'Nueva Revisión'}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStartTimePickerVisible(true)}
            >
              <Text style={styles.buttonText}>{`Hora Inicio: ${startTime ? startTime : 'Seleccionar'}`}</Text>
            </TouchableOpacity>
            <DateTimePicker
              isVisible={isStartTimePickerVisible}
              mode="time"
              onConfirm={(date) => {
                setStartTimePickerVisible(false);
                const timeInSeconds = convertTimeToSeconds(date.toLocaleTimeString());
                setNewRevision({ ...newRevision, start_time: timeInSeconds });
                setStartTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
              }}
              onCancel={() => setStartTimePickerVisible(false)}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={() => setEndTimePickerVisible(true)}
            >
              <Text style={styles.buttonText}>{`Hora Fin: ${endTime ? endTime : 'Seleccionar'}`}</Text>
            </TouchableOpacity>

            <DateTimePicker
              isVisible={isEndTimePickerVisible}
              mode="time"
              onConfirm={(date) => {
                const endTimeInSeconds = convertTimeToSeconds(date.toLocaleTimeString());
                if (newRevision.start_time !== undefined && endTimeInSeconds <= newRevision.start_time) {
                  Alert.alert('Error', 'La hora de fin debe ser posterior a la hora de inicio');
                  setEndTimePickerVisible(false);
                  return;
                }
                setEndTimePickerVisible(false);
                setNewRevision({ ...newRevision, end_time: endTimeInSeconds });
                setEndTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
              }}
              onCancel={() => setEndTimePickerVisible(false)}
            />
            <TextInput
              style={styles.input}
              placeholder="Escribir Diagnóstico..."
              onChangeText={(text) => setNewRevision({ ...newRevision, diagnosis: text })}
              value={newRevision.diagnosis}
              multiline={true}
              numberOfLines={4}
            />
            <TextInput
              style={styles.input}
              placeholder="Listar los factores..."
              onChangeText={(text) => setNewRevision({ ...newRevision, key_factors: text })}
              value={newRevision.key_factors}
              multiline={true}
              numberOfLines={4}
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
              <Button title="Cancelar" onPress={() => setIsEditModal(false)} color="red" />
              <Button title="Guardar" onPress={handleSave} color="blue" />
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
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  button: {
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
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
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  tableCellId: {
    flex: 0.1,
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
  buttonReviewEdit: {
    backgroundColor: '#2FF1F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonReviewNew: {
    backgroundColor: '#211100',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonWhatsapp: {
    backgroundColor: '#49ff21',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8, // Reducir el padding vertical
    paddingHorizontal: 16, // Reducir el padding horizontal
    borderRadius: 5,
    alignSelf: 'flex-end', // Alinear a la derecha
    marginBottom: 8
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
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
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
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
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
    marginVertical: 10,
    backgroundColor: '#fff',
    height: 100, // Ajusta la altura según sea necesario
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    textAlignVertical: 'top',
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
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default IndexConsultas;
