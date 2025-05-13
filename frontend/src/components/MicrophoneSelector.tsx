import React, { useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Select,
  Text,
  VStack,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';

/**
 * Component for selecting microphone input device
 */
const MicrophoneSelector: React.FC = () => {
  const { 
    selectedMicrophone, 
    setSelectedMicrophone, 
    availableMicrophones, 
    setAvailableMicrophones 
  } = useApp();
  const toast = useToast();

  // Load available microphones on component mount
  useEffect(() => {
    loadMicrophones();
  }, []);

  // Function to load available microphones
  const loadMicrophones = async (): Promise<void> => {
    try {
      // Request permission to access media devices
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get list of available microphones
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter(device => device.kind === 'audioinput');
      
      setAvailableMicrophones(mics);
      
      // Select the default microphone if none is selected
      if (!selectedMicrophone && mics.length > 0) {
        setSelectedMicrophone(mics[0]);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Error',
        description: 'Could not access your microphone. Please check permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle microphone selection change
  const handleMicrophoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    const selectedDevice = availableMicrophones.find(mic => mic.deviceId === deviceId);
    if (selectedDevice) {
      setSelectedMicrophone(selectedDevice);
    }
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
      <VStack spacing={4} align="stretch">
        <Text fontSize="md" fontWeight="medium">
          Audio Source
        </Text>
        
        <FormControl>
          <FormLabel htmlFor="microphone" fontSize="sm">Select your microphone:</FormLabel>
          <Select
            id="microphone"
            value={selectedMicrophone?.deviceId || ''}
            onChange={handleMicrophoneChange}
            placeholder="Select microphone"
          >
            {availableMicrophones.map(mic => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Microphone ${mic.deviceId.substring(0, 5)}...`}
              </option>
            ))}
          </Select>
        </FormControl>
        
        <Button size="sm" onClick={loadMicrophones} variant="outline">
          Refresh Microphone List
        </Button>
      </VStack>
    </Box>
  );
};

export default MicrophoneSelector; 