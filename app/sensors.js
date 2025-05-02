import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../constants/api';

export default function SensorsScreen() {
  const [sensorData, setSensorData] = useState({
    temperature: 22,
    humidity: 60,
    soilMoisture: 45,
    lightIntensity: 75,
    lastUpdated: new Date().toLocaleTimeString()
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSensorData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.sensorData, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          temperature: Math.floor(Math.random() * 10) + 20,
          humidity: Math.floor(Math.random() * 20) + 50,
          soilMoisture: Math.floor(Math.random() * 20) + 40,
          lightIntensity: Math.floor(Math.random() * 30) + 60
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
      }

      const data = await response.json();
      setSensorData({
        ...data,
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (err) {
      console.error('Sensor data error:', err);
      setError(err.message);
      // Fallback to local data if API fails
      setSensorData({
        temperature: Math.floor(Math.random() * 10) + 20,
        humidity: Math.floor(Math.random() * 20) + 50,
        soilMoisture: Math.floor(Math.random() * 20) + 40,
        lightIntensity: Math.floor(Math.random() * 30) + 60,
        lastUpdated: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensor Data</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorSubtext}>Using local data</Text>
        </View>
      )}
      
      <View style={styles.dataContainer}>
        <View style={styles.dataRow}>
          <Text style={styles.label}>Temperature:</Text>
          <Text style={styles.value}>{sensorData.temperature}°C</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.label}>Humidity:</Text>
          <Text style={styles.value}>{sensorData.humidity}%</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.label}>Soil Moisture:</Text>
          <Text style={styles.value}>{sensorData.soilMoisture}%</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.label}>Light Intensity:</Text>
          <Text style={styles.value}>{sensorData.lightIntensity}%</Text>
        </View>
      </View>

      <Text style={styles.updateTime}>Last updated: {sensorData.lastUpdated}</Text>

      <Pressable 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={fetchSensorData}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Refresh Data</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '600',
  },
  errorSubtext: {
    color: '#721c24',
    fontSize: 12,
    marginTop: 5,
  },
  dataContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  label: {
    fontSize: 16,
    color: '#6c757d',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  updateTime: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 