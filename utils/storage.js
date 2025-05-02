import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  FARM_DATA: '@farm_data',
  SENSOR_DATA: '@sensor_data',
};

const PROFILE_KEY = '@user_profile';

export const saveUserProfile = async (profileData) => {
  try {
    console.log('Starting profile save with data:', profileData);

    // Validate required fields
    const requiredFields = ['fullName', 'farmSize', 'region', 'numberOfPoles', 'cropType', 'farmingType'];
    const missingFields = requiredFields.filter(field => !profileData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return false;
    }

    // Validate numeric fields
    if (isNaN(Number(profileData.farmSize)) || Number(profileData.farmSize) <= 0) {
      console.error('Invalid farm size:', profileData.farmSize);
      return false;
    }

    if (isNaN(Number(profileData.numberOfPoles)) || Number(profileData.numberOfPoles) <= 0) {
      console.error('Invalid number of poles:', profileData.numberOfPoles);
      return false;
    }

    // Prepare data for storage
    const profileToSave = {
      ...profileData,
      farmSize: Number(profileData.farmSize),
      numberOfPoles: Number(profileData.numberOfPoles),
      createdAt: new Date().toISOString(),
    };

    console.log('Saving profile data:', profileToSave);

    // Save to AsyncStorage
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profileToSave));
    
    // Verify the save
    const savedData = await AsyncStorage.getItem(PROFILE_KEY);
    if (!savedData) {
      console.error('Failed to verify saved data');
      return false;
    }

    console.log('Profile saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

export const getUserProfile = async () => {
  try {
    const profileData = await AsyncStorage.getItem(PROFILE_KEY);
    if (!profileData) {
      console.log('No profile found in storage');
      return null;
    }
    
    const parsedProfile = JSON.parse(profileData);
    console.log('Retrieved profile:', parsedProfile);
    return parsedProfile;
  } catch (error) {
    console.error('Error retrieving profile:', error);
    return null;
  }
};

export const clearUserProfile = async () => {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
    console.log('Profile cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing profile:', error);
    return false;
  }
};

export const updateUserProfile = async (updates) => {
  try {
    const currentProfile = await getUserProfile();
    if (!currentProfile) {
      console.error('No existing profile to update');
      return false;
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
    };

    return await saveUserProfile(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};

export const saveFarmData = async (farmData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FARM_DATA, JSON.stringify(farmData));
    return true;
  } catch (error) {
    console.error('Error saving farm data:', error);
    return false;
  }
};

export const getFarmData = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FARM_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting farm data:', error);
    return null;
  }
};

export const saveSensorData = async (sensorData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SENSOR_DATA, JSON.stringify(sensorData));
    return true;
  } catch (error) {
    console.error('Error saving sensor data:', error);
    return false;
  }
};

export const getSensorData = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SENSOR_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting sensor data:', error);
    return null;
  }
}; 