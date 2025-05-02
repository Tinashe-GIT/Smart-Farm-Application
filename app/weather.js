import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import WeatherCard from '../components/WeatherCard';
import { fetchSensorData, fetchWeatherData, getMockSensorData, getMockWeatherData } from '../utils/api';

export default function WeatherScreen() {
  const [sensorData, setSensorData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      // Try to fetch real data first
      const sensor = await fetchSensorData();
      const weather = await fetchWeatherData();

      // If real data fetch fails, use mock data
      setSensorData(sensor || getMockSensorData());
      setWeatherData(weather || getMockWeatherData());
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load weather data. Using mock data.');
      // Use mock data as fallback
      setSensorData(getMockSensorData());
      setWeatherData(getMockWeatherData());
    }
  };

  useEffect(() => {
    loadData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        {error && (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        )}

        {sensorData && (
          <WeatherCard
            data={{
              ...sensorData,
              forecast: weatherData?.forecast,
            }}
          />
        )}

        {weatherData && (
          <View style={styles.forecastContainer}>
            <ThemedText style={styles.forecastTitle}>Weather Forecast</ThemedText>
            <View style={styles.forecastGrid}>
              {weatherData.forecast.map((day, index) => (
                <View key={index} style={styles.forecastDay}>
                  <ThemedText style={styles.dayName}>{day.day}</ThemedText>
                  <ThemedText style={styles.temperature}>
                    {day.temp}°C
                  </ThemedText>
                  <ThemedText style={styles.rainfall}>
                    {day.rain}% rain
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  forecastContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  forecastGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastDay: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 18,
    marginBottom: 4,
  },
  rainfall: {
    fontSize: 14,
    color: '#666',
  },
}); 