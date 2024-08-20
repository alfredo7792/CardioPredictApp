import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const IndexConsultas: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { id, age, sex } = route.params;

  const handleAnalyze = () => {
    navigation.navigate('ConsultasScreen', { clientId: id, ageCategory: age, sex: sex });
  };

  useEffect(() => {
    // Realiza la solicitud GET a la API
    fetch(`http://127.0.0.1:8080/results/${id}`)
      .then((response) => response.json())
      .then((json) => {
        setData(json);
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

  const formatHeartDisease = (value: number) => {
    return value === 1 ? 'Enfermedad Cardiaca' : 'No posee';
  };

  

  const keys = ["id", "HeartDisease", "RiskPercentage", "dateRegistration"];

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
          <View style={styles.tableHeaderCell}>
            <Text style={styles.tableHeaderText}>Acciones</Text>
          </View>
        </View>
        {data.map((item, index) => (
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
            </View>
          </View>
        ))}
      </View>
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
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  table: {
    borderWidth: 1,
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
    flex: 1,
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
    flex: 2,
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },  
  analyzeButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default IndexConsultas;
