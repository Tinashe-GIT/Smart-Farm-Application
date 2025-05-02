import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

const WeatherCard = ({ data }) => {
  if (!data) return null;

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Weather & Sensor Data</ThemedText>
        <ThemedText style={styles.timestamp}>
          {new Date(data.timestamp).toLocaleTimeString()}
        </ThemedText>
      </View>

      <View style={styles.grid}>
        <View style={styles.item}>
          <ThemedText style={styles.label}>Temperature</ThemedText>
          <ThemedText style={styles.value}>{data.temperature}°C</ThemedText>
        </View>

        <View style={styles.item}>
          <ThemedText style={styles.label}>Humidity</ThemedText>
          <ThemedText style={styles.value}>{data.humidity}%</ThemedText>
        </View>

        <View style={styles.item}>
          <ThemedText style={styles.label}>Soil Moisture</ThemedText>
          <ThemedText style={styles.value}>{data.soilMoisture}%</ThemedText>
        </View>

        <View style={styles.item}>
          <ThemedText style={styles.label}>Light</ThemedText>
          <ThemedText style={styles.value}>{data.lightIntensity} lux</ThemedText>
        </View>
      </View>

      {data.forecast && (
        <View style={styles.forecast}>
          <ThemedText style={styles.forecastTitle}>3-Day Forecast</ThemedText>
          <View style={styles.forecastGrid}>
            {data.forecast.map((day, index) => (
              <View key={index} style={styles.forecastItem}>
                <ThemedText style={styles.forecastDay}>{day.day}</ThemedText>
                <ThemedText style={styles.forecastTemp}>{day.temp}°C</ThemedText>
                <ThemedText style={styles.forecastRain}>{day.rain}% rain</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '48%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  forecast: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  forecastGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastDay: {
    fontSize: 14,
    opacity: 0.7,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  forecastRain: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default WeatherCard; 