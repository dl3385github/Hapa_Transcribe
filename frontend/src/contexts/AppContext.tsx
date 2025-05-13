import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface AppContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isTranscribing: boolean;
  setIsTranscribing: (isTranscribing: boolean) => void;
  transcript: string;
  setTranscript: Dispatch<SetStateAction<string>>;
  selectedMicrophone: MediaDeviceInfo | null;
  setSelectedMicrophone: (device: MediaDeviceInfo | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  availableMicrophones: MediaDeviceInfo[];
  setAvailableMicrophones: (devices: MediaDeviceInfo[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // API key state - stored in localStorage for persistence
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem('hapaTranscribe_apiKey') || '';
  });
  
  // Transcription state
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Audio device state
  const [selectedMicrophone, setSelectedMicrophone] = useState<MediaDeviceInfo | null>(null);
  const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([]);

  // Custom setter for API key that also updates localStorage
  const setApiKey = (key: string) => {
    localStorage.setItem('hapaTranscribe_apiKey', key);
    setApiKeyState(key);
  };

  const value = {
    apiKey,
    setApiKey,
    isTranscribing,
    setIsTranscribing,
    transcript,
    setTranscript,
    selectedMicrophone,
    setSelectedMicrophone,
    error,
    setError,
    availableMicrophones,
    setAvailableMicrophones,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 