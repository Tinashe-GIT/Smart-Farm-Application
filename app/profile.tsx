import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import RegistrationForm from '../components/RegistrationForm';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleRegistrationComplete = () => {
    console.log('Registration complete, navigating to home...');
    // The navigation will be handled by the useProtectedRoute hook in _layout.tsx
  };

  return (
    <ThemedView style={styles.container}>
      <RegistrationForm onComplete={handleRegistrationComplete} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 