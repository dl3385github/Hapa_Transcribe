# Hapa Transcribe: Technical Design Document

## Architecture Overview

Hapa Transcribe is designed as a web-based React application with a Node.js backend service, leveraging OpenAI's WebRTC API for real-time transcription. The architecture supports both standalone operation and embedding within Hapa's Electron application.

## System Components

### 1. Frontend Application (React)

- **Technology Stack:**
  - React.js for component-based UI
  - JSX for templating
  - CSS/SCSS for styling
  - WebRTC APIs for audio streaming

- **Key Components:**
  - **TranscriptionPanel**: Main UI component displaying the real-time transcript
  - **AudioSourceSelector**: Component for selecting and managing audio sources
  - **TokenManager**: Handles ephemeral token lifecycle and renewal
  - **TranscriptStorage**: Manages saving and exporting functionality
  - **SettingsPanel**: UI for configuring application preferences

### 2. Backend Service (Node.js)

- **Technology Stack:**
  - Node.js runtime
  - Express.js for REST API
  - JWT for authentication

- **Key Components:**
  - **EphemeralTokenService**: Generates OpenAI ephemeral tokens
  - **AuthService**: Integrates with Hapa's DID authentication
  - **WebRTCBroker**: Handles WebRTC connection setup
  - **StorageConnector**: Connects to Hyperdrive for transcript storage

## Data Flow

1. **Authentication Flow:**
   ```
   User (DID) → Hapa Auth → Backend → OpenAI REST API → Ephemeral Token → Frontend
   ```

2. **Transcription Flow:**
   ```
   User Mic → WebRTC → OpenAI Realtime API → Transcript → Frontend UI
   ```

3. **Storage Flow:**
   ```
   Transcript → E2E Encryption → Hyperdrive Storage → User Decryption
   ```

## API Integration

### OpenAI WebRTC Integration

1. **Ephemeral Token Generation**:
   - Browser requests ephemeral token from Node.js backend
   - Backend authenticates user via Hapa DID
   - Backend uses standard OpenAI API key to request ephemeral token
   - Ephemeral token returned to browser (valid for 1 minute)

2. **WebRTC Connection**:
   - Create RTCPeerConnection
   - Set up audio tracks from selected source
   - Create data channel for events
   - Exchange SDP with OpenAI Realtime API
   - Establish peer connection

3. **Transcription Processing**:
   - Send audio through peer connection
   - Receive transcript events from data channel
   - Parse and display transcript in UI
   - Update UI in real-time

### Hapa Integration Points

1. **DID Authentication**:
   - Leverage Hapa's existing DID system for user authentication
   - Use DID keys for transcript encryption

2. **Consul Integration**:
   - Hook into Consul meeting events to auto-start transcription
   - Access audio streams from Consul participants

3. **Hyperdrive Storage**:
   - Store encrypted transcripts in user's Hyperdrive space
   - Implement permission management for shared transcripts

## Technical Requirements

### Performance

- Client-side optimization for real-time processing
- Efficient WebRTC connection management
- Minimal memory footprint for embedding in Electron

### Security

- Secure token handling with proper expiration
- No client-side exposure of OpenAI API keys
- End-to-end encryption of stored transcripts
- Secure WebRTC connections

### Scalability

- Support for multiple concurrent transcription sessions
- Efficient backend resource management
- Graceful handling of connection interruptions

## Error Handling

1. **Connection Issues**:
   - Automatic reconnection attempts
   - Clear user feedback on connection status
   - Graceful degradation of functionality

2. **Authentication Failures**:
   - Proper error messaging for authentication issues
   - Secure fallback mechanisms
   - Logging for debugging

3. **API Limitations**:
   - Handling of OpenAI rate limits
   - Fallback strategies for service disruptions
   - Clear user communication about service status

## Technical Dependencies

- OpenAI Realtime API (WebRTC and WebSockets)
- Hapa DID Authentication System
- Hyperdrive Storage API
- WebRTC compatible browsers/environments
- Node.js runtime environment 