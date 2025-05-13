# Hapa Transcribe

A real-time, privacy-focused transcription module built for the Hapa decentralized ecosystem. This application leverages OpenAI's WebRTC API to provide accurate, low-latency audio transcription while maintaining privacy and security.

## Features

- **Real-time transcription** using OpenAI's Realtime API
- **Local API key storage** - your OpenAI API key is stored only in your browser
- **Microphone selection** - choose from available audio input devices
- **Privacy-focused** - audio is processed in real-time and never stored
- **Simple, modern UI** built with React and Chakra UI

## Project Structure

```
hapa-transcribe/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── services/         # Service modules (API, WebRTC, Auth)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React context providers
│   │   ├── utils/            # Utility functions
│   │   ├── styles/           # Global styles and theme
│   │   ├── assets/           # Static assets
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── public/               # Static files
│   ├── index.html            # HTML entry point
│   ├── vite.config.js        # Vite configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Frontend dependencies
│
├── backend/                  # Node.js backend server
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middlewares/      # Express middlewares
│   │   ├── routes/           # API routes
│   │   ├── services/         # Service modules
│   │   ├── utils/            # Utility functions
│   │   └── index.js          # Server entry point
│   ├── config/               # Configuration files
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Backend dependencies
│
├── docs/                     # Project documentation
├── package.json              # Root package.json for scripts
└── README.md                 # This file
```

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- An OpenAI API key with access to the Realtime API

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/hapa-transcribe.git
   cd hapa-transcribe
   ```

2. Install dependencies for the root, frontend, and backend:
   ```bash
   npm install
   ```

3. Install frontend and backend dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   cd ..
   ```

4. Create `.env` files:

   For backend (backend/.env):
   ```
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key  # Optional, users can provide their own
   ALLOWED_ORIGINS=http://localhost:5173
   ```

   For frontend (frontend/.env):
   ```
   VITE_API_URL=http://localhost:3001
   ```

## Development

1. Start the development servers:

   In one terminal, start the backend:
   ```bash
   cd backend
   npm run dev
   ```

   In another terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open your browser and navigate to http://localhost:5173

## Usage

1. Enter your OpenAI API key in the settings panel
2. Select your microphone from the dropdown
3. Click "Start Transcription" to begin
4. Speak into your microphone to see real-time transcription
5. Click "Stop Transcription" when done
6. Use the "Copy to Clipboard" button to save your transcript

## How It Works

Hapa Transcribe follows OpenAI's recommended WebRTC flow:

1. Your browser requests an ephemeral token from our backend server
2. Our backend uses the provided OpenAI API key to request an ephemeral token
3. The browser uses the ephemeral token to establish a WebRTC connection directly with OpenAI
4. Audio from your microphone is streamed to OpenAI in real-time
5. Transcription results are displayed as they are received

## Security and Privacy

- Your OpenAI API key is stored only in your browser's localStorage
- Audio data is processed in real-time and never recorded or stored
- The backend server acts only as a token broker and never has access to your audio

## Building for Production

```bash
# Build the frontend
cd frontend
npm run build

# Build the backend
cd ../backend
npm run build
```

## License

MIT

## Credits

- Built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), and [Chakra UI](https://chakra-ui.com/)
- Uses [OpenAI's Realtime API](https://platform.openai.com/docs/api-reference/audio) for transcription
- Part of the [Hapa](https://hapa.dev) decentralized ecosystem 