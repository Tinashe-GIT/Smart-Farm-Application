import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../constants/api';

export default function PlantStatusScreen() {
  const [analysis, setAnalysis] = useState({
    status: 'No disease detected',
    health: 'Good',
    recommendations: 'Continue current care routine',
    lastUpdated: new Date().toLocaleTimeString()
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Prepare sensor data for prediction
      const sensorData = [
        22, // temperature
        60, // humidity
        45, // soil moisture
        75  // light intensity
      ];

      const response = await fetch(API_ENDPOINTS.predict, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ data: sensorData })
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const prediction = await response.json();
      
      // Process prediction results
      const [healthyProbability, diseasedProbability] = prediction.result;
      const isHealthy = healthyProbability > 0.7;

      setAnalysis({
        status: isHealthy ? 'No disease detected' : 'Potential disease detected',
        health: isHealthy ? 'Good' : 'Needs attention',
        recommendations: isHealthy 
          ? 'Continue current care routine'
          : 'Apply recommended treatment',
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
      // Fallback to mock analysis
      setAnalysis({
        status: Math.random() > 0.7 ? 'Potential disease detected' : 'No disease detected',
        health: Math.random() > 0.7 ? 'Needs attention' : 'Good',
        recommendations: Math.random() > 0.7 
          ? 'Apply recommended treatment'
          : 'Continue current care routine',
        lastUpdated: new Date().toLocaleTimeString()
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Health Analysis</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorSubtext}>Using mock analysis</Text>
        </View>
      )}
      
      <View style={styles.analysisContainer}>
        <View style={styles.analysisRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[
            styles.value,
            analysis.status === 'No disease detected' ? styles.good : styles.warning
          ]}>
            {analysis.status}
          </Text>
        </View>
        
        <View style={styles.analysisRow}>
          <Text style={styles.label}>Health:</Text>
          <Text style={[
            styles.value,
            analysis.health === 'Good' ? styles.good : styles.warning
          ]}>
            {analysis.health}
          </Text>
        </View>
        
        <View style={styles.analysisRow}>
          <Text style={styles.label}>Recommendations:</Text>
          <Text style={styles.recommendation}>{analysis.recommendations}</Text>
        </View>
      </View>

      <Text style={styles.updateTime}>Last updated: {analysis.lastUpdated}</Text>

      <Pressable 
        style={[styles.button, isAnalyzing && styles.buttonDisabled]}
        onPress={runAnalysis}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Run Analysis</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0fff0',
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
  analysisContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  analysisRow: {
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
  },
  good: {
    color: '#27ae60',
  },
  warning: {
    color: '#e74c3c',
  },
  recommendation: {
    fontSize: 16,
    color: '#2c3e50',
    fontStyle: 'italic',
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