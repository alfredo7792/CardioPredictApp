import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Modal, Button, ScrollView } from 'react-native';
import { StatusBar } from "expo-status-bar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Response from "@/components/response";
import Message from "@/components/message";
import { useAuth } from './AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { EXPO_API_URL } from './enviroment';

const STORAGE_KEY = '@chat_history';
const COUNTER_KEY = '@chat_counter';

interface ChatMessage {
  text: string;
  isUser: boolean;
}

interface Chat {
  id: number;
  name: string;
  messages: ChatMessage[];
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

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const chartConfig = {
  backgroundColor: "transparent",
  backgroundGradientFrom: "white",
  backgroundGradientTo: "white",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  barPercentage: 0.7,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: "#e3e3e3",
    strokeDasharray: "5",
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#007AFF",
  },
};

const Chatbot : React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [chatCounter, setChatCounter] = useState<number>(1);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

  const now = new Date();
  
  const initialStartDate = new Date(now);
  initialStartDate.setDate(now.getDate() - 5);

  const initialEndDate = new Date(now);
  initialEndDate.setDate(now.getDate() + 5);

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filteredHistorial, setFilteredHistorial] = useState<Historial[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);

  const predefinedMessages = {
    "Analizar datos": "Toma el rol de un médico especializado en cardiología. Analiza los datos del paciente y proporciona una evaluación detallada.",
    "Receta médica": "Genera una receta médica basada en la información del paciente, si o si , aunque sea general.",
    "Estilos de vida": "Sugiere cambios en el estilo de vida para mejorar la salud del paciente si o si aunque sea general.",
    "Resumen general": "Proporciona un resumen general del estado de salud del paciente y recomendaciones si o si aunque sea general."
  };
  
  useEffect(() => {
    loadChats();
    fetchHistorial();
    
  }, []);

  const fetchHistorial = async () => {
    if (user) {
      try {
        console.log(user.role); // Corrected the console log
                // const navigation = useNavigation<any>();
        // const route = useRoute<any>();
        // const { clientId } = route.params; 

        // var response = await fetch(`${EXPO_API_URL}/historial/${clientId}`);
        var response = await fetch(`${EXPO_API_URL}/historial/`);
        if(user.role==="paciente"){
          response = await fetch(`${EXPO_API_URL}/historial/${user.user_id}`);
        }
        else{
          const navigation = useNavigation<any>();
          const route = useRoute<any>();
          const { clientId } = route.params; 
          response = await fetch(`${EXPO_API_URL}/historial/${user.user_id}`);
        }

  
        if (!response.ok) {
          throw new Error('Failed to fetch Historial');
        }
        const data: Historial[] = await response.json();
        setHistorial(data);
        console.log(data);
        filterHistorial(data, startDate, endDate);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    }
  }

  const filterHistorial = (historial: Historial[], start: Date, end: Date) => {
    const filtered = historial.filter(h => {
      const date = new Date(h.dateRegistration);
      return date >= start && date <= end;
    });
    setFilteredHistorial(filtered);
  };

  const onStartDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      filterHistorial(historial, selectedDate, endDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      filterHistorial(historial, startDate, selectedDate);
    }
  };

  const loadChats = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      const storedCounter = await AsyncStorage.getItem(COUNTER_KEY);
      if (storedData !== null) {
        const loadedChats = JSON.parse(storedData);
        setChats(loadedChats);
        if (loadedChats.length > 0) {
          setCurrentChatId(loadedChats[0].id);
        }
      }
      if (storedCounter !== null) {
        setChatCounter(parseInt(storedCounter, 10));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const saveChats = async (newChats: Chat[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newChats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  };

  const saveChatCounter = async (newCounter: number) => {
    try {
      await AsyncStorage.setItem(COUNTER_KEY, newCounter.toString());
    } catch (error) {
      console.error('Error saving chat counter:', error);
    }
  };

  const handleSearchInput = () => {
    if (inputText.trim() && currentChatId !== null) {
      sendMessageToGemini(inputText);
      setInputText("");
    }
  };

  const sendMessageToGemini = async (message: string) => {
    let fullMessage: string;

    if (message === 'Toma el rol de un médico especializado en cardiología. Analiza los datos del paciente y proporciona una evaluación detallada.') {
      fullMessage = `
        Toma el rol de un médico especializado en cardiología. Tienes un paciente con la siguiente información:
  
        ${JSON.stringify(historial)}
  
        1. Evalúa el riesgo cardiovascular del paciente, prestando especial atención a la presencia o ausencia de enfermedad cardíaca y el porcentaje de riesgo indicado.
        2. Identifica los factores de riesgo más críticos para este paciente.
        3. Proporciona recomendaciones detalladas de estilo de vida para reducir el riesgo cardiovascular.
        4. Sugiere posibles medicamentos o tratamientos que podrían ayudar a mejorar la salud cardiovascular del paciente.
        5. Recomienda pruebas o exámenes adicionales si lo consideras necesario.
        6. Ofrece una conclusión general sobre el estado de salud cardiovascular del paciente y su pronóstico.
  
        Recuerda que:
        'Diagnostico del doctor sobre el caso es conocido como(diagnosis)'}
        'Comentarios del doctor sobre el caso es conocido como(key_factors)'
        'Estado del paciente segun el doctor es conocido como(patient_status)'
        Por favor, responde en español, de forma precisa y detallada, enfocándote principalmente en la salud cardiovascular del paciente. Además, toma en cuenta lo que dice el doctor del paciente, incluyendo el estado del paciente.
        Si no coincides con el médico puedes remarcarlo pero basándote en los datos brindados, o puedes argumentar que el médico no aporta mucho con sus comentarios o nada(en el caso que no esten vacios).
        Ademas quiero que por favor en el caso que te pase varias filas de un mismo dato, osea varios historial del paciente me digas si esta mejorando o empeorando
      `;
    } else {
      fullMessage = `Patient Context: ${JSON.stringify(historial)}\n\n${message}`;
    }

    try {
      // Here you should implement the actual call to the Gemini API
      // For now, we'll simulate a response
      const response = await simulateGeminiResponse(fullMessage);
      
      const updatedChats = chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, { text: message, isUser: true }, { text: response, isUser: false }] }
          : chat
      );
      setChats(updatedChats);
      saveChats(updatedChats);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
    }
  };

  const simulateGeminiResponse = async (message: string) => {
    // Simulates a Gemini response
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulates network delay
    return `Simulated Gemini response based on: "${message}"`;
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: chatCounter,
      name: `Chat ${chatCounter}`,
      messages: []
    };
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setChatCounter(chatCounter + 1);
    saveChats(updatedChats);
    saveChatCounter(chatCounter + 1);
  };

  const showDeleteConfirmation = (chatId: number) => {
    setChatToDelete(chatId);
    setShowConfirmDelete(true);
  };

  const deleteChat = () => {
    if (chatToDelete !== null) {
      const updatedChats = chats.filter(chat => chat.id !== chatToDelete);
      setChats(updatedChats);
      if (currentChatId === chatToDelete) {
        setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
      }
      saveChats(updatedChats);
      setShowConfirmDelete(false);
      setChatToDelete(null);
    }
  };

  function generateHealthImage(analysisResult: string): string {
    const healthStatus = determineHealthStatus(analysisResult);
    
    const prompts: { [key: string]: string } = {
        "bueno": "A happy doctor smiling and giving a thumbs up to a healthy patient. Realistic style.",
        "malo": "A concerned doctor looking at medical charts with a worried expression. Realistic style.",
        "mejorando": "A doctor congratulating a patient who is showing signs of recovery. Both looking optimistic. Realistic style.",
        "empeorando": "A sepulture with people aroud there. Realistic style.",
        "critico": "A serious medical team attending to a patient in a hospital bed with various medical equipment around. Realistic style."
    };

    const prompt = prompts[healthStatus] || "A doctor examining a patient. Neutral expression. Realistic style.";
    return (prompt);
}

