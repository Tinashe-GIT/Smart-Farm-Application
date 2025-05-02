// API Configuration
export const API_BASE_URL = 'http://localhost:3001'; // Change this to your PC's IP address when testing on device

// API Endpoints
export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  predict: `${API_BASE_URL}/predict`,
  sensorData: `${API_BASE_URL}/sensor-data`,
};

// API Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 