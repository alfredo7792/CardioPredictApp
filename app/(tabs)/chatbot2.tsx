import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ------------------------------------------------------------------------
const Chatbot2: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clientId } = route.params; // Asumiendo que 'clientId' es el nombre correcto del parámetro.

  return (
    <View style={styles.container}>
      <Text style={styles.idText}>Client ID: {clientId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  idText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Chatbot2;
