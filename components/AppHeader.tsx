import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Menu, useTheme, Switch, Divider, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface AppHeaderProps {
  title: string;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export function AppHeader({ title, onToggleTheme, isDarkMode }: AppHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleBack = () => {
    router.back();
  };

  const navigateToProfile = () => {
    closeMenu();
    router.push({
      pathname: '/profile' as any,
    });
  };

  const navigateToSettings = () => {
    closeMenu();
    router.push({
      pathname: '/settings' as any,
    });
  };

  const navigateToCropTypes = () => {
    closeMenu();
    router.push({
      pathname: '/crop-types' as any,
    });
  };

  const navigateToIrrigationSettings = () => {
    closeMenu();
    router.push({
      pathname: '/irrigation-settings' as any,
    });
  };

  const navigateToSoilMonitoring = () => {
    closeMenu();
    router.push({
      pathname: '/soil-monitoring' as any,
    });
  };

  return (
    <Appbar.Header style={styles.header} mode="center-aligned">
      {pathname !== '/' && (
        <Appbar.BackAction onPress={handleBack} />
      )}
      <Appbar.Content title={title} />
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <Appbar.Action icon="menu" onPress={openMenu} />
        }
        anchorPosition="bottom"
        contentStyle={styles.menuContent}
      >
        {/* User Section */}
        <View style={styles.menuSection}>
          <Text variant="labelLarge" style={styles.menuSectionTitle}>USER</Text>
          <Menu.Item
            leadingIcon="account"
            onPress={navigateToProfile}
            title="Profile"
          />
          <Menu.Item
            leadingIcon="cog"
            onPress={navigateToSettings}
            title="Settings"
          />
        </View>

        <Divider bold />

        {/* Farm Management */}
        <View style={styles.menuSection}>
          <Text variant="labelLarge" style={styles.menuSectionTitle}>FARM MANAGEMENT</Text>
          <Menu.Item
            leadingIcon="sprout"
            onPress={navigateToCropTypes}
            title="Crop Types"
          />
          <Menu.Item
            leadingIcon="water"
            onPress={navigateToIrrigationSettings}
            title="Irrigation"
          />
          <Menu.Item
            leadingIcon="chart-bubble"
            onPress={navigateToSoilMonitoring}
            title="Soil Monitoring"
          />
          <Menu.Item
            leadingIcon="map-marker"
            onPress={closeMenu}
            title="Field Mapping"
          />
          <Menu.Item
            leadingIcon="calendar"
            onPress={closeMenu}
            title="Crop Calendar"
          />
          <Menu.Item
            leadingIcon="chart-line"
            onPress={closeMenu}
            title="Analytics"
          />
          <Menu.Item
            leadingIcon="file-document"
            onPress={closeMenu}
            title="Reports"
          />
        </View>

        <Divider bold />

        {/* System */}
        <View style={styles.menuSection}>
          <Text variant="labelLarge" style={styles.menuSectionTitle}>SYSTEM</Text>
          <Menu.Item
            leadingIcon={isDarkMode ? "weather-night" : "weather-sunny"}
            onPress={onToggleTheme}
            title={`${isDarkMode ? 'Light' : 'Dark'} Mode`}
            trailingIcon={() => (
              <Switch value={isDarkMode} onValueChange={onToggleTheme} />
            )}
          />
          <Menu.Item
            leadingIcon="sync"
            onPress={closeMenu}
            title="Sync Data"
            trailingIcon={() => (
              <Text variant="labelSmall" style={styles.lastSynced}>
                2m ago
              </Text>
            )}
          />
          <Menu.Item
            leadingIcon="wifi"
            onPress={closeMenu}
            title="Connection"
            trailingIcon={() => (
              <MaterialCommunityIcons 
                name="signal-4g" 
                size={20} 
                color={theme.colors.primary} 
              />
            )}
          />
        </View>

        <Divider bold />

        {/* Help & Support */}
        <View style={styles.menuSection}>
          <Text variant="labelLarge" style={styles.menuSectionTitle}>HELP & SUPPORT</Text>
          <Menu.Item
            leadingIcon="help-circle"
            onPress={closeMenu}
            title="Help Center"
          />
          <Menu.Item
            leadingIcon="message"
            onPress={closeMenu}
            title="Contact Support"
          />
          <Menu.Item
            leadingIcon="information"
            onPress={closeMenu}
            title="About"
          />
        </View>
      </Menu>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    elevation: 4,
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuSection: {
    paddingVertical: 4,
  },
  menuSectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.7,
  },
  lastSynced: {
    opacity: 0.6,
  },
}); 