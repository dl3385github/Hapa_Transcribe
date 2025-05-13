import { extendTheme } from '@chakra-ui/react';

// Hapa Transcribe theme based on the UI/UX specification
const theme = extendTheme({
  colors: {
    primary: {
      500: '#2A2D34', // Dark slate for main UI elements
    },
    secondary: {
      500: '#5E6572', // Medium gray for secondary elements
    },
    accent: {
      500: '#5F9EA0', // Cadet blue for interactive elements
    },
    background: {
      500: '#F7F7F2', // Off-white for backgrounds
    },
    text: {
      500: '#0A0908', // Near-black for primary text
    },
    success: {
      500: '#4CAF50', // Green for success states
    },
    error: {
      500: '#F44336', // Red for error states
    },
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
    mono: 'Roboto Mono, monospace',
  },
  fontSizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.25rem',   // 20px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#1E1E24' : '#F7F7F2',
        color: props.colorMode === 'dark' ? '#F7F7F2' : '#0A0908',
      },
    }),
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme; 