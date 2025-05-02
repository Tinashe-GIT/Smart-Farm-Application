# Smart Farming App

A real-time monitoring and control system for smart farming applications. This application provides a modern web interface for monitoring soil conditions, weather data, and controlling irrigation systems.

## Features

- Real-time sensor data monitoring
- Soil condition tracking (moisture, temperature, pH, NPK levels)
- Weather monitoring (temperature, humidity, pressure, rainfall)
- Automated irrigation control
- Responsive web interface
- Data simulation for testing

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd smart-farming-app
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../app
   npm install
   ```

## Configuration

1. Start the server first to get available IP addresses:
   ```bash
   cd server
   node index.js
   ```

2. Note the IP address displayed in the console.

3. Update the WebSocket connection URL in `app/config.ts` with your server's IP address.

## Running the Application

1. Start the server:
   ```bash
   cd server
   node index.js
   ```

2. In a new terminal, start the client application:
   ```bash
   cd app
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:3000)

## Development

- The server uses a simulator to generate realistic sensor data
- WebSocket is used for real-time communication
- The client is built with Next.js and Tailwind CSS
- Material-UI components are used for the interface

## Project Structure

```
smart-farming-app/
├── app/                # Next.js client application
│   ├── components/     # React components
│   ├── pages/         # Next.js pages
│   └── config.ts      # Configuration file
├── server/            # Backend server
│   ├── index.js       # Main server file
│   └── simulator.js   # Data simulator
└── README.md
```

## License

MIT License
