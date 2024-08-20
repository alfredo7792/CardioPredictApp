// app/(tabs)/reports.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const ReportsComponent: React.FC = () => {
  const [diagnosisAccuracyRate, setDiagnosisAccuracyRate] = useState<number | null>(null);
  const [severeCaseReductionRate, setSevereCaseReductionRate] = useState<number | null>(null);
  const [diagnosisTimeReductionRate, setDiagnosisTimeReductionRate] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [doctorCount, setDoctorCount] = useState<number | null>(null);
  const [patientsDetected, setPatientsDetected] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const diagnosisResponse = await axios.get('http://127.0.0.1:8000/kpi/diagnosis-accuracy-rate/');
        const severeResponse = await axios.get('http://127.0.0.1:8000/kpi/severe-case-reduction-rate/');
        const timeResponse = await axios.get('http://127.0.0.1:8000/kpi/diagnosis-time-reduction-rate/');
        const userCountResponse = await axios.get('http://127.0.0.1:8000/users/count');
        const doctorCountResponse = await axios.get('http://127.0.0.1:8000/doctors/count');
        const patientsDetectedResponse = await axios.get('http://127.0.0.1:8000/patients/detected/count');

        setDiagnosisAccuracyRate(diagnosisResponse.data);
        setSevereCaseReductionRate(severeResponse.data);
        setDiagnosisTimeReductionRate(timeResponse.data);
        setUserCount(userCountResponse.data);
        setDoctorCount(doctorCountResponse.data);
        setPatientsDetected(patientsDetectedResponse.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  const renderKPI = (label: string, value: number | null, kpiNumber: number) => {
    const emoji = getKpiEmoji(value, kpiNumber);
    return (
      <View style={styles.kpiCard}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value !== null ? `${value}%` : '-'}</Text>
        <Text style={styles.kpiEmoji}>{emoji}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {diagnosisAccuracyRate === null && severeCaseReductionRate === null && diagnosisTimeReductionRate === null ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.kpiContainer}>
            {renderKPI('Diagnosis Accuracy Rate', diagnosisAccuracyRate, 1)}
            {renderKPI('Severe Case Reduction Rate', severeCaseReductionRate, 2)}
            {renderKPI('Diagnosis Time Reduction Rate', diagnosisTimeReductionRate, 3)}
          </View>
          <Text style={styles.reportTitle}>User and Doctor Statistics</Text>
          <BarChart
            data={{
              labels: ['Users', 'Doctors', 'Patients Detected'],
              datasets: [
                {
                  data: [userCount || 0, doctorCount || 0, patientsDetected || 0],
                },
              ],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </>
      )}
    </ScrollView>
  );
};

const getKpiEmoji = (kpiValue: number | null, kpiNumber: number) => {
  if (kpiValue === null) return '⚪️';
  if (kpiNumber === 1) {
    if (kpiValue > 60) return '🟢';
    if (40 <= kpiValue && kpiValue <= 60) return '🟡';
    return '🔴';
  } else if (kpiNumber === 2) {
    if (kpiValue > 50) return '🟢';
    if (20 <= kpiValue && kpiValue <= 50) return '🟡';
    return '🔴';
  } else if (kpiNumber === 3) {
    if (kpiValue >= 60) return '🟢';
    if (20 <= kpiValue && kpiValue < 60) return '🟡';
    return '🔴';
  }
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    width: '30%',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 14,
    color: '#333',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  kpiEmoji: {
    fontSize: 24,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});

export default ReportsComponent;
