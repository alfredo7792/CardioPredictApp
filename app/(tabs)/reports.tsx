// app/(tabs)/reports.tsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EXPO_API_URL } from "./enviroment";

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
        const diagnosisResponse = await axios.get(`${EXPO_API_URL}/kpi/diagnosis-accuracy-rate/`);
        const severeResponse = await axios.get(`${EXPO_API_URL}/kpi/severe-case-reduction-rate/`);
        const timeResponse = await axios.get(`${EXPO_API_URL}/kpi/diagnosis-time-reduction-rate/`);
        const userCountResponse = await axios.get(`${EXPO_API_URL}/users/count`);
        const doctorCountResponse = await axios.get(`${EXPO_API_URL}/doctors/count`);
        const patientsDetectedResponse = await axios.get(`${EXPO_API_URL}/patients/detected/count`);

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
