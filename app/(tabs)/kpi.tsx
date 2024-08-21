// app/(tabs)/kpi.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

const KPIComponent: React.FC = () => {
  const [diagnosisAccuracyRate, setDiagnosisAccuracyRate] = useState<number | null>(null);
  const [severeCaseReductionRate, setSevereCaseReductionRate] = useState<number | null>(null);
  const [diagnosisTimeReductionRate, setDiagnosisTimeReductionRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const diagnosisResponse = await axios.get('http://127.0.0.1:8000/kpi/diagnosis-accuracy-rate/');
        const severeResponse = await axios.get('http://127.0.0.1:8000/kpi/severe-case-reduction-rate/');
        const timeResponse = await axios.get('http://127.0.0.1:8000/kpi/diagnosis-time-reduction-rate/');

        setDiagnosisAccuracyRate(diagnosisResponse.data);
        setSevereCaseReductionRate(severeResponse.data);
        setDiagnosisTimeReductionRate(timeResponse.data);
      } catch (error) {
        console.error('Error fetching KPI data', error);
      }
    };

    fetchData();
  }, []);

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

  return (
    <View style={styles.container}>
      {diagnosisAccuracyRate === null && severeCaseReductionRate === null && diagnosisTimeReductionRate === null ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.text}>
            Diagnosis Accuracy Rate: {diagnosisAccuracyRate}% {getKpiEmoji(diagnosisAccuracyRate, 1)}
          </Text>
          <Text style={styles.text}>
            Severe Case Reduction Rate: {severeCaseReductionRate}% {getKpiEmoji(severeCaseReductionRate, 2)}
          </Text>
          <Text style={styles.text}>
            Diagnosis Time Reduction Rate: {diagnosisTimeReductionRate}% {getKpiEmoji(diagnosisTimeReductionRate, 3)}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default KPIComponent;
