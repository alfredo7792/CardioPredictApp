import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ConsultasScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultas</Text>
      {/* Aquí puedes agregar más contenido para la pantalla de Consultas */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ConsultasScreen;
