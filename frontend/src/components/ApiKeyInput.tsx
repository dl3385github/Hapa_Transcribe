import React, { useState } from 'react';
import { 
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  useToast,
  Flex
} from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';

/**
 * Component for entering and storing the OpenAI API key
 */
const ApiKeyInput: React.FC = () => {
  const { apiKey, setApiKey } = useApp();
  const [showApiKey, setShowApiKey] = useState(false);
  const [inputValue, setInputValue] = useState(apiKey);
  const toast = useToast();

  const handleSaveApiKey = () => {
    // Basic validation to check if the key looks like an OpenAI key
    if (!inputValue || !inputValue.startsWith('sk-')) {
      toast({
        title: 'Invalid API Key',
        description: 'Please enter a valid OpenAI API key starting with "sk-"',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setApiKey(inputValue);
    toast({
      title: 'API Key Saved',
      description: 'Your OpenAI API key has been saved locally.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleToggleShowApiKey = () => setShowApiKey(!showApiKey);

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
      <VStack spacing={4} align="stretch">
        <Text fontSize="md" fontWeight="medium">
          OpenAI API Key
        </Text>
        <Text fontSize="sm" color="gray.600">
          Your API key is stored locally in your browser and never sent to our servers.
        </Text>
        
        <FormControl>
          <FormLabel htmlFor="apiKey" fontSize="sm">Enter your OpenAI API key:</FormLabel>
          <InputGroup size="md">
            <Input
              id="apiKey"
              pr="4.5rem"
              type={showApiKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleToggleShowApiKey}>
                {showApiKey ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        
        <Flex justifyContent="flex-end">
          <Button colorScheme="blue" onClick={handleSaveApiKey}>
            Save API Key
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default ApiKeyInput; 