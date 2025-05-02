import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Smart Farming</ThemedText>
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4CAF50',
  },
  loader: {
    marginTop: 20,
  },
}); 