function determineHealthStatus(analysisResult: string): string {
    const analysisLower = analysisResult.toLowerCase();
    
    if (analysisLower.includes("excelente") || analysisLower.includes("muy buena")) {
        return "bueno";
    } else if (analysisLower.includes("grave") || analysisLower.includes("crítico")) {
        return "critico";
    } else if (analysisLower.includes("mejorando") || analysisLower.includes("progreso")) {
        return "mejorando";
    } else if (analysisLower.includes("malo") || analysisLower.includes("preocupante")) {
        return "malo";
    } else {
        return "neutral";
    }
}

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const renderChart = (data: number[], labels: string[], title: string, yAxisSuffix: string, yAxisLabel: string) => (
    <BarChart
      data={{
        labels: labels,
        datasets: [{ data: data }]
      }}
      width={screenWidth - 32}
      height={220}
      yAxisLabel={yAxisLabel}
      yAxisSuffix={yAxisSuffix}
      chartConfig={chartConfig}
      verticalLabelRotation={45}
      showValuesOnTopOfBars={true}
      fromZero={true}
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );


  const filterLabels = (labels: string[], interval: number) => 
    labels.filter((_, index) => index % interval === 0);

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Image source={require("../../assets/icons/robot.png")} style={styles.icon} />
        <Text style={styles.headerText}>Gemini AI</Text>
        {/* {useAuth().user?.role} */}
        <TouchableOpacity onPress={() => setShowChatbot(!showChatbot)} style={styles.chatbotToggle}>
          <Text style={styles.chatbotToggleText}>{showChatbot ? "Hide Chatbot" : "Show Chatbot"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateFilters}>
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
          <Text>Start: {startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
          <Text>End: {endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
        />
      )}

      <View style={styles.chartsContainer}>
        {filteredHistorial.length > 0 ? (
          <>
            {renderChart(
              filteredHistorial.map(h => h.SleepHours),
              filterLabels(filteredHistorial.map(h => new Date(h.dateRegistration).toLocaleDateString()), 3),
              'Sleep hours over time',
              'h',
              'Hours'
            )}
            {renderChart(
              filteredHistorial.map(h => h.PhysicalHealthDays),
              filterLabels(filteredHistorial.map(h => new Date(h.dateRegistration).toLocaleDateString()), 3),
              'Physical health days over time',
              'd',
              'Days'
            )}
            {renderChart(
              filteredHistorial.map(h => h.BMI),
              filterLabels(filteredHistorial.map(h => new Date(h.dateRegistration).toLocaleDateString()), 3),
              'BMI over time',
              '',
              'BMI'
            )}
            {renderChart(
              filteredHistorial.map(h => h.MentalHealthDays),
              filterLabels(filteredHistorial.map(h => new Date(h.dateRegistration).toLocaleDateString()), 3),
              'Mental health days over time',
              'd',
              'Days'
            )}
          </>
        ) : (
          <Text style={styles.noDataMessage}>No data available for the selected date range.</Text>
        )}
      </View>

      {showChatbot && (
        <View style={styles.chatbotContainer}>
          <FlatList
            horizontal
            data={chats}
            renderItem={({ item }) => (
              <View style={styles.chatItemContainer}>
                <TouchableOpacity 
                  style={[styles.chatItem, currentChatId === item.id && styles.selectedChatItem]}
                  onPress={() => setCurrentChatId(item.id)}
                >
                  <Text style={styles.chatItemText}>{item.name}</Text>
                  <TouchableOpacity onPress={() => showDeleteConfirmation(item.id)} style={styles.deleteButton}>
                    <Text>x</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.id.toString()}
            style={styles.chatList}
          />

          <FlatList
            style={styles.flatList}
            data={currentChat?.messages || []}
            renderItem={({ item }) => (
              <View>
                {item.isUser ? (
                  <Message message={item.text} />
                ) : (





                  

                  <Response prompt={item.text} prompt_img={generateHealthImage(item.text)} />





                )}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          <View style={styles.predefinedMessagesContainer}>
            {Object.entries(predefinedMessages).map(([key, value]) => (
              <TouchableOpacity 
                key={key} 
                style={styles.predefinedMessageButton}
                onPress={() => sendMessageToGemini(value)}
              >
                <Text style={styles.predefinedMessageText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchBar}>
            <TextInput 
              placeholder="Ask Gemini AI" 
              style={styles.input} 
              value={inputText} 
              onChangeText={setInputText} 
              selectionColor={"#323232"}
            />
            <TouchableOpacity onPress={handleSearchInput}>
              <Image source={require("../../assets/icons/right-arrow.png")} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={createNewChat}>
              <Image source={require("../../assets/icons/plus.png")} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Modal
        visible={showConfirmDelete}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmDelete(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete this chat?</Text>
            <Button title="Cancel" onPress={() => setShowConfirmDelete(false)} />
            <Button title="Delete" onPress={deleteChat} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    margin: 8,
  },
  icon: {
    width: 32,
    height: 32,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#323232",
  },
  chatbotToggle: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 8,
  },
  chatbotToggleText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dateFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  dateButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 5,
  },
  chartsContainer: {
    padding: 16,
  },
  noDataMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  chatbotContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    marginLeft: 20,
  },
  chatList: {
    maxHeight: 50,
  },
  chatItemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedChatItem: {
    backgroundColor: "#B0B0B0",
  },
  chatItemText: {
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    marginLeft: 8,
  },
  flatList: {
    paddingHorizontal: 16,
    height: screenHeight * 0.6,
    marginBottom: 80,
  },
  searchBar: {
    backgroundColor: "#ffffff",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    backgroundColor: "#fff",
    width: "85%",
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 32,
    borderWidth: 0.1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  predefinedMessagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  predefinedMessageButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  predefinedMessageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default Chatbot;