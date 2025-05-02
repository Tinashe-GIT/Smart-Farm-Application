import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { 
  List, 
  FAB, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  Text,
  Chip,
  SegmentedButtons,
  useTheme,
  IconButton,
  Card,
  ActivityIndicator
} from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { CropType, saveCropTypes, getCropTypes } from '../utils/farmSettings';
import { useRouter } from 'expo-router';

export default function CropTypesScreen() {
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    seasonality: [] as ('spring' | 'summer' | 'fall' | 'winter')[],
    growthDuration: '',
    waterRequirement: 'medium' as 'low' | 'medium' | 'high',
    soilPreference: [] as string[],
    optimalTemperature: {
      min: '',
      max: '',
    },
    optimalHumidity: {
      min: '',
      max: '',
    },
  });

  useEffect(() => {
    loadCropTypes();
  }, []);

  const loadCropTypes = async () => {
    try {
      console.log('Loading crop types...');
      const types = await getCropTypes();
      console.log('Loaded crop types:', types);
      setCropTypes(types);
    } catch (error) {
      console.error('Error loading crop types:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const handleAddCrop = async () => {
    try {
      const newCrop: CropType = {
        id: Date.now().toString(),
        name: formData.name,
        variety: formData.variety,
        seasonality: formData.seasonality,
        growthDuration: parseInt(formData.growthDuration),
        waterRequirement: formData.waterRequirement,
        soilPreference: formData.soilPreference,
        optimalTemperature: {
          min: parseInt(formData.optimalTemperature.min),
          max: parseInt(formData.optimalTemperature.max),
        },
        optimalHumidity: {
          min: parseInt(formData.optimalHumidity.min),
          max: parseInt(formData.optimalHumidity.max),
        },
      };

      const updatedTypes = [...cropTypes, newCrop];
      await saveCropTypes(updatedTypes);
      setCropTypes(updatedTypes);
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error adding crop type:', error);
    }
  };

  const handleEditCrop = async () => {
    if (!selectedCrop) return;

    try {
      const updatedCrop: CropType = {
        ...selectedCrop,
        name: formData.name,
        variety: formData.variety,
        seasonality: formData.seasonality,
        growthDuration: parseInt(formData.growthDuration),
        waterRequirement: formData.waterRequirement,
        soilPreference: formData.soilPreference,
        optimalTemperature: {
          min: parseInt(formData.optimalTemperature.min),
          max: parseInt(formData.optimalTemperature.max),
        },
        optimalHumidity: {
          min: parseInt(formData.optimalHumidity.min),
          max: parseInt(formData.optimalHumidity.max),
        },
      };

      const updatedTypes = cropTypes.map(crop => 
        crop.id === selectedCrop.id ? updatedCrop : crop
      );
      await saveCropTypes(updatedTypes);
      setCropTypes(updatedTypes);
      setShowEditDialog(false);
      setSelectedCrop(null);
      resetForm();
    } catch (error) {
      console.error('Error updating crop type:', error);
    }
  };

  const handleDeleteCrop = async (id: string) => {
    try {
      const updatedTypes = cropTypes.filter(crop => crop.id !== id);
      await saveCropTypes(updatedTypes);
      setCropTypes(updatedTypes);
    } catch (error) {
      console.error('Error deleting crop type:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      variety: '',
      seasonality: [],
      growthDuration: '',
      waterRequirement: 'medium',
      soilPreference: [],
      optimalTemperature: {
        min: '',
        max: '',
      },
      optimalHumidity: {
        min: '',
        max: '',
      },
    });
  };

  const startEdit = (crop: CropType) => {
    setSelectedCrop(crop);
    setFormData({
      name: crop.name,
      variety: crop.variety,
      seasonality: crop.seasonality,
      growthDuration: crop.growthDuration.toString(),
      waterRequirement: crop.waterRequirement,
      soilPreference: crop.soilPreference,
      optimalTemperature: {
        min: crop.optimalTemperature.min.toString(),
        max: crop.optimalTemperature.max.toString(),
      },
      optimalHumidity: {
        min: crop.optimalHumidity.min.toString(),
        max: crop.optimalHumidity.max.toString(),
      },
    });
    setShowEditDialog(true);
  };

  const renderDialog = (isEdit: boolean) => (
    <Dialog
      visible={isEdit ? showEditDialog : showAddDialog}
      onDismiss={() => {
        isEdit ? setShowEditDialog(false) : setShowAddDialog(false);
        resetForm();
      }}
    >
      <Dialog.Title>{isEdit ? 'Edit Crop Type' : 'Add New Crop Type'}</Dialog.Title>
      <Dialog.Content>
        <ScrollView style={styles.dialogScroll}>
          <TextInput
            label="Crop Name"
            value={formData.name}
            onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Variety"
            value={formData.variety}
            onChangeText={text => setFormData(prev => ({ ...prev, variety: text }))}
            mode="outlined"
            style={styles.input}
          />
          
          <Text variant="labelLarge" style={styles.sectionTitle}>Seasonality</Text>
          <View style={styles.chipGroup}>
            {(['spring', 'summer', 'fall', 'winter'] as const).map(season => (
              <Chip
                key={season}
                selected={formData.seasonality.includes(season)}
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    seasonality: prev.seasonality.includes(season)
                      ? prev.seasonality.filter(s => s !== season)
                      : [...prev.seasonality, season]
                  }));
                }}
                style={styles.chip}
              >
                {season}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Growth Duration (days)"
            value={formData.growthDuration}
            onChangeText={text => setFormData(prev => ({ ...prev, growthDuration: text }))}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text variant="labelLarge" style={styles.sectionTitle}>Water Requirement</Text>
          <SegmentedButtons
            value={formData.waterRequirement}
            onValueChange={value => 
              setFormData(prev => ({ 
                ...prev, 
                waterRequirement: value as 'low' | 'medium' | 'high' 
              }))
            }
            buttons={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            style={styles.segmentedButtons}
          />

          <Text variant="labelLarge" style={styles.sectionTitle}>Optimal Temperature (°C)</Text>
          <View style={styles.row}>
            <TextInput
              label="Min"
              value={formData.optimalTemperature.min}
              onChangeText={text => 
                setFormData(prev => ({
                  ...prev,
                  optimalTemperature: { ...prev.optimalTemperature, min: text }
                }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Max"
              value={formData.optimalTemperature.max}
              onChangeText={text => 
                setFormData(prev => ({
                  ...prev,
                  optimalTemperature: { ...prev.optimalTemperature, max: text }
                }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <Text variant="labelLarge" style={styles.sectionTitle}>Optimal Humidity (%)</Text>
          <View style={styles.row}>
            <TextInput
              label="Min"
              value={formData.optimalHumidity.min}
              onChangeText={text => 
                setFormData(prev => ({
                  ...prev,
                  optimalHumidity: { ...prev.optimalHumidity, min: text }
                }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Max"
              value={formData.optimalHumidity.max}
              onChangeText={text => 
                setFormData(prev => ({
                  ...prev,
                  optimalHumidity: { ...prev.optimalHumidity, max: text }
                }))
              }
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
          </View>
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => {
          isEdit ? setShowEditDialog(false) : setShowAddDialog(false);
          resetForm();
        }}>Cancel</Button>
        <Button onPress={isEdit ? handleEditCrop : handleAddCrop}>
          {isEdit ? 'Save Changes' : 'Add Crop'}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {cropTypes.map(crop => (
          <Card key={crop.id} style={styles.card}>
            <Card.Title
              title={crop.name}
              subtitle={crop.variety}
              right={props => (
                <View style={styles.cardActions}>
                  <IconButton
                    icon="pencil"
                    onPress={() => startEdit(crop)}
                  />
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => handleDeleteCrop(crop.id)}
                  />
                </View>
              )}
            />
            <Card.Content>
              <View style={styles.chipGroup}>
                {crop.seasonality.map(season => (
                  <Chip key={season} style={styles.chip}>{season}</Chip>
                ))}
              </View>
              <Text>Growth Duration: {crop.growthDuration} days</Text>
              <Text>Water Requirement: {crop.waterRequirement}</Text>
              <Text>Temperature: {crop.optimalTemperature.min}°C - {crop.optimalTemperature.max}°C</Text>
              <Text>Humidity: {crop.optimalHumidity.min}% - {crop.optimalHumidity.max}%</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        {renderDialog(false)} {/* Add Dialog */}
        {renderDialog(true)}  {/* Edit Dialog */}
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddDialog(true)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 8,
  },
  cardActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialogScroll: {
    maxHeight: 400,
  },
  input: {
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  chip: {
    margin: 4,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 