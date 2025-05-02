// Simulate sensor data updates
function generateRandomData() {
  return {
    soil: {
      moisture: Math.floor(60 + Math.random() * 20), // 60-80%
      temperature: Math.floor(20 + Math.random() * 5), // 20-25°C
      ph: 6.5 + Math.random(), // 6.5-7.5
      nitrogen: Math.floor(70 + Math.random() * 20), // 70-90%
      phosphorus: Math.floor(60 + Math.random() * 20), // 60-80%
      potassium: Math.floor(75 + Math.random() * 15), // 75-90%
    },
    weather: {
      temperature: Math.floor(22 + Math.random() * 8), // 22-30°C
      humidity: Math.floor(60 + Math.random() * 20), // 60-80%
      pressure: Math.floor(1010 + Math.random() * 10), // 1010-1020 hPa
      rainfall: Math.random() < 0.3 ? Math.random() * 5 : 0, // 30% chance of rain
    },
    irrigation: {
      status: Math.random() < 0.3 ? 'on' : 'off', // 30% chance of being on
      lastWatered: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Within last 24h
      nextScheduled: new Date(Date.now() + Math.random() * 86400000).toISOString(), // Within next 24h
    },
  };
}

// Export the simulator function
module.exports = function startSimulator(updateCallback, interval = 5000) {
  console.log('Starting sensor data simulator...');
  
  // Initial data
  updateCallback(generateRandomData());
  
  // Update data periodically
  const timer = setInterval(() => {
    updateCallback(generateRandomData());
  }, interval);

  return () => {
    clearInterval(timer);
    console.log('Simulator stopped');
  };
}; 