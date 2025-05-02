const WebSocket = require('ws');
const express = require('express');
const startSimulator = require('./simulator');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Store the latest sensor data
let sensorData = {
  soil: {
    moisture: 0,
    temperature: 0,
    ph: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0
  },
  weather: {
    temperature: 0,
    humidity: 0,
    pressure: 0,
    rainfall: 0
  },
  irrigation: {
    status: 'off',
    lastWatered: null,
    nextScheduled: null
  }
};

// Store farm profile
let farmProfile = {
  fullName: '',
  farmSize: 0,
  region: '',
  sensorPoles: 0
};

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`New client connected from ${ip}`);
  clients.add(ws);

  // Send current data to newly connected client
  ws.send(JSON.stringify({
    type: 'initial',
    data: {
      sensorData,
      farmProfile
    }
  }));

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message from ${ip}:`, data.type);
      
      // Handle different types of messages
      switch (data.type) {
        case 'update_sensor':
          updateSensorData(data.data);
          break;
        case 'control_irrigation':
          handleIrrigationControl(data.data);
          break;
        case 'update_profile':
          handleProfileUpdate(data.data);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
      
      // Broadcast the update to all connected clients
      broadcastData(data);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log(`Client disconnected: ${ip}`);
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error from ${ip}:`, error);
  });
});

// Update sensor data
function updateSensorData(data) {
  sensorData = {
    ...sensorData,
    ...data
  };
  console.log('Sensor data updated:', sensorData);
}

// Handle irrigation control commands
function handleIrrigationControl(data) {
  sensorData.irrigation = {
    ...sensorData.irrigation,
    ...data
  };
  console.log('Irrigation settings updated:', sensorData.irrigation);
}

// Handle farm profile updates
function handleProfileUpdate(data) {
  farmProfile = {
    ...farmProfile,
    ...data
  };
  console.log('Farm profile updated:', farmProfile);
}

// Broadcast data to all connected clients
function broadcastData(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// REST API endpoints for manual data input
app.use(express.json());

// Get current sensor data
app.get('/api/data', (req, res) => {
  res.json(sensorData);
});

// Update sensor data via HTTP
app.post('/api/data', (req, res) => {
  const data = req.body;
  updateSensorData(data);
  broadcastData({
    type: 'update',
    data: sensorData
  });
  res.json({ success: true });
});

// Get farm profile
app.get('/api/profile', (req, res) => {
  res.json(farmProfile);
});

// Update farm profile via HTTP
app.post('/api/profile', (req, res) => {
  const data = req.body;
  handleProfileUpdate(data);
  broadcastData({
    type: 'profile_update',
    data: farmProfile
  });
  res.json({ success: true });
});

// Start the simulator
const stopSimulator = startSimulator((data) => {
  updateSensorData(data);
  broadcastData({
    type: 'update',
    data: sensorData
  });
}, 5000); // Update every 5 seconds

// Get server's IP addresses
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const results = {};

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === 'IPv4' && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

// Start the server
const PORT = process.env.PORT || 8082;
server.listen(PORT, () => {
  console.log(`\nServer is running on port ${PORT}`);
  console.log('\nAvailable IP addresses:');
  for (const [name, addresses] of Object.entries(results)) {
    console.log(`${name}: ${addresses.join(', ')}`);
  }
  console.log('\nUse one of these IP addresses in your app\'s config.ts file');
}); 