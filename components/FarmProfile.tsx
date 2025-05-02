import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import wsClient from '../utils/websocket';

interface FarmProfile {
  fullName: string;
  farmSize: number;
  region: string;
  sensorPoles: number;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

const FarmProfile: React.FC = () => {
  const [profile, setProfile] = useState<FarmProfile>({
    fullName: '',
    farmSize: 0,
    region: '',
    sensorPoles: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Load profile data from localStorage on component mount
    const savedProfile = localStorage.getItem('farmProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }

    // Listen for profile updates from server
    const handleMessage = (data: any) => {
      if (data.type === 'profile_update' && data.data) {
        setProfile(data.data);
        localStorage.setItem('farmProfile', JSON.stringify(data.data));
      }
    };

    wsClient.on('message', handleMessage);

    return () => {
      wsClient.removeListener('message', handleMessage);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'farmSize' || name === 'sensorPoles' ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    try {
      if (!formRef.current?.checkValidity()) {
        formRef.current?.reportValidity();
        return;
      }

      // Save to localStorage
      localStorage.setItem('farmProfile', JSON.stringify(profile));
      
      // Send to server
      wsClient.send({
        type: 'update_profile',
        data: profile,
      });

      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving profile. Please try again.' });
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Farm Profile
        </Typography>

        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <form ref={formRef} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                required
                fullWidth
                label="Full Name"
                name="fullName"
                value={profile.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                margin="normal"
                inputProps={{ 'aria-label': 'Full Name' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                required
                fullWidth
                label="Farm Size (hectares)"
                name="farmSize"
                type="number"
                value={profile.farmSize}
                onChange={handleInputChange}
                disabled={!isEditing}
                margin="normal"
                inputProps={{ 
                  'aria-label': 'Farm Size',
                  min: 0,
                  step: 0.1
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                required
                fullWidth
                label="Region"
                name="region"
                value={profile.region}
                onChange={handleInputChange}
                disabled={!isEditing}
                margin="normal"
                inputProps={{ 'aria-label': 'Region' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                required
                fullWidth
                label="Number of Sensor Poles"
                name="sensorPoles"
                type="number"
                value={profile.sensorPoles}
                onChange={handleInputChange}
                disabled={!isEditing}
                margin="normal"
                inputProps={{ 
                  'aria-label': 'Number of Sensor Poles',
                  min: 0,
                  step: 1
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {isEditing ? (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setIsEditing(false);
                    // Reset to saved values
                    const savedProfile = localStorage.getItem('farmProfile');
                    if (savedProfile) {
                      try {
                        setProfile(JSON.parse(savedProfile));
                      } catch (error) {
                        console.error('Error parsing saved profile:', error);
                      }
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSave}
                  type="submit"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default FarmProfile; 