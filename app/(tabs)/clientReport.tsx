import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';

interface Client {
  id: string;
  name: string;
}

const ClientReportComponent: React.FC = () => {
  // Inicializa `selectedClient` como una cadena vacía
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/clients/');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients', error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const fetchClientData = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/clients/${selectedClient}/report`);
          setClientData(response.data);
        } catch (error) {
          console.error('Error fetching client report', error);
        }
      };

      fetchClientData();
    }
  }, [selectedClient]);

  const renderCharts = () => {
    if (!clientData || !clientData.history) return null;

    const chartConfig = {
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
    };

    return (
      <ScrollView horizontal={true} style={styles.chartsContainer}>
        <View style={styles.chartWrapper}>
          <Text style={styles.chartTitle}>BMI Over Time</Text>
          <LineChart
            data={{
              labels: clientData.history.dates,
              datasets: [{ data: clientData.history.bmi }],
            }}
            width={400}
            height={220}
            chartConfig={chartConfig}
          />
        </View>

        <View style={styles.chartWrapper}>
          <Text style={styles.chartTitle}>Mental Health Days Over Time</Text>
          <LineChart
            data={{
              labels: clientData.history.dates,
              datasets: [{ data: clientData.history.mentalHealthDays }],
            }}
            width={400}
            height={220}
            chartConfig={chartConfig}
          />
        </View>

        <View style={styles.chartWrapper}>
          <Text style={styles.chartTitle}>Physical Health Days Over Time</Text>
          <LineChart
            data={{
              labels: clientData.history.dates,
              datasets: [{ data: clientData.history.physicalHealthDays }],
            }}
            width={400}
            height={220}
            chartConfig={chartConfig}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Client</Text>
      <Picker
        selectedValue={selectedClient}
        onValueChange={(itemValue) => setSelectedClient(itemValue)}
        style={styles.picker}
      >
        {/* Añadir un item por defecto */}
        <Picker.Item label="Select a client" value="" />
        {clients.map((client) => (
          <Picker.Item key={client.id} label={client.name} value={client.id} />
        ))}
      </Picker>

      {clientData && (
        <View style={styles.clientReport}>
          <Text style={styles.reportTitle}>Client Report</Text>
          <Text>Total Analyses: {clientData.totalAnalyses}</Text>
          <Text>Positive Analyses: {clientData.positiveAnalyses}</Text>
          {renderCharts()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  clientReport: {
    marginTop: 20,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chartsContainer: {
    marginTop: 20,
  },
  chartWrapper: {
    marginRight: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ClientReportComponent;
