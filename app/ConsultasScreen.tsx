import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Button, Dimensions, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface ApiResponse {
  riesgo: string;
  impacto: {
    [key: string]: number;
  };
  diagnostico: string;
}

// Mapeo de sexo
const getSexValue = (sex: string): string => {
  if (sex === "M") {
    return "1";
  } else if (sex === "F") {
    return "2";
  } else {
    alert("Sexo no válido");
    return "";
  }
};

// Mapeo de edad
const getAgeValue = (age: number): string => {
  if (age >= 18 && age <= 24) return "1";
  if (age >= 25 && age <= 29) return "2";
  if (age >= 30 && age <= 34) return "3";
  if (age >= 35 && age <= 39) return "4";
  if (age >= 40 && age <= 44) return "5";
  if (age >= 45 && age <= 49) return "6";
  if (age >= 50 && age <= 54) return "7";
  if (age >= 55 && age <= 59) return "8";
  if (age >= 60 && age <= 64) return "9";
  if (age >= 65 && age <= 69) return "10";
  if (age >= 70 && age <= 74) return "11";
  if (age >= 75 && age <= 79) return "12";
  if (age >= 80 && age <= 150) return "13";
  alert("Edad no válida");
  return "";
};

const ConsultasScreen: React.FC = () => {
  const route = useRoute<any>();

  const [step, setStep] = useState(1);

  const [clientId, setClientId] = useState(route.params?.clientId?.toString() || ''); // Recibe clientId como string
  const [sex, setSex] = useState(Number(getSexValue(route.params?.sex?.toString() || '')));
  const [ageCategory, setAgeCategory] = useState(Number(getAgeValue(Number(route.params?.ageCategory?.toString() || ''))));

  const [generalHealth, setGeneralHealth] = useState('');
  const [physicalHealthDays, setPhysicalHealthDays] = useState(0); // Cambiado a tipo numérico para el slider
  const [mentalHealthDays, setMentalHealthDays] = useState(0); // Cambiado a tipo numérico para el slider
  const [physicalActivities, setPhysicalActivities] = useState(''); // Cambiado a tipo string para el picker
  const [sleepHours, setSleepHours] = useState(0); // Cambiado a tipo numérico para el slider
  const [hadStroke, setHadStroke] = useState(''); // Cambiado a tipo string para el picker
  const [hadKidneyDisease, setHadKidneyDisease] = useState(''); // Cambiado a tipo string para el picker
  const [hadDiabetes, setHadDiabetes] = useState(''); // Cambiado a tipo string para el picker
  const [difficultyWalking, setDifficultyWalking] = useState(''); // Cambiado a tipo string para el picker
  const [smokerStatus, setSmokerStatus] = useState(''); // Cambiado a tipo string para el picker
  const [raceEthnicityCategory, setRaceEthnicityCategory] = useState(''); // Cambiado a tipo string para el picker
  const [bmi, setBmi] = useState('');
  const [alcoholDrinkers, setAlcoholDrinkers] = useState(''); // Cambiado a tipo string para el picker
  const [hadHighBloodCholesterol, setHadHighBloodCholesterol] = useState(''); // Cambiado a tipo string para el picker

  // Definir el estado de la respuesta como ApiResponse o null
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);


  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    const data = {
      client_id: Number(clientId),
      Sex: Number(sex),
      GeneralHealth: Number(generalHealth),
      PhysicalHealthDays: physicalHealthDays, // Utiliza el valor del slider
      MentalHealthDays: mentalHealthDays, // Utiliza el valor del slider
      PhysicalActivities: Number(physicalActivities),
      SleepHours: sleepHours, // Utiliza el valor del slider
      HadStroke: Number(hadStroke), // Utiliza el valor del picker
      HadKidneyDisease: Number(hadKidneyDisease), // Utiliza el valor del picker
      HadDiabetes: Number(hadDiabetes), // Utiliza el valor del picker
      DifficultyWalking: Number(difficultyWalking), // Utiliza el valor del picker
      SmokerStatus: Number(smokerStatus), // Utiliza el valor del picker
      RaceEthnicityCategory: Number(raceEthnicityCategory),
      AgeCategory: Number(ageCategory),
      BMI: Number(bmi),
      AlcoholDrinkers: Number(alcoholDrinkers), // Utiliza el valor del picker
      HadHighBloodCholesterol: Number(hadHighBloodCholesterol), // Utiliza el valor del picker
    };



    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }

      const result: ApiResponse = await response.json();
      setApiResponse(result);  // Guardar la respuesta en el estado
      //Alert.alert('Resultado', Predicción: ${JSON.stringify(result)});
      Alert.alert('Resultado', `Predicción: ${JSON.stringify(result)}`);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Ocurrió un error desconocido');
      }
    }
  };

  const handlePress = () => {
    handleSubmit(); // Llamar a la primera función
    handleNext(); // Llamar a la segunda función
  };


  const chartData = {
    labels: apiResponse ? Object.keys(apiResponse.impacto) : [],
    datasets: [
      {
        data: apiResponse ? Object.values(apiResponse.impacto) : [],
      },
    ],
  };

  // Ocultamos los TextInput de 'Client ID', 'Sex', y 'Age Category'
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Consultas</Text>

      {step === 1 && (
        <>
          <View style={styles.pickerContainer}>
            <Text style={styles.label} >General Health</Text>
            <Picker
              selectedValue={generalHealth}
              onValueChange={(itemValue) => setGeneralHealth(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Excelente" value="1" />
              <Picker.Item label="Muy buena" value="2" />
              <Picker.Item label="Buena" value="3" />
              <Picker.Item label="Regular" value="4" />
              <Picker.Item label="Deficiente" value="5" />
            </Picker>
          </View>
          <View style={styles.container}>
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>Physical Health Days: {physicalHealthDays}</Text>
              <View style={styles.graduationContainer}>
                {Array.from({ length: 30 }, (_, i) => (
                  <Text key={i} style={styles.graduation}>
                    {i + 1 === physicalHealthDays ? `| ${i + 1}` : '|'}
                  </Text>
                ))}

              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={30}
                step={1}
                value={physicalHealthDays}
                onValueChange={setPhysicalHealthDays}
                minimumTrackTintColor="#1E90FF"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#1E90FF"
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.label}>Mental Health Days: {mentalHealthDays}</Text>
              <View style={styles.graduationContainer}>
                {Array.from({ length: 30 }, (_, i) => (
                  <Text key={i} style={styles.graduation}>
                    {i + 1 === mentalHealthDays ? `| ${i + 1}` : '|'}
                  </Text>
                ))}

              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={30}
                step={1}
                value={mentalHealthDays}
                onValueChange={setMentalHealthDays}
                minimumTrackTintColor="#1E90FF"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#1E90FF"
              />
            </View>
          </View>


          <Button title="Siguiente" onPress={handleNext} />
        </>
      )}


      {step === 2 && (
        <>


          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Physical Activities</Text>
            <Picker
              selectedValue={physicalActivities}
              onValueChange={(itemValue) => setPhysicalActivities(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Sí" value="1" />
              <Picker.Item label="No" value="0" />
            </Picker>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.label}>Sleep Hours: {sleepHours}</Text>
            <View style={styles.graduationContainer}>

              {Array.from({ length: 25 }, (_, i) => (
                <Text key={i} style={styles.graduation}>
                  {i === sleepHours ? `| ${i}` : '|'}
                </Text>
              ))}

            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={24}
              step={1}
              value={sleepHours}
              onValueChange={setSleepHours}
              minimumTrackTintColor="#1E90FF"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#1E90FF"
            />
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Had Stroke</Text>
            <Picker
              selectedValue={hadStroke}
              onValueChange={(itemValue) => setHadStroke(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Sí" value="1" />
              <Picker.Item label="No" value="0" />
            </Picker>
          </View>



          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Had Kidney Disease</Text>
            <Picker
              selectedValue={hadKidneyDisease}
              onValueChange={(itemValue) => setHadKidneyDisease(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Sí" value="1" />
              <Picker.Item label="No" value="0" />
            </Picker>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Atrás" onPress={handleBack} />
            <Button title="Siguiente" onPress={handleNext} />
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Had Diabetes</Text>
            <Picker
              selectedValue={hadDiabetes}
              onValueChange={(itemValue) => setHadDiabetes(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Sí" value="1" />
              <Picker.Item label="Sí, pero sólo durante el embarazo (mujer)" value="2" />
              <Picker.Item label="No" value="3" />
              <Picker.Item label="No, prediabetes o diabetes limítrofe" value="4" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Difficulty Walking</Text>
            <Picker
              selectedValue={difficultyWalking}
              onValueChange={(itemValue) => setDifficultyWalking(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Sí, tiene dificultad para caminar" value="1" />
              <Picker.Item label="No, camina normal" value="0" />
            </Picker>
          </View>


          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Smoker Status</Text>
            <Picker
              selectedValue={smokerStatus}
              onValueChange={(itemValue) => setSmokerStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Fumador actual - ahora fuma todos los días" value="1" />
              <Picker.Item label="Fumador actual - ahora fuma algunos días" value="2" />
              <Picker.Item label="Antiguo fumador" value="3" />
              <Picker.Item label="Nunca ha fumado" value="4" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Race Ethnicity Category</Text>
            <Picker
              selectedValue={raceEthnicityCategory}
              onValueChange={(itemValue) => setRaceEthnicityCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Sólo blancos, no hispanos" value="1" />
              <Picker.Item label="Sólo negros, no hispanos" value="2" />
              <Picker.Item label="Sólo otra raza, No hispano" value="3" />
              <Picker.Item label="Multirracial, No hispano" value="4" />
              <Picker.Item label="Hispano" value="5" />
            </Picker>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Atrás" onPress={handleBack} />
            <Button title="Siguiente" onPress={handleNext} />
          </View>
        </>
      )}


      {step === 4 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="BMI"
            keyboardType="numeric"
            value={bmi}
            onChangeText={setBmi}
          />


          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Alcohol Drinkers</Text>
            <Picker
              selectedValue={alcoholDrinkers}
              onValueChange={(itemValue) => setAlcoholDrinkers(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Sí consume alcohol" value="1" />
              <Picker.Item label="No consume alcohol" value="0" />
            </Picker>
          </View>


          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Had High Blood Cholesterol</Text>
            <Picker
              selectedValue={hadHighBloodCholesterol}
              onValueChange={(itemValue) => setHadHighBloodCholesterol(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una opción" value="" />
              <Picker.Item label="Sí" value="1" />
              <Picker.Item label="No" value="0" />
            </Picker>
          </View>

          <Button title="Enviar" onPress={handleSubmit} />

          {apiResponse && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Resultado:</Text>
              <Text style={styles.resultText}>Riesgo: {apiResponse.riesgo}</Text>
              <Text style={styles.resultText}>Los factores mas influyentes se muestran en orden de importancia:</Text>
              <BarChart
                data={chartData}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                  },
                }}
                yAxisLabel=""
                yAxisSuffix=""
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
              <Text style={styles.resultText}>Diagnóstico: {apiResponse.diagnostico}</Text>
              <View>

              </View>
            </View>


          )}

        </>
      )}



    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff', // Fondo blanco general
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#4A4A4A',
    marginRight: 10,
  }, buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    width: 60,
    borderColor: '#4A90E2',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    color: '#4A4A4A',
    backgroundColor: '#f5f5f5',
    padding: 5,
  },

  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#e6f2ff',
    borderColor: '#4da6ff',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontFamily: 'Arial Narrow', // Fuente personalizada para los Pickers
    color: '#333', // Color del texto dentro del Picker
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    // Transición suave para los cambios
  },
  pickerFocused: {
    backgroundColor: '#d1e0ff', // Fondo más oscuro cuando está activo
    borderColor: '#003d99', // Bordes más oscuros cuando está activo
    shadowOpacity: 0.35,
    elevation: 7,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 40, // Espacio entre sliders
  },
  sliderAndGraduationContainer: {
    flexDirection: 'row', // Alineamos el slider y las graduaciones horizontalmente
    alignItems: 'center', // Alineamos verticalmente los elementos dentro de la fila
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial Narrow',
    color: '#333',
    marginBottom: 15, // Espacio entre la etiqueta y el slider
  },
  slider: {
    width: '94%', // Reducimos el ancho del slider para que esté alineado a la izquierda
    height: 60,
    marginLeft: 20, // Margen para separar el slider de las graduaciones
  },
  graduationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '10%', // Ocupamos un 30% del espacio para las graduaciones
  },
  graduation: {
    fontSize: 14, // Tamaño más grande para las graduaciones
    color: '#333',
  },
  resultContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Arial Narrow', // Aplicar Arial Narrow al resultado
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Arial Narrow', // Aplicar Arial Narrow al texto de los resultados
  },
  incrementButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
  },
  incrementButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  decorativeElement: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#4A90E2',
  },
});

export default ConsultasScreen;