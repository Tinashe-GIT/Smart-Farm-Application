import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Switch, Text, useTheme, Divider, Button, Portal, Dialog, TextInput } from 'react-native-paper';
import { useThemeContext } from '../context/ThemeContext';
import { ThemedView } from '../components/ThemedView';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    weatherAlerts: true,
    cropUpdates: true,
    smartPole: true,
    marketPrices: false,
    systemUpdates: true,
  });

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Toggle dark/light theme"
            left={props => <List.Icon {...props} icon={isDarkMode ? "weather-night" : "weather-sunny"} />}
            right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
          />
          <List.Item
            title="Language"
            description="English"
            left={props => <List.Icon {...props} icon="translate" />}
            onPress={() => {}}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Farm Settings</List.Subheader>
          <List.Item
            title="Farm Size"
            description="10 hectares"
            left={props => <List.Icon {...props} icon="ruler" />}
            onPress={() => {}}
          />
          <List.Item
            title="Location"
            description="Update farm location"
            left={props => <List.Icon {...props} icon="map-marker" />}
            onPress={() => {}}
          />
          <List.Item
            title="Crop Types"
            description="Manage crop varieties"
            left={props => <List.Icon {...props} icon="sprout" />}
            onPress={() => {}}
          />
          <List.Item
            title="Smart Pole Configuration"
            description="Sensor settings and calibration"
            left={props => <List.Icon {...props} icon="pole" />}
            onPress={() => {}}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Weather Alerts"
            description="Get notified about weather changes"
            left={props => <List.Icon {...props} icon="weather-cloudy-alert" />}
            right={() => (
              <Switch
                value={notificationSettings.weatherAlerts}
                onValueChange={() => toggleNotification('weatherAlerts')}
              />
            )}
          />
          <List.Item
            title="Crop Updates"
            description="Get notified about crop status"
            left={props => <List.Icon {...props} icon="sprout" />}
            right={() => (
              <Switch
                value={notificationSettings.cropUpdates}
                onValueChange={() => toggleNotification('cropUpdates')}
              />
            )}
          />
          <List.Item
            title="Smart Pole Alerts"
            description="Get notified about pole status"
            left={props => <List.Icon {...props} icon="pole" />}
            right={() => (
              <Switch
                value={notificationSettings.smartPole}
                onValueChange={() => toggleNotification('smartPole')}
              />
            )}
          />
          <List.Item
            title="Market Prices"
            description="Get updates on crop market prices"
            left={props => <List.Icon {...props} icon="cash" />}
            right={() => (
              <Switch
                value={notificationSettings.marketPrices}
                onValueChange={() => toggleNotification('marketPrices')}
              />
            )}
          />
          <List.Item
            title="System Updates"
            description="Get notified about app updates"
            left={props => <List.Icon {...props} icon="update" />}
            right={() => (
              <Switch
                value={notificationSettings.systemUpdates}
                onValueChange={() => toggleNotification('systemUpdates')}
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Data & Sync</List.Subheader>
          <List.Item
            title="Auto-Sync"
            description="Automatically sync data in background"
            left={props => <List.Icon {...props} icon="sync" />}
            right={() => <Switch value={true} />}
          />
          <List.Item
            title="Sync Frequency"
            description="Every 30 minutes"
            left={props => <List.Icon {...props} icon="timer" />}
            onPress={() => {}}
          />
          <List.Item
            title="Data Storage"
            description="2.5 GB used"
            left={props => <List.Icon {...props} icon="database" />}
            onPress={() => setShowClearDataDialog(true)}
          />
          <List.Item
            title="Export Data"
            description="Export farm data as CSV"
            left={props => <List.Icon {...props} icon="file-export" />}
            onPress={() => {}}
          />
          <List.Item
            title="Weather API Key"
            description="Configure weather data source"
            left={props => <List.Icon {...props} icon="key" />}
            onPress={() => setShowApiKeyDialog(true)}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Security</List.Subheader>
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock" />}
            onPress={() => {}}
          />
          <List.Item
            title="Two-Factor Authentication"
            left={props => <List.Icon {...props} icon="shield-check" />}
            right={() => <Switch value={false} />}
          />
          <List.Item
            title="Biometric Login"
            left={props => <List.Icon {...props} icon="fingerprint" />}
            right={() => <Switch value={true} />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => {}}
          />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {}}
          />
          <List.Item
            title="Open Source Licenses"
            left={props => <List.Icon {...props} icon="license" />}
            onPress={() => {}}
          />
        </List.Section>
      </ScrollView>

      {/* Clear Data Dialog */}
      <Portal>
        <Dialog visible={showClearDataDialog} onDismiss={() => setShowClearDataDialog(false)}>
          <Dialog.Title>Clear App Data</Dialog.Title>
          <Dialog.Content>
            <Text>This will delete all locally stored data including crop history, sensor readings, and preferences. This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowClearDataDialog(false)}>Cancel</Button>
            <Button onPress={() => setShowClearDataDialog(false)} textColor="red">Clear Data</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* API Key Dialog */}
      <Portal>
        <Dialog visible={showApiKeyDialog} onDismiss={() => setShowApiKeyDialog(false)}>
          <Dialog.Title>Weather API Key</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>Enter your OpenWeatherMap API key to enable weather forecasting.</Text>
            <TextInput
              mode="outlined"
              label="API Key"
              value={apiKey}
              onChangeText={setApiKey}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowApiKeyDialog(false)}>Cancel</Button>
            <Button onPress={() => setShowApiKeyDialog(false)}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dialogText: {
    marginBottom: 16,
  },
  input: {
    marginTop: 8,
  },
}); 