import AsyncStorage from '@react-native-async-storage/async-storage';

const FARM_SETTINGS_KEY = '@farm_settings';
const CROP_TYPES_KEY = '@crop_types';
const IRRIGATION_SETTINGS_KEY = '@irrigation_settings';
const SOIL_SETTINGS_KEY = '@soil_settings';

// Default crop types
const DEFAULT_CROP_TYPES: CropType[] = [
  {
    id: '1',
    name: 'Tomato',
    variety: 'Roma',
    seasonality: ['spring', 'summer'],
    growthDuration: 90,
    waterRequirement: 'medium',
    soilPreference: ['loamy', 'well-drained'],
    optimalTemperature: {
      min: 20,
      max: 30,
    },
    optimalHumidity: {
      min: 60,
      max: 80,
    },
  },
  {
    id: '2',
    name: 'Lettuce',
    variety: 'Iceberg',
    seasonality: ['spring', 'fall'],
    growthDuration: 60,
    waterRequirement: 'high',
    soilPreference: ['rich', 'moist'],
    optimalTemperature: {
      min: 15,
      max: 25,
    },
    optimalHumidity: {
      min: 70,
      max: 85,
    },
  },
  {
    id: '3',
    name: 'Carrot',
    variety: 'Nantes',
    seasonality: ['spring', 'fall'],
    growthDuration: 75,
    waterRequirement: 'medium',
    soilPreference: ['sandy', 'loamy'],
    optimalTemperature: {
      min: 15,
      max: 25,
    },
    optimalHumidity: {
      min: 65,
      max: 75,
    },
  },
];

// Default irrigation settings
const DEFAULT_IRRIGATION_SETTINGS: IrrigationSettings = {
  autoMode: true,
  moistureThreshold: 30,
  schedules: [
    {
      id: '1',
      time: '06:00',
      duration: 30,
      zones: ['1', '2'],
      days: ['monday', 'wednesday', 'friday'],
    },
    {
      id: '2',
      time: '18:00',
      duration: 20,
      zones: ['3'],
      days: ['tuesday', 'thursday', 'saturday'],
    },
  ],
  zones: [
    {
      id: '1',
      name: 'North Field',
      description: 'Main tomato growing area',
      cropType: 'Tomato',
      area: 1000,
      flowRate: 2.5
    },
    {
      id: '2',
      name: 'East Field',
      description: 'Lettuce and leafy greens',
      cropType: 'Lettuce',
      area: 800,
      flowRate: 3.0
    },
    {
      id: '3',
      name: 'South Field',
      description: 'Root vegetables',
      cropType: 'Carrot',
      area: 1200,
      flowRate: 2.0
    },
  ],
};

export interface FarmSettings {
  size: number;
  unit: 'hectares' | 'acres';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  elevation: number;
  soilType: string;
  climateZone: string;
}

export interface CropType {
  id: string;
  name: string;
  variety: string;
  seasonality: ('spring' | 'summer' | 'fall' | 'winter')[];
  growthDuration: number;
  waterRequirement: 'low' | 'medium' | 'high';
  soilPreference: string[];
  optimalTemperature: {
    min: number;
    max: number;
  };
  optimalHumidity: {
    min: number;
    max: number;
  };
}

export interface IrrigationSettings {
  autoMode: boolean;
  moistureThreshold: number;
  schedules: Array<{
    id: string;
    time: string;
    duration: number;
    zones: string[];
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  }>;
  zones: Array<{
    id: string;
    name: string;
    description: string;
    cropType?: string;
    area?: number;
    flowRate?: number;
  }>;
}

export interface SoilSettings {
  zones: Array<{
    id: string;
    name: string;
    readings: Array<{
      timestamp: number;
      moisture: number;
      ph: number;
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      temperature: number;
    }>;
  }>;
  lastUpdate: number | null;
}

const DEFAULT_SOIL_SETTINGS: SoilSettings = {
  zones: [
    {
      id: '1',
      name: 'North Field',
      readings: [
        {
          timestamp: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
          moisture: 65,
          ph: 6.8,
          nitrogen: 75,
          phosphorus: 60,
          potassium: 80,
          temperature: 22,
        },
        {
          timestamp: Date.now(),
          moisture: 70,
          ph: 6.9,
          nitrogen: 78,
          phosphorus: 65,
          potassium: 82,
          temperature: 23,
        },
      ],
    },
    {
      id: '2',
      name: 'East Field',
      readings: [
        {
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          moisture: 72,
          ph: 7.0,
          nitrogen: 70,
          phosphorus: 55,
          potassium: 75,
          temperature: 21,
        },
        {
          timestamp: Date.now(),
          moisture: 75,
          ph: 7.1,
          nitrogen: 73,
          phosphorus: 58,
          potassium: 77,
          temperature: 22,
        },
      ],
    },
    {
      id: '3',
      name: 'South Field',
      readings: [
        {
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          moisture: 68,
          ph: 6.5,
          nitrogen: 65,
          phosphorus: 50,
          potassium: 70,
          temperature: 20,
        },
        {
          timestamp: Date.now(),
          moisture: 70,
          ph: 6.6,
          nitrogen: 68,
          phosphorus: 53,
          potassium: 72,
          temperature: 21,
        },
      ],
    },
  ],
  lastUpdate: Date.now(),
};

export async function saveFarmSettings(settings: FarmSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(FARM_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving farm settings:', error);
    throw error;
  }
}

export async function getFarmSettings(): Promise<FarmSettings | null> {
  try {
    const settings = await AsyncStorage.getItem(FARM_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting farm settings:', error);
    throw error;
  }
}

export async function saveCropTypes(types: CropType[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CROP_TYPES_KEY, JSON.stringify(types));
  } catch (error) {
    console.error('Error saving crop types:', error);
    throw error;
  }
}

export async function getCropTypes(): Promise<CropType[]> {
  try {
    const types = await AsyncStorage.getItem(CROP_TYPES_KEY);
    if (!types) {
      // Initialize with default data if none exists
      await saveCropTypes(DEFAULT_CROP_TYPES);
      return DEFAULT_CROP_TYPES;
    }
    return JSON.parse(types);
  } catch (error) {
    console.error('Error getting crop types:', error);
    throw error;
  }
}

export async function saveIrrigationSettings(settings: IrrigationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(IRRIGATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving irrigation settings:', error);
    throw error;
  }
}

export async function getIrrigationSettings(): Promise<IrrigationSettings> {
  try {
    const settings = await AsyncStorage.getItem(IRRIGATION_SETTINGS_KEY);
    if (!settings) {
      // Initialize with default data if none exists
      await saveIrrigationSettings(DEFAULT_IRRIGATION_SETTINGS);
      return DEFAULT_IRRIGATION_SETTINGS;
    }
    return JSON.parse(settings);
  } catch (error) {
    console.error('Error getting irrigation settings:', error);
    throw error;
  }
}

export async function saveSoilSettings(settings: SoilSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SOIL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving soil settings:', error);
    throw error;
  }
}

export async function getSoilSettings(): Promise<SoilSettings> {
  try {
    const settings = await AsyncStorage.getItem(SOIL_SETTINGS_KEY);
    if (!settings) {
      // Initialize with default data if none exists
      await saveSoilSettings(DEFAULT_SOIL_SETTINGS);
      return DEFAULT_SOIL_SETTINGS;
    }
    return JSON.parse(settings);
  } catch (error) {
    console.error('Error getting soil settings:', error);
    throw error;
  }
}

export function calculateOptimalIrrigationTime(
  soilMoisture: number,
  temperature: number,
  cropType: CropType,
  soilSettings: SoilSettings
): number {
  // Basic irrigation time calculation based on conditions
  const moistureDiff = soilSettings.moisture.target.max - soilMoisture;
  const tempFactor = Math.max(0, (temperature - cropType.optimalTemperature.min) / 
    (cropType.optimalTemperature.max - cropType.optimalTemperature.min));
  
  // Base time in minutes
  let irrigationTime = moistureDiff * 10; // 10 minutes per moisture percentage point needed
  
  // Adjust based on temperature
  irrigationTime *= (1 + tempFactor * 0.5); // Increase irrigation time in higher temperatures
  
  // Adjust based on crop water requirement
  const waterReqFactor = {
    low: 0.7,
    medium: 1,
    high: 1.3
  }[cropType.waterRequirement];
  
  irrigationTime *= waterReqFactor;
  
  return Math.round(Math.max(5, Math.min(60, irrigationTime))); // Limit between 5 and 60 minutes
}

export function analyzeSoilHealth(settings: SoilSettings, zoneId: string): {
  status: 'good' | 'fair' | 'poor';
  issues: string[];
  recommendations: string[];
} {
  const zone = settings.zones.find(z => z.id === zoneId);
  if (!zone || zone.readings.length === 0) {
    return {
      status: 'poor',
      issues: ['No soil data available'],
      recommendations: ['Set up soil sensors', 'Take manual readings']
    };
  }

  const latestReading = zone.readings[zone.readings.length - 1];
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check pH levels
  if (latestReading.ph < 6.0) {
    issues.push('Soil pH is too low');
    recommendations.push('Consider adding lime to increase soil pH');
  } else if (latestReading.ph > 7.5) {
    issues.push('Soil pH is too high');
    recommendations.push('Consider adding sulfur to decrease soil pH');
  }

  // Check nutrient levels
  if (latestReading.nitrogen < 50) {
    issues.push('Low nitrogen levels');
    recommendations.push('Apply nitrogen-rich fertilizer');
  }
  if (latestReading.phosphorus < 30) {
    issues.push('Low phosphorus levels');
    recommendations.push('Apply phosphate fertilizer');
  }
  if (latestReading.potassium < 30) {
    issues.push('Low potassium levels');
    recommendations.push('Apply potash fertilizer');
  }

  // Check moisture
  if (latestReading.moisture < 40) {
    issues.push('Low soil moisture');
    recommendations.push('Increase irrigation frequency');
  } else if (latestReading.moisture > 80) {
    issues.push('High soil moisture');
    recommendations.push('Reduce irrigation frequency');
  }

  // Determine overall status
  let status: 'good' | 'fair' | 'poor';
  if (issues.length === 0) {
    status = 'good';
  } else if (issues.length <= 2) {
    status = 'fair';
  } else {
    status = 'poor';
  }

  return { status, issues, recommendations };
} 