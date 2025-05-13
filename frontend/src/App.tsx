import React from 'react';
import { Box, Container, Heading, Text, VStack, Grid, GridItem, Divider, Link } from '@chakra-ui/react';
import { AppProvider } from './contexts/AppContext';
import ApiKeyInput from './components/ApiKeyInput';
import MicrophoneSelector from './components/MicrophoneSelector';
import TranscriptionControls from './components/TranscriptionControls';
import TranscriptDisplay from './components/TranscriptDisplay';

/**
 * Main App component
 */
const App: React.FC = () => {
  return (
    <AppProvider>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="2xl">Hapa Transcribe</Heading>
            <Text mt={4} fontSize="lg">
              Real-time, privacy-focused transcription module for the Hapa ecosystem
            </Text>
          </Box>

          <Grid templateColumns={{ base: "1fr", md: "300px 1fr" }} gap={6}>
            <GridItem>
              <VStack spacing={6} align="stretch">
                <ApiKeyInput />
                <MicrophoneSelector />
                <TranscriptionControls />
              </VStack>
            </GridItem>

            <GridItem>
              <TranscriptDisplay />
            </GridItem>
          </Grid>

          <Divider my={4} />

          <Box textAlign="center" fontSize="sm" color="gray.500">
            <Text>
              Hapa Transcribe uses OpenAI's Realtime API for transcription.
              Your API key is stored locally and never sent to our servers.
            </Text>
            <Text mt={2}>
              <Link href="https://github.com/your-repo/hapa-transcribe" isExternal>
                GitHub
              </Link>
              {' | '}
              <Link href="https://platform.openai.com/docs/guides/speech-to-text" isExternal>
                OpenAI Docs
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </AppProvider>
  );
};

export default App; 