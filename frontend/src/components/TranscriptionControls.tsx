import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { RealtimeTranscriptionService } from '../services/webrtc/index';
import { useApp } from '../contexts/AppContext';

/**
 * Component for controlling the transcription process
 */
const TranscriptionControls: React.FC = () => {
  const {
    apiKey,
    isTranscribing,
    setIsTranscribing,
    selectedMicrophone,
    setTranscript,
    setError,
  } = useApp();
  const [status, setStatus] = useState<string>('idle');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Initialize the transcription service
  const transcriptionService = React.useRef<RealtimeTranscriptionService>(
    new RealtimeTranscriptionService()
  );

  /**
   * Start transcription using the provided API key and microphone
   */
  const handleStartTranscription = async () => {
    // Check if we have an API key
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your OpenAI API key above.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Check if we have a microphone selected
    if (!selectedMicrophone) {
      toast({
        title: 'Microphone Required',
        description: 'Please select a microphone.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setStatus('connecting');
      setError(null);
      setIsTranscribing(true);
      setTranscript('');

      // Start the transcription
      await transcriptionService.current.startTranscription(apiKey, {
        selectedMicrophoneId: selectedMicrophone.deviceId,
        onTranscription: (text, isFinal) => {
          console.log('Transcription update:', text, isFinal);
          
          if (isFinal) {
            // If it's a final transcript, replace the current one
            setTranscript(text);
          } else {
            // For partial transcripts, append to the current text
            setTranscript(prev => {
              const prevText: string = prev;
              // Add a space if needed
              return prevText + (prevText && !prevText.endsWith(' ') ? ' ' : '') + text;
            });
          }
        },
        onError: (error) => {
          setError(error.message);
          toast({
            title: 'Transcription Error',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          handleStopTranscription();
        },
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
        },
      });

      toast({
        title: 'Transcription Started',
        description: 'Speak into your microphone to see the transcription.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      setIsTranscribing(false);
      setStatus('idle');
      setError(error.message);
      toast({
        title: 'Failed to Start Transcription',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle stopping transcription
  const handleStopTranscription = () => {
    transcriptionService.current.stopTranscription();
    setIsTranscribing(false);
    setStatus('idle');
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
      <Flex direction="column" gap={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="md" fontWeight="medium">
            Transcription Controls
          </Text>
          <Text fontSize="sm" color={status === 'connected' ? 'green.500' : status === 'connecting' ? 'orange.500' : 'gray.500'}>
            Status: {status === 'idle' ? 'Ready' : status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Error'}
          </Text>
        </Flex>

        <HStack spacing={4} justify="center">
          {!isTranscribing ? (
            <Button
              colorScheme="green"
              onClick={handleStartTranscription}
              isLoading={status === 'connecting'}
              loadingText="Connecting..."
              width="150px"
            >
              Start Transcription
            </Button>
          ) : (
            <Button
              colorScheme="red"
              onClick={() => setIsAlertOpen(true)}
              width="150px"
            >
              Stop Transcription
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Confirmation Dialog for Stopping */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Stop Transcription
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to stop the transcription? The current session will end.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  handleStopTranscription();
                  setIsAlertOpen(false);
                }}
                ml={3}
              >
                Stop
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TranscriptionControls; 