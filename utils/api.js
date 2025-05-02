import { getSensorData } from './storage';

const HUB_BASE_URL = 'http://192.168.1.100:5000'; // Update this with your PC hub's IP

export const fetchSensorData = async () => {
  try {
    const response = await fetch(`${HUB_BASE_URL}/sensor-data`);
    if (!response.ok) throw new Error('Failed to fetch sensor data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return null;
  }
};

// Mock data for development - replace with actual API calls later
const MOCK_WEATHER_DATA = {
  temperature: 25,
  humidity: 65,
  rainfall: 0,
  rainfallPrediction: 'No rain expected in the next 24 hours. Perfect conditions for crop growth.',
};

const CROP_INFO = {
  Maize: {
    name: 'Maize',
    commonPests: [
      'Fall Armyworm',
      'Stem Borer',
      'Maize Weevil',
      'Aphids',
    ],
    careInstructions: 'Regular watering and monitoring for pests. Apply fertilizer during growth stages.',
  },
  Wheat: {
    name: 'Wheat',
    commonPests: [
      'Rust',
      'Powdery Mildew',
      'Aphids',
      'Wheat Stem Sawfly',
    ],
    careInstructions: 'Monitor for disease and pests. Ensure proper drainage and soil conditions.',
  },
  Soybeans: {
    name: 'Soybeans',
    commonPests: [
      'Soybean Aphid',
      'Bean Leaf Beetle',
      'Soybean Cyst Nematode',
    ],
    careInstructions: 'Regular soil testing and pest monitoring. Maintain proper irrigation.',
  },
  // Add more crops as needed
};

// Enhanced mock data for development
const mockWeatherData = {
  current: {
    temperature: 25,
    humidity: 65,
    windSpeed: 12,
    rainfall: 0,
    uv_index: 6,
    pressure: 1015,
    visibility: 10,
    feelsLike: 27,
  },
  forecast: [
    { day: 'Today', high: 27, low: 18, rain: 0, condition: 'Sunny' },
    { day: 'Tomorrow', high: 26, low: 17, rain: 30, condition: 'Partly Cloudy' },
    { day: 'Wednesday', high: 25, low: 16, rain: 60, condition: 'Rain Showers' },
    { day: 'Thursday', high: 24, low: 15, rain: 40, condition: 'Cloudy' },
    { day: 'Friday', high: 26, low: 17, rain: 10, condition: 'Mostly Sunny' }
  ],
  alerts: [],
  soilConditions: {
    moisture: 45,
    temperature: 22,
    ph: 6.8
  }
};

const mockCropInfo = {
  name: 'Maize',
  variety: 'SC 719',
  growthStage: 'Vegetative',
  healthStatus: 'Good',
  nextAction: 'Monitor soil moisture',
  daysPlanted: 45,
  expectedHarvest: '2 months',
  details: {
    height: '1.5m',
    leafColor: 'Deep Green',
    pestStatus: 'No issues detected',
    nutrientLevels: {
      nitrogen: 'Adequate',
      phosphorus: 'Optimal',
      potassium: 'Slightly low'
    }
  },
  recommendations: [
    'Apply potassium fertilizer within 3 days',
    'Monitor for fall armyworm',
    'Maintain current irrigation schedule'
  ],
  history: [
    { date: '2024-02-20', action: 'Fertilizer application', details: 'NPK 17:17:17' },
    { date: '2024-02-15', action: 'Pest inspection', details: 'No issues found' },
    { date: '2024-02-10', action: 'Irrigation', details: '25mm applied' }
  ]
};

const mockPoleData = {
  batteryLevel: 85,
  signalStrength: 'Strong',
  lastUpdate: new Date().toISOString(),
  sensors: {
    temperature: { status: 'Active', lastCalibration: '2024-02-01' },
    humidity: { status: 'Active', lastCalibration: '2024-02-01' },
    soilMoisture: { status: 'Active', lastCalibration: '2024-02-01' },
    lightIntensity: { status: 'Active', lastCalibration: '2024-02-01' }
  },
  maintenance: {
    nextCheck: '2024-03-15',
    batteryHealth: 'Good',
    solarPanel: { efficiency: '95%', lastCleaned: '2024-02-01' }
  },
  coverage: {
    radius: '50m',
    areaMonitored: '7850 sq.m',
    signalQuality: '95%'
  },
  alerts: []
};

// API functions
export const getWeatherData = async () => {
  try {
    const response = await fetch(`${HUB_BASE_URL}/weather`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return await response.json();
  } catch (error) {
    console.log('Using mock weather data due to:', error.message);
    return mockWeatherData;
  }
};

export const getCropInfo = async () => {
  try {
    const response = await fetch(`${HUB_BASE_URL}/crop-info`);
    if (!response.ok) throw new Error('Failed to fetch crop info');
    return await response.json();
  } catch (error) {
    console.log('Using mock crop info due to:', error.message);
    return mockCropInfo;
  }
};

export const getPoleData = async () => {
  try {
    const response = await fetch(`${HUB_BASE_URL}/pole-status`);
    if (!response.ok) throw new Error('Failed to fetch pole data');
    return await response.json();
  } catch (error) {
    console.log('Using mock pole data due to:', error.message);
    return mockPoleData;
  }
};

export const syncDataToCloud = async () => {
  try {
    const sensorData = await getSensorData();
    const response = await fetch(`${HUB_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sensorData),
    });
    if (!response.ok) throw new Error('Failed to sync data');
    return await response.json();
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error: error.message };
  }
};

export const syncProfileToCloud = async (profileData) => {
  try {
    const response = await fetch(`${HUB_BASE_URL}/sync-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Failed to sync profile');
    return await response.json();
  } catch (error) {
    console.error('Error syncing profile:', error);
    return null;
  }
};

// Mock data for development when hub is not available
export const getMockSensorData = () => ({
  temperature: 25.5,
  humidity: 65,
  soilMoisture: 45,
  lightIntensity: 800,
  timestamp: new Date().toISOString(),
});

export const getMockWeatherData = () => ({
  temperature: 26,
  humidity: 70,
  rainfallProbability: 20,
  windSpeed: 5,
  forecast: [
    { day: 'Today', temp: 26, rain: 20 },
    { day: 'Tomorrow', temp: 25, rain: 40 },
    { day: 'Day 3', temp: 24, rain: 60 },
  ],
}); 