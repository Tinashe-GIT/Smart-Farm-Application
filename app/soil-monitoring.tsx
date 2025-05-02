import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import {
  Card,
  Text,
  Button,
  Portal,
  Dialog,
  TextInput,
  List,
  IconButton,
  useTheme,
  ProgressBar,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { SoilSettings, saveSoilSettings, getSoilSettings, analyzeSoilHealth } from '../utils/farmSettings';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

type SoilData = {
  timestamp: number;
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
};

export default function SoilMonitoringScreen() {
  const [settings, setSettings] = useState<SoilSettings | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const theme = useTheme();
  const router = useRouter();

  // Form state for manual reading
  const [readingForm, setReadingForm] = useState({
    moisture: '',
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('Loading soil settings...');
      const savedSettings = await getSoilSettings();
      console.log('Loaded soil settings:', savedSettings);
      setSettings(savedSettings);
      if (savedSettings.zones.length > 0) {
        setSelectedZone(savedSettings.zones[0].id);
      }
    } catch (error) {
      console.error('Error loading soil settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReading = async () => {
    if (!selectedZone) return;

    try {
      const newReading: SoilData = {
        timestamp: Date.now(),
        moisture: parseFloat(readingForm.moisture),
        ph: parseFloat(readingForm.ph),
        nitrogen: parseFloat(readingForm.nitrogen),
        phosphorus: parseFloat(readingForm.phosphorus),
        potassium: parseFloat(readingForm.potassium),
        temperature: parseFloat(readingForm.temperature),
      };

      const updatedSettings = {
        ...settings,
        readings: [...settings.readings, { ...newReading, zoneId: selectedZone }],
        lastUpdate: Date.now(),
      };
      await saveSoilSettings(updatedSettings);
      setSettings(updatedSettings);
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error adding soil reading:', error);
    }
  };

  const resetForm = () => {
    setReadingForm({
      moisture: '',
      ph: '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      temperature: '',
    });
  };

  const getFilteredReadings = () => {
    if (!selectedZone) return [];

    const now = Date.now();
    const timeFilter = {
      '24h': now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
    }[timeRange];

    return settings.readings
      .filter(reading => reading.zoneId === selectedZone && reading.timestamp >= timeFilter)
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const getChartData = (key: keyof SoilData) => {
    const readings = getFilteredReadings();
    return {
      labels: readings.map(r => new Date(r.timestamp).toLocaleTimeString()),
      datasets: [{
        data: readings.map(r => r[key] as number),
      }],
    };
  };

  const soilHealth = selectedZone ? analyzeSoilHealth(settings, selectedZone) : null;

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    color: (opacity = 1) => theme.colors.primary,
    strokeWidth: 2,
    barPercentage: 0.5,
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
        <Text>No soil monitoring data available</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.zoneSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {settings.zones.map(zone => (
              <Chip
                key={zone.id}
                selected={zone.id === selectedZone}
                onPress={() => setSelectedZone(zone.id)}
                style={styles.zoneChip}
              >
                {zone.name}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {selectedZone && (
          <>
            <Card style={styles.card}>
              <Card.Title title="Soil Health Overview" />
              <Card.Content>
                {soilHealth && (
                  <>
                    <Text variant="titleMedium" style={styles.statusText}>
                      Status: {soilHealth.status}
                    </Text>
                    {soilHealth.issues.length > 0 && (
                      <>
                        <Text variant="titleSmall" style={styles.issuesTitle}>Issues:</Text>
                        {soilHealth.issues.map((issue, index) => (
                          <Text key={index} style={styles.issueText}>• {issue}</Text>
                        ))}
                      </>
                    )}
                    {soilHealth.recommendations.length > 0 && (
                      <>
                        <Text variant="titleSmall" style={styles.recommendationsTitle}>
                          Recommendations:
                        </Text>
                        {soilHealth.recommendations.map((rec, index) => (
                          <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                        ))}
                      </>
                    )}
                  </>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title 
                title="Current Readings"
                right={props => (
                  <IconButton
                    icon="plus"
                    onPress={() => setShowAddDialog(true)}
                  />
                )}
              />
              <Card.Content>
                <View style={styles.timeRangeSelector}>
                  {(['24h', '7d', '30d'] as const).map(range => (
                    <Chip
                      key={range}
                      selected={timeRange === range}
                      onPress={() => setTimeRange(range)}
                      style={styles.timeChip}
                    >
                      {range}
                    </Chip>
                  ))}
                </View>

                <Text variant="titleMedium" style={styles.chartTitle}>Soil Moisture (%)</Text>
                <LineChart
                  data={getChartData('moisture')}
                  width={Dimensions.get('window').width - 32}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />

                <Text variant="titleMedium" style={styles.chartTitle}>Soil pH</Text>
                <LineChart
                  data={getChartData('ph')}
                  width={Dimensions.get('window').width - 32}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />

                <Text variant="titleMedium" style={styles.chartTitle}>NPK Levels</Text>
                <View style={styles.npkContainer}>
                  <View style={styles.npkItem}>
                    <Text>Nitrogen</Text>
                    <ProgressBar 
                      progress={getFilteredReadings().slice(-1)[0]?.nitrogen / 100 || 0}
                      style={styles.progressBar}
                    />
                  </View>
                  <View style={styles.npkItem}>
                    <Text>Phosphorus</Text>
                    <ProgressBar 
                      progress={getFilteredReadings().slice(-1)[0]?.phosphorus / 100 || 0}
                      style={styles.progressBar}
                    />
                  </View>
                  <View style={styles.npkItem}>
                    <Text>Potassium</Text>
                    <ProgressBar 
                      progress={getFilteredReadings().slice(-1)[0]?.potassium / 100 || 0}
                      style={styles.progressBar}
                    />
                  </View>
                </View>

                <Text variant="titleMedium" style={styles.chartTitle}>Soil Temperature (°C)</Text>
                <LineChart
                  data={getChartData('temperature')}
                  width={Dimensions.get('window').width - 32}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={showAddDialog}
          onDismiss={() => {
            setShowAddDialog(false);
            resetForm();
          }}
        >
          <Dialog.Title>Add Soil Reading</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogScroll}>
              <TextInput
                label="Moisture (%)"
                value={readingForm.moisture}
                onChangeText={text => setReadingForm(prev => ({ ...prev, moisture: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="pH Level"
                value={readingForm.ph}
                onChangeText={text => setReadingForm(prev => ({ ...prev, ph: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Nitrogen Level"
                value={readingForm.nitrogen}
                onChangeText={text => setReadingForm(prev => ({ ...prev, nitrogen: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Phosphorus Level"
                value={readingForm.phosphorus}
                onChangeText={text => setReadingForm(prev => ({ ...prev, phosphorus: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Potassium Level"
                value={readingForm.potassium}
                onChangeText={text => setReadingForm(prev => ({ ...prev, potassium: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Temperature (°C)"
                value={readingForm.temperature}
                onChangeText={text => setReadingForm(prev => ({ ...prev, temperature: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowAddDialog(false);
              resetForm();
            }}>Cancel</Button>
            <Button onPress={handleAddReading}>Add Reading</Button>
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
  zoneSelector: {
    padding: 8,
  },
  zoneChip: {
    marginHorizontal: 4,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeChip: {
    marginHorizontal: 4,
  },
  chartTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  npkContainer: {
    marginVertical: 16,
  },
  npkItem: {
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  dialogScroll: {
    maxHeight: 400,
  },
  input: {
    marginBottom: 12,
  },
  statusText: {
    marginBottom: 12,
  },
  issuesTitle: {
    marginTop: 8,
    marginBottom: 4,
    color: 'red',
  },
  issueText: {
    color: 'red',
    marginLeft: 8,
    marginBottom: 4,
  },
  recommendationsTitle: {
    marginTop: 12,
    marginBottom: 4,
    color: 'green',
  },
  recommendationText: {
    color: 'green',
    marginLeft: 8,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 