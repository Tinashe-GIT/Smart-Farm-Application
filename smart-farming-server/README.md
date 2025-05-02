# Smart Farming Server

Backend server for the Smart Farming App that handles ML model predictions and sensor data processing.

## Features

- ML model integration for plant health prediction
- Sensor data processing
- RESTful API endpoints
- CORS enabled for mobile app access
- Health check endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Place your ML model in the `model/` directory:
```
model/
├── model.json
└── group1-shard1of1.bin
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /health`
  - Returns server status and model loading status

### Prediction
- `POST /predict`
  - Accepts sensor data array
  - Returns prediction results
  - Example request:
    ```json
    {
      "data": [22, 60, 45, 75]  // temperature, humidity, soil moisture, light intensity
    }
    ```

### Sensor Data
- `POST /sensor-data`
  - Accepts sensor data object
  - Returns processed sensor data with timestamp
  - Example request:
    ```json
    {
      "temperature": 22,
      "humidity": 60,
      "soilMoisture": 45,
      "lightIntensity": 75
    }
    ```

## Development

- The server runs on port 3001 by default
- CORS is enabled for all origins
- A mock model is used if the real model fails to load
- Error handling is implemented for all endpoints

## Integration with Mobile App

1. Update the mobile app's API base URL to your PC's IP address:
```javascript
const API_BASE_URL = 'http://<YOUR_PC_IP>:3001';
```

2. Make sure your PC and mobile device are on the same network

## Error Handling

All endpoints include proper error handling and return appropriate HTTP status codes:
- 400: Bad Request
- 500: Server Error

Error responses include a message and details when available. 