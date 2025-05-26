import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';

// 🔁 Altere aqui conforme o ambiente:
const API_URL = 'http://10.0.2.2:3000/incidents'; // emulador Android Studio
// const API_URL = 'http://192.168.0.32:3000/incidents'; // celular real na mesma rede

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');

  const fetchIncidents = async () => {
    try {
      const response = await axios.get(API_URL);
      console.log('✅ Incidentes recebidos:', response.data);
      setIncidents(response.data);
    } catch (err) {
      console.error('❌ Erro ao buscar incidentes:', err.message);
      setError(`Erro: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchIncidents();

    const interval = setInterval(fetchIncidents, 10000); // Atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>📅 Data/Hora:</Text>
      <Text style={styles.value}>
        {new Date(item.timestamp).toLocaleString('pt-BR')}
      </Text>

      <Text style={styles.label}>📷 Câmera:</Text>
      <Text style={styles.value}>{item.camera}</Text>

      <Text style={styles.label}>🔥 Status:</Text>
      <Text style={styles.value}>{item.status}</Text>

      <Text style={styles.label}>🎯 Confiança:</Text>
      <Text
        style={[
          styles.value,
          item.confidence > 0.7 ? styles.alert : null
        ]}
      >
        {(item.confidence * 100).toFixed(2)}%
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📋 Incidentes Detectados</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 30, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  error: { color: 'red', marginBottom: 10 },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: { fontWeight: 'bold' },
  value: { fontSize: 16 },
  alert: { color: 'red', fontWeight: 'bold' },
});
