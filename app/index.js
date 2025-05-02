import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserProfile } from '../utils/storage';

export default function HomeScreen() {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      const profile = await getUserProfile();
      if (!profile) {
        console.log('No profile found, redirecting to registration...');
        router.replace('profile');
      } else {
        console.log('Profile found, redirecting to dashboard...');
        router.replace('/(tabs)');
      }
    };
    checkProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Plant Communication</Text>
      <Text style={styles.subtitle}>Welcome to your smart farming assistant!</Text>
      <Text style={styles.updateTime}>Last updated: {lastUpdated}</Text>
      
      <View style={styles.buttonContainer}>
        <Link href="/profile" asChild>
          <Pressable 
            style={styles.button}
            onPress={() => setLastUpdated(new Date().toLocaleTimeString())}
          >
            <Text style={styles.buttonText}>Create Profile</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  updateTime: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 