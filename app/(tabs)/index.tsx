import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View, Pressable, Modal, ViewStyle } from 'react-native';
import { Text, Card, Button, ActivityIndicator, useTheme, Divider, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '../../components/ThemedView';
import { getWeatherData, getCropInfo, getPoleData, syncDataToCloud } from '../../utils/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import type { MaterialCommunityIcons as IconType } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    rainfall: number;
    uv_index: number;
    pressure: number;
    visibility: number;
    feelsLike: number;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    rain: number;
    condition: string;
  }>;
  alerts: string[];
  soilConditions: {
    moisture: number;
    temperature: number;
    ph: number;
  };
}

interface CropInfo {
  name: string;
  variety: string;
  growthStage: string;
  healthStatus: string;
  nextAction: string;
  daysPlanted: number;
  expectedHarvest: string;
  details: {
    height: string;
    leafColor: string;
    pestStatus: string;
    nutrientLevels: {
      [key: string]: string;
    };
  };
  recommendations: string[];
  history: Array<{
    date: string;
    action: string;
    details: string;
  }>;
}

interface PoleData {
  batteryLevel: number;
  signalStrength: string;
  lastUpdate: string;
  sensors: {
    [key: string]: {
      status: string;
      lastCalibration: string;
    };
  };
  maintenance: {
    nextCheck: string;
    batteryHealth: string;
    solarPanel: {
      efficiency: string;
      lastCleaned: string;
    };
  };
  coverage: {
    radius: string;
    areaMonitored: string;
    signalQuality: string;
  };
  alerts: string[];
}

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const theme = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [cropInfo, setCropInfo] = useState<CropInfo | null>(null);
  const [poleData, setPoleData] = useState<PoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selectedCard, setSelectedCard] = useState<'weather' | 'crop' | 'pole' | null>(null);
  const [showWeatherAlert, setShowWeatherAlert] = useState(false);
  const router = useRouter();

  // Mock historical data - replace with real data from API
  const historicalData = {
    temperature: {
      labels: ['6h', '12h', '18h', '24h', '30h', '36h'],
      datasets: [{
        data: [23, 24, 25, 24, 23, 25],
        color: (opacity = 1) => theme.colors.primary
      }]
    },
    moisture: {
      labels: ['6h', '12h', '18h', '24h', '30h', '36h'],
      datasets: [{
        data: [45, 43, 45, 42, 44, 45],
        color: (opacity = 1) => theme.colors.secondary
      }]
    }
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    color: (opacity = 1) => theme.colors.primary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const loadData = async () => {
    try {
      const [weatherData, cropData, poleStatus] = await Promise.all([
        getWeatherData(),
        getCropInfo(),
        getPoleData()
      ]);
      setWeather(weatherData);
      setCropInfo(cropData);
      setPoleData(poleStatus);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setRefreshing(true);
      await syncDataToCloud();
      setLastSync(new Date());
      await loadData();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const getWeatherIcon = (condition: string | undefined): string => {
    switch (condition?.toLowerCase()) {
      case 'sunny': return 'weather-sunny';
      case 'partly cloudy': return 'weather-partly-cloudy';
      case 'rain showers': return 'weather-rainy';
      case 'cloudy': return 'weather-cloudy';
      case 'mostly sunny': return 'weather-partly-cloudy';
      default: return 'weather-sunny';
    }
  };

  const renderDetailModal = () => {
    if (!selectedCard) return null;

    return (
      <Portal>
        <Modal
          visible={!!selectedCard}
          onDismiss={() => setSelectedCard(null)}
          style={styles.modalContent}
        >
          <ScrollView>
            {selectedCard === 'weather' && weather && (
              <>
                <Text style={styles.modalTitle}>Detailed Weather Information</Text>
                <Text style={styles.modalSubtitle}>Temperature Trend</Text>
                <LineChart
                  data={historicalData.temperature}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
                <Text style={styles.sectionTitle}>Additional Metrics</Text>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>UV Index</Text>
                    <Text style={styles.value}>{weather.current.uv_index}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Pressure</Text>
                    <Text style={styles.value}>{weather.current.pressure} hPa</Text>
                  </View>
                </View>
                <Text style={styles.sectionTitle}>Soil Conditions</Text>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Moisture</Text>
                    <Text style={styles.value}>{weather.soilConditions.moisture}%</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Temperature</Text>
                    <Text style={styles.value}>{weather.soilConditions.temperature}°C</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>pH Level</Text>
                    <Text style={styles.value}>{weather.soilConditions.ph}</Text>
                  </View>
                </View>
              </>
            )}

            {selectedCard === 'crop' && cropInfo && (
              <>
                <Text style={styles.modalTitle}>Detailed Crop Information</Text>
                <Text style={styles.modalSubtitle}>Growth Progress</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(cropInfo.daysPlanted / 120) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {cropInfo.daysPlanted} days / {cropInfo.expectedHarvest}
                </Text>

                <Text style={styles.sectionTitle}>Nutrient Levels</Text>
                <View style={styles.nutrientGrid}>
                  {Object.entries(cropInfo.details.nutrientLevels).map(([nutrient, level]) => (
                    <View key={nutrient} style={styles.nutrientItem}>
                      <Text style={styles.label}>{nutrient}</Text>
                      <Text style={[
                        styles.value,
                        { color: level === 'Optimal' ? '#4CAF50' : 
                                level === 'Adequate' ? '#FF9800' : '#F44336' }
                      ]}>
                        {level}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {cropInfo.history.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <Text style={styles.activityDate}>{activity.date}</Text>
                    <Text style={styles.activityTitle}>{activity.action}</Text>
                    <Text style={styles.activityDetails}>{activity.details}</Text>
                  </View>
                ))}
              </>
            )}

            {selectedCard === 'pole' && poleData && (
              <>
                <Text style={styles.modalTitle}>Smart Pole Details</Text>
                <Text style={styles.modalSubtitle}>Sensor Data Trends</Text>
                <LineChart
                  data={historicalData.moisture}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />

                <Text style={styles.sectionTitle}>Solar Panel Performance</Text>
                <View style={styles.performanceGrid}>
                  <View style={styles.performanceItem}>
                    <Text style={styles.label}>Efficiency</Text>
                    <Text style={styles.value}>{poleData.maintenance.solarPanel.efficiency}</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Text style={styles.label}>Last Cleaned</Text>
                    <Text style={styles.value}>{poleData.maintenance.solarPanel.lastCleaned}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Coverage Details</Text>
                <View style={styles.coverageDetails}>
                  <Text>Radius: {poleData.coverage.radius}</Text>
                  <Text>Area: {poleData.coverage.areaMonitored}</Text>
                  <Text>Signal Quality: {poleData.coverage.signalQuality}</Text>
                </View>

                <Text style={styles.sectionTitle}>Maintenance Schedule</Text>
                <View style={styles.maintenanceSchedule}>
                  <Text>Next Check: {poleData.maintenance.nextCheck}</Text>
                  <Text>Battery Health: {poleData.maintenance.batteryHealth}</Text>
                </View>
              </>
            )}
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  // Render weather alert modal
  const renderWeatherAlert = () => {
    if (!weather?.alerts?.length) return null;

    return (
      <Portal>
        <Modal
          visible={showWeatherAlert}
          onDismiss={() => setShowWeatherAlert(false)}
          style={styles.alertModal}
        >
          <Text style={styles.alertTitle}>Weather Alerts</Text>
          {weather.alerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <MaterialCommunityIcons name="alert-octagon" size={24} color="#F44336" />
              <Text style={styles.alertText}>{alert}</Text>
            </View>
          ))}
          <Button onPress={() => setShowWeatherAlert(false)}>Dismiss</Button>
        </Modal>
      </Portal>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleSync} />
        }
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Farm Dashboard
            </Text>
            {lastSync && (
              <Text variant="labelSmall" style={styles.syncText}>
                Last synced: {lastSync.toLocaleTimeString()}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Quick Access Section */}
        <Card style={styles.quickAccessCard}>
          <Card.Title title="Farm Management" />
          <Card.Content>
            <View style={styles.quickAccessGrid}>
              <Pressable 
                style={[styles.quickAccessItem, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => router.push({ pathname: '/crop-types' } as any)}
              >
                <MaterialCommunityIcons 
                  name="sprout" 
                  size={32} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.quickAccessText}>Crop Types</Text>
              </Pressable>
              <Pressable 
                style={[styles.quickAccessItem, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => router.push({ pathname: '/irrigation-settings' } as any)}
              >
                <MaterialCommunityIcons 
                  name="water" 
                  size={32} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.quickAccessText}>Irrigation</Text>
              </Pressable>
              <Pressable 
                style={[styles.quickAccessItem, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => router.push({ pathname: '/soil-monitoring' } as any)}
              >
                <MaterialCommunityIcons 
                  name="chart-bubble" 
                  size={32} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.quickAccessText}>Soil Monitor</Text>
              </Pressable>
              <Pressable 
                style={[styles.quickAccessItem, { backgroundColor: theme.colors.surfaceVariant }]}
              >
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={32} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.quickAccessText}>Field Map</Text>
              </Pressable>
            </View>
          </Card.Content>
        </Card>

        {/* Weather Card */}
        <Pressable onPress={() => setSelectedCard('weather')}>
          <Card style={styles.card}>
            <Card.Title
              title="Weather"
              right={(props) => (
                <MaterialCommunityIcons
                  name={getWeatherIcon(weather?.forecast[0]?.condition)}
                  size={24}
                  color={theme.colors.primary}
                  style={{ marginRight: 16 }}
                />
              )}
            />
            <Card.Content>
              {weather ? (
                <>
                  <Text style={styles.temperature}>{weather.current.temperature}°C</Text>
                  <Text style={styles.feelsLike}>Feels like {weather.current.feelsLike}°C</Text>
                  <View style={styles.weatherGrid}>
                    <View style={styles.weatherItem}>
                      <MaterialCommunityIcons name="water-percent" size={24} color={theme.colors.primary} />
                      <Text>Humidity: {weather.current.humidity}%</Text>
                    </View>
                    <View style={styles.weatherItem}>
                      <MaterialCommunityIcons name="weather-windy" size={24} color={theme.colors.primary} />
                      <Text>Wind: {weather.current.windSpeed} km/h</Text>
                    </View>
                    <View style={styles.weatherItem}>
                      <MaterialCommunityIcons name="water" size={24} color={theme.colors.primary} />
                      <Text>Rainfall: {weather.current.rainfall} mm</Text>
                    </View>
                    <View style={styles.weatherItem}>
                      <MaterialCommunityIcons name="eye" size={24} color={theme.colors.primary} />
                      <Text>Visibility: {weather.current.visibility} km</Text>
                    </View>
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  <Text style={styles.sectionTitle}>5-Day Forecast</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
                    {weather.forecast.map((day, index) => (
                      <View key={index} style={styles.forecastDay}>
                        <Text style={styles.dayText}>{day.day}</Text>
                        <MaterialCommunityIcons 
                          name={getWeatherIcon(day.condition)} 
                          size={24} 
                          color={theme.colors.primary} 
                        />
                        <Text style={styles.tempText}>{day.high}°/{day.low}°</Text>
                        <Text style={styles.rainText}>{day.rain}%</Text>
                      </View>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <Text>Weather data unavailable</Text>
              )}
            </Card.Content>
          </Card>
        </Pressable>

        {/* Crop Info Card */}
        <Pressable onPress={() => setSelectedCard('crop')}>
          <Card style={styles.card}>
            <Card.Title title="Crop Status" />
            <Card.Content>
              {cropInfo ? (
                <>
                  <View style={styles.cropHeader}>
                    <Text style={styles.cropName}>{cropInfo.name}</Text>
                    <Text style={styles.cropVariety}>Variety: {cropInfo.variety}</Text>
                  </View>
                  
                  <View style={styles.cropDetails}>
                    <View style={styles.cropDetailItem}>
                      <Text style={styles.label}>Growth Stage:</Text>
                      <Text style={styles.value}>{cropInfo.growthStage}</Text>
                    </View>
                    <View style={styles.cropDetailItem}>
                      <Text style={styles.label}>Days Planted:</Text>
                      <Text style={styles.value}>{cropInfo.daysPlanted} days</Text>
                    </View>
                    <View style={styles.cropDetailItem}>
                      <Text style={styles.label}>Expected Harvest:</Text>
                      <Text style={styles.value}>{cropInfo.expectedHarvest}</Text>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  <Text style={styles.sectionTitle}>Health Status</Text>
                  <View style={styles.healthStatus}>
                    <Text style={[styles.statusText, { color: cropInfo.healthStatus === 'Good' ? '#4CAF50' : '#FF9800' }]}>
                      {cropInfo.healthStatus}
                    </Text>
                    <Text>{cropInfo.details.pestStatus}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>Recommendations</Text>
                  {cropInfo.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendation}>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.primary} />
                      <Text>{rec}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text>No crop information available</Text>
              )}
            </Card.Content>
          </Card>
        </Pressable>

        {/* Smart Pole Card */}
        <Pressable onPress={() => setSelectedCard('pole')}>
          <Card style={styles.card}>
            <Card.Title title="Smart Pole Status" />
            <Card.Content>
              {poleData ? (
                <>
                  <View style={styles.poleHeader}>
                    <View style={styles.poleStatus}>
                      <MaterialCommunityIcons 
                        name="battery-high" 
                        size={24} 
                        color={poleData.batteryLevel > 20 ? '#4CAF50' : '#FF9800'} 
                      />
                      <Text style={styles.batteryText}>Battery: {poleData.batteryLevel}%</Text>
                    </View>
                    <View style={styles.poleStatus}>
                      <MaterialCommunityIcons 
                        name="signal" 
                        size={24} 
                        color={poleData.signalStrength === 'Strong' ? '#4CAF50' : '#FF9800'} 
                      />
                      <Text>Signal: {poleData.signalStrength}</Text>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  <Text style={styles.sectionTitle}>Coverage</Text>
                  <View style={styles.coverageInfo}>
                    <Text>Area Monitored: {poleData.coverage.areaMonitored}</Text>
                    <Text>Signal Quality: {poleData.coverage.signalQuality}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>Maintenance</Text>
                  <View style={styles.maintenanceInfo}>
                    <Text>Next Check: {poleData.maintenance.nextCheck}</Text>
                    <Text>Solar Panel Efficiency: {poleData.maintenance.solarPanel.efficiency}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>Sensor Status</Text>
                  {Object.entries(poleData.sensors).map(([sensor, data]) => (
                    <View key={sensor} style={styles.sensorStatus}>
                      <MaterialCommunityIcons 
                        name={sensor === 'temperature' ? 'thermometer' : 
                              sensor === 'humidity' ? 'water-percent' :
                              sensor === 'soilMoisture' ? 'water' : 'white-balance-sunny'} 
                        size={20} 
                        color={data.status === 'Active' ? '#4CAF50' : '#FF9800'} 
                      />
                      <Text>{sensor}: {data.status}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text>No pole data available</Text>
              )}
            </Card.Content>
            <Card.Actions>
              <Button onPress={handleSync}>Sync Data</Button>
            </Card.Actions>
          </Card>
        </Pressable>
      </ScrollView>

      {renderDetailModal()}
      {renderWeatherAlert()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    marginBottom: 8,
  },
  syncText: {
    color: 'white',
    opacity: 0.8,
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feelsLike: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginVertical: 4,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  forecastScroll: {
    marginTop: 8,
  },
  forecastDay: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 64,
  },
  dayText: {
    fontSize: 14,
    marginBottom: 4,
  },
  tempText: {
    fontSize: 14,
    marginTop: 4,
  },
  rainText: {
    fontSize: 12,
    opacity: 0.7,
  },
  cropHeader: {
    marginBottom: 16,
  },
  cropName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cropVariety: {
    fontSize: 16,
    opacity: 0.7,
  },
  cropDetails: {
    marginBottom: 16,
  },
  cropDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    opacity: 0.7,
  },
  value: {
    fontWeight: '500',
  },
  healthStatus: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  poleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  poleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    marginLeft: 4,
  },
  coverageInfo: {
    marginBottom: 16,
  },
  maintenanceInfo: {
    marginBottom: 16,
  },
  sensorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  } as ViewStyle,
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    width: '48%',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  nutrientGrid: {
    marginBottom: 16,
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  activityItem: {
    marginBottom: 12,
  },
  activityDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityDetails: {
    fontSize: 14,
    opacity: 0.8,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  performanceItem: {
    width: '48%',
  },
  coverageDetails: {
    marginBottom: 16,
  },
  maintenanceSchedule: {
    marginBottom: 16,
  },
  alertModal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  } as ViewStyle,
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertText: {
    marginLeft: 8,
    flex: 1,
  },
  quickAccessCard: {
    margin: 16,
    marginTop: 0,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  quickAccessItem: {
    width: '45%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    margin: 8,
    padding: 16,
    elevation: 2,
  } as ViewStyle,
  quickAccessText: {
    marginTop: 8,
    textAlign: 'center',
  },
});
