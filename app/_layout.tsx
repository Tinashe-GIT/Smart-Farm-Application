import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';
import { WebSocketProvider } from '../context/WebSocketContext';
import { AppHeader } from '../components/AppHeader';
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const { theme, isDarkMode, toggleTheme } = useThemeContext();

  return (
    <PaperProvider theme={theme}>
      <WebSocketProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: true,
              header: () => (
                <AppHeader
                  title="Smart Farm"
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                />
              ),
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              headerShown: true,
              header: () => (
                <AppHeader
                  title="Profile"
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                />
              ),
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              header: () => (
                <AppHeader
                  title="Settings"
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                />
              ),
            }}
          />
          <Stack.Screen
            name="crop-types"
            options={{
              headerShown: true,
              header: () => (
                <AppHeader
                  title="Crop Types"
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                />
              ),
            }}
          />
          <Stack.Screen
            name="irrigation-settings"
            options={{
              headerShown: true,
              header: () => (
                <AppHeader
                  title="Irrigation Settings"
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                />
              ),
            }}
          />
          <Stack.Screen
            name="soil-monitoring"
            options={{
              headerShown: true,
              header: () => (
                <AppHeader
                  title="Soil Monitoring"
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                />
              ),
            }}
          />
        </Stack>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </WebSocketProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
