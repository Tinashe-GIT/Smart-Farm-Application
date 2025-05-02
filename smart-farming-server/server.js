const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const tf = require('@tensorflow/tfjs');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Mock model for development
let model = {
  predict: (input) => {
    // Mock prediction function
    return tf.tensor([[0.8, 0.2]]); // Example: 80% healthy, 20% diseased
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', modelLoaded: true });
});

// Prediction endpoint
app.post('/predict', async (req, res) => {
  try {
    const inputData = req.body.data;
    
    if (!Array.isArray(inputData)) {
      return res.status(400).json({ error: 'Input data must be an array' });
    }

    const inputTensor = tf.tensor([inputData]);
    const prediction = model.predict(inputTensor);
    const output = await prediction.data();

    res.json({ 
      result: Array.from(output),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ 
      error: 'Prediction failed',
      details: err.message 
    });
  }
});

// Sensor data endpoint
app.post('/sensor-data', async (req, res) => {
  try {
    const sensorData = req.body;
    
    if (!sensorData || typeof sensorData !== 'object') {
      return res.status(400).json({ error: 'Invalid sensor data format' });
    }

    const processedData = {
      ...sensorData,
      processedAt: new Date().toISOString()
    };

    res.json(processedData);
  } catch (err) {
    console.error('Sensor data processing error:', err);
    res.status(500).json({ 
      error: 'Sensor data processing failed',
      details: err.message 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
}); 