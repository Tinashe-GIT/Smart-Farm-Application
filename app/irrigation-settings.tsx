import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Card,
  Text,
  Switch,
  Button,
  Portal,
  Dialog,
  TextInput,
  SegmentedButtons,
  Divider,
  List,
  IconButton,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { IrrigationSettings, saveIrrigationSettings, getIrrigationSettings } from '../utils/farmSettings';
import { useRouter } from 'expo-router';

type Schedule = {
  id: string;
  time: string;
  duration: number;
  zones: string[];
  days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
};

export default function IrrigationSettingsScreen() {
  const [settings, setSettings] = useState<IrrigationSettings | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const router = useRouter();

  // Form state for schedule
  const [scheduleForm, setScheduleForm] = useState({
    time: '06:00',
    duration: '30',
    zones: [] as string[],
    days: [] as ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[],
  });

  // Form state for zone
  const [zoneForm, setZoneForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('Loading irrigation settings...');
      const savedSettings = await getIrrigationSettings();
      console.log('Loaded irrigation settings:', savedSettings);
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading irrigation settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!settings) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Text>No irrigation settings available</Text>
      </ThemedView>
    );
  }

  const handleAutoModeToggle = async () => {
    try {
      const updatedSettings = {
        ...settings,
        autoMode: !settings.autoMode,
      };
      await saveIrrigationSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating auto mode:', error);
    }
  };

  const handleMoistureThresholdChange = async (value: string) => {
    const threshold = parseInt(value);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) return;

    try {
      const updatedSettings = {
        ...settings,
        moistureThreshold: threshold,
      };
      await saveIrrigationSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating moisture threshold:', error);
    }
  };

  const handleAddSchedule = async () => {
    try {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        time: scheduleForm.time,
        duration: parseInt(scheduleForm.duration),
        zones: scheduleForm.zones,
        days: scheduleForm.days,
      };

      const updatedSettings = {
        ...settings,
        schedules: [...settings.schedules, newSchedule],
      };
      await saveIrrigationSettings(updatedSettings);
      setSettings(updatedSettings);
      setShowScheduleDialog(false);
      resetScheduleForm();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const updatedSettings = {
        ...settings,
        schedules: settings.schedules.filter(schedule => schedule.id !== id),
      };
      await saveIrrigationSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleAddZone = async () => {
    if (!zoneForm.name) return;

    try {
      const updatedSettings = {
        ...settings,
        zones: [...settings.zones, { 
          id: Date.now().toString(),
          name: zoneForm.name,
          description: zoneForm.description,
        }],
      };
      await saveIrrigationSettings(updatedSettings);
      setSettings(updatedSettings);
      setShowZoneDialog(false);
      setZoneForm({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding zone:', error);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      const updatedSettings = {
        ...settings,
        zones: settings.zones.filter(zone => zone.id !== zoneId),
        schedules: settings.schedules.map(schedule => ({
          ...schedule,
          zones: schedule.zones.filter(id => id !== zoneId),
        })),
      };
      await saveIrrigationSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      time: '06:00',
      duration: '30',
      zones: [],
      days: [],
    });
  };

  const weekDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Title title="Automation Settings" />
          <Card.Content>
            <View style={styles.settingRow}>
              <Text>Automatic Mode</Text>
              <Switch
                value={settings.autoMode}
                onValueChange={handleAutoModeToggle}
              />
            </View>
            <View style={styles.settingRow}>
              <Text>Moisture Threshold (%)</Text>
              <TextInput
                value={settings.moistureThreshold.toString()}
                onChangeText={handleMoistureThresholdChange}
                keyboardType="numeric"
                mode="outlined"
                style={styles.thresholdInput}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title 
            title="Irrigation Zones"
            right={props => (
              <IconButton
                icon="plus"
                onPress={() => setShowZoneDialog(true)}
              />
            )}
          />
          <Card.Content>
            {settings.zones.map(zone => (
              <List.Item
                key={zone.id}
                title={zone.name}
                description={zone.description}
                right={props => (
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => handleDeleteZone(zone.id)}
                  />
                )}
              />
            ))}
            {settings.zones.length === 0 && (
              <Text style={styles.emptyText}>No zones configured</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title 
            title="Irrigation Schedules"
            right={props => (
              <IconButton
                icon="plus"
                onPress={() => setShowScheduleDialog(true)}
              />
            )}
          />
          <Card.Content>
            {settings.schedules.map(schedule => (
              <Card key={schedule.id} style={styles.scheduleCard}>
                <Card.Content>
                  <View style={styles.scheduleHeader}>
                    <Text variant="titleMedium">{schedule.time}</Text>
                    <IconButton
                      icon="delete"
                      iconColor={theme.colors.error}
                      onPress={() => handleDeleteSchedule(schedule.id)}
                    />
                  </View>
                  <Text>Duration: {schedule.duration} minutes</Text>
                  <Text>Zones: {schedule.zones.map(zoneId => 
                    settings.zones.find(z => z.id === zoneId)?.name
                  ).join(', ')}</Text>
                  <Text>Days: {schedule.days.join(', ')}</Text>
                </Card.Content>
              </Card>
            ))}
            {settings.schedules.length === 0 && (
              <Text style={styles.emptyText}>No schedules configured</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        {/* Add Zone Dialog */}
        <Dialog
          visible={showZoneDialog}
          onDismiss={() => setShowZoneDialog(false)}
        >
          <Dialog.Title>Add Irrigation Zone</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Zone Name"
              value={zoneForm.name}
              onChangeText={text => setZoneForm(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={zoneForm.description}
              onChangeText={text => setZoneForm(prev => ({ ...prev, description: text }))}
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowZoneDialog(false)}>Cancel</Button>
            <Button onPress={handleAddZone}>Add Zone</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Add Schedule Dialog */}
        <Dialog
          visible={showScheduleDialog}
          onDismiss={() => {
            setShowScheduleDialog(false);
            resetScheduleForm();
          }}
        >
          <Dialog.Title>Add Irrigation Schedule</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogScroll}>
              <TextInput
                label="Time"
                value={scheduleForm.time}
                onChangeText={text => setScheduleForm(prev => ({ ...prev, time: text }))}
                mode="outlined"
                style={styles.input}
                placeholder="HH:MM"
              />
              <TextInput
                label="Duration (minutes)"
                value={scheduleForm.duration}
                onChangeText={text => setScheduleForm(prev => ({ ...prev, duration: text }))}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
              />

              <Text variant="labelLarge" style={styles.sectionTitle}>Zones</Text>
              {settings.zones.map(zone => (
                <List.Item
                  key={zone.id}
                  title={zone.name}
                  description={zone.description}
                  right={props => (
                    <Switch
                      value={scheduleForm.zones.includes(zone.id)}
                      onValueChange={() => {
                        setScheduleForm(prev => ({
                          ...prev,
                          zones: prev.zones.includes(zone.id)
                            ? prev.zones.filter(id => id !== zone.id)
                            : [...prev.zones, zone.id],
                        }));
                      }}
                    />
                  )}
                />
              ))}

              <Text variant="labelLarge" style={styles.sectionTitle}>Days</Text>
              {weekDays.map(day => (
                <List.Item
                  key={day}
                  title={day.charAt(0).toUpperCase() + day.slice(1)}
                  right={props => (
                    <Switch
                      value={scheduleForm.days.includes(day)}
                      onValueChange={() => {
                        setScheduleForm(prev => ({
                          ...prev,
                          days: prev.days.includes(day)
                            ? prev.days.filter(d => d !== day)
                            : [...prev.days, day],
                        }));
                      }}
                    />
                  )}
                />
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowScheduleDialog(false);
              resetScheduleForm();
            }}>Cancel</Button>
            <Button onPress={handleAddSchedule}>Add Schedule</Button>
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
  card: {
    margin: 8,
  },
  scheduleCard: {
    marginVertical: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  thresholdInput: {
    width: 80,
  },
  input: {
    marginBottom: 12,
  },
  dialogScroll: {
    maxHeight: 400,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 