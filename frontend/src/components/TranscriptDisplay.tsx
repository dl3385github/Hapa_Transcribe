import React, { useRef, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  Button,
  Flex,
  Spinner,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';

/**
 * Component for displaying real-time transcription
 */
const TranscriptDisplay: React.FC = () => {
  const { transcript, isTranscribing } = useApp();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  // Auto-scroll to the bottom when transcript updates
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <Box width="100%">
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading as="h3" size="md">
            Transcript
          </Heading>
          <Flex align="center">
            {isTranscribing && (
              <>
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm" color="green.500">Transcribing...</Text>
              </>
            )}
          </Flex>
        </Flex>

        <Box
          ref={transcriptRef}
          height="400px"
          overflowY="auto"
          p={4}
          borderWidth={1}
          borderRadius="md"
          bg={bgColor}
          color={textColor}
          fontSize="md"
          lineHeight="tall"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              width: '10px',
              background: useColorModeValue('gray.100', 'gray.600'),
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('gray.300', 'gray.500'),
              borderRadius: '24px',
            },
          }}
        >
          {transcript ? (
            transcript.split('\n').map((line, i) => (
              <Text key={i} mb={2}>
                {line}
              </Text>
            ))
          ) : (
            <Text color="gray.500" fontStyle="italic">
              {isTranscribing
                ? "Waiting for speech..."
                : "Start transcription to see the text here."}
            </Text>
          )}
        </Box>

        <Flex justify="flex-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Copy transcript to clipboard
              navigator.clipboard.writeText(transcript);
            }}
            isDisabled={!transcript}
          >
            Copy to Clipboard
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default TranscriptDisplay; 