import React, { createContext, useContext, useEffect, useState } from 'react';
import wsClient from '../utils/websocket';

interface SensorData {
  soil: {
    moisture: number;
    temperature: number;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    pressure: number;
    rainfall: number;
  };
  irrigation: {
    status: 'on' | 'off';
    lastWatered: string | null;
    nextScheduled: string | null;
  };
}

interface WebSocketContextType {
  isConnected: boolean;
  sensorData: SensorData | null;
  sendMessage: (data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  sensorData: null,
  sendMessage: () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    wsClient.connect();

    // Handle connection status
    wsClient.on('connected', () => {
      setIsConnected(true);
    });

    wsClient.on('disconnected', () => {
      setIsConnected(false);
    });

    // Handle incoming messages
    wsClient.on('message', (data) => {
      if (data.type === 'initial' || data.type === 'update') {
        setSensorData(data.data);
      }
    });

    // Cleanup on unmount
    return () => {
      wsClient.disconnect();
    };
  }, []);

  const sendMessage = (data: any) => {
    wsClient.send(data);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, sensorData, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
} 