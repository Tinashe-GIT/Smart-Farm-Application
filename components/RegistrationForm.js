import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Menu, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { saveUserProfile } from '../utils/storage';

const CROP_TYPES = [
  'Maize',
  'Wheat',
  'Soybeans',
  'Cotton',
  'Tobacco',
  'Vegetables',
  'Other',
];

const FARMING_TYPES = [
  'Commercial',
  'Subsistence',
  'Organic',
  'Mixed',
];

const RegistrationForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    farmSize: '',
    region: '',
    numberOfPoles: '',
    cropType: '',
    farmingType: '',
  });

  const [errors, setErrors] = useState({});
  const [cropMenuVisible, setCropMenuVisible] = useState(false);
  const [farmingMenuVisible, setFarmingMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Debug log when formData changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.farmSize) newErrors.farmSize = 'Farm size is required';
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.numberOfPoles) newErrors.numberOfPoles = 'Number of poles is required';
    if (!formData.cropType) newErrors.cropType = 'Crop type is required';
    if (!formData.farmingType) {
      newErrors.farmingType = 'Farming type is required';
      console.log('Farming type validation failed - current value:', formData.farmingType);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);
      
      console.log('Starting form submission with data:', formData);
      
      if (!validateForm()) {
        console.log('Form validation failed with errors:', errors);
        setSubmitError('Please fill in all required fields');
        return;
      }

      console.log('Form validation passed, saving profile...');
      const success = await saveUserProfile(formData);
      console.log('Profile save result:', success);
      
      if (success) {
        console.log('Profile saved successfully, calling onComplete...');
        if (onComplete) {
          onComplete(formData);
        }
      } else {
        console.error('Failed to save profile');
        setSubmitError('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setSubmitError('An error occurred while saving your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMenuPress = (type, event) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuAnchor({ x: pageX, y: pageY });
    if (type === 'crop') {
      setCropMenuVisible(true);
    } else if (type === 'farming') {
      setFarmingMenuVisible(true);
    }
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Farm Profile</ThemedText>

        {submitError && (
          <ThemedText style={styles.errorText}>{submitError}</ThemedText>
        )}

        <TextInput
          label="Full Name"
          value={formData.fullName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
          style={styles.input}
          error={!!errors.fullName}
          disabled={isSubmitting}
        />
        {errors.fullName && (
          <ThemedText style={styles.errorText}>{errors.fullName}</ThemedText>
        )}

        <TextInput
          label="Farm Size (hectares)"
          value={formData.farmSize}
          onChangeText={(text) => setFormData(prev => ({ ...prev, farmSize: text }))}
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.farmSize}
          disabled={isSubmitting}
        />
        {errors.farmSize && (
          <ThemedText style={styles.errorText}>{errors.farmSize}</ThemedText>
        )}

        <TextInput
          label="Region"
          value={formData.region}
          onChangeText={(text) => setFormData(prev => ({ ...prev, region: text }))}
          style={styles.input}
          error={!!errors.region}
          disabled={isSubmitting}
        />
        {errors.region && (
          <ThemedText style={styles.errorText}>{errors.region}</ThemedText>
        )}

        <TextInput
          label="Number of Sensor Poles"
          value={formData.numberOfPoles}
          onChangeText={(text) => setFormData(prev => ({ ...prev, numberOfPoles: text }))}
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.numberOfPoles}
          disabled={isSubmitting}
        />
        {errors.numberOfPoles && (
          <ThemedText style={styles.errorText}>{errors.numberOfPoles}</ThemedText>
        )}

        <View style={styles.menuContainer}>
          <Button
            mode="outlined"
            onPress={(e) => handleMenuPress('crop', e)}
            style={styles.menuButton}
            error={!!errors.cropType}
            disabled={isSubmitting}
          >
            {formData.cropType || 'Select Crop Type'}
          </Button>
          {errors.cropType && (
            <ThemedText style={styles.errorText}>{errors.cropType}</ThemedText>
          )}
        </View>

        <View style={styles.menuContainer}>
          <Button
            mode="outlined"
            onPress={(e) => handleMenuPress('farming', e)}
            style={styles.menuButton}
            error={!!errors.farmingType}
            disabled={isSubmitting}
          >
            {formData.farmingType || 'Select Farming Type'}
          </Button>
          {errors.farmingType && (
            <ThemedText style={styles.errorText}>{errors.farmingType}</ThemedText>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            'Save Profile'
          )}
        </Button>

        <Portal>
          <Modal
            visible={cropMenuVisible}
            onDismiss={() => setCropMenuVisible(false)}
            contentContainerStyle={[styles.modal, { top: menuAnchor.y }]}
          >
            <ScrollView>
              {CROP_TYPES.map((crop) => (
                <Button
                  key={crop}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, cropType: crop }));
                    setCropMenuVisible(false);
                  }}
                  style={styles.menuItem}
                >
                  {crop}
                </Button>
              ))}
            </ScrollView>
          </Modal>

          <Modal
            visible={farmingMenuVisible}
            onDismiss={() => setFarmingMenuVisible(false)}
            contentContainerStyle={[styles.modal, { top: menuAnchor.y }]}
          >
            <ScrollView>
              {FARMING_TYPES.map((type) => (
                <Button
                  key={type}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, farmingType: type }));
                    setFarmingMenuVisible(false);
                  }}
                  style={styles.menuItem}
                >
                  {type}
                </Button>
              ))}
            </ScrollView>
          </Modal>
        </Portal>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    padding: 8,
  },
  menuContainer: {
    marginBottom: 16,
  },
  menuButton: {
    marginBottom: 4,
  },
  modal: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    maxHeight: 300,
  },
  menuItem: {
    marginVertical: 4,
  },
});

export default RegistrationForm; 