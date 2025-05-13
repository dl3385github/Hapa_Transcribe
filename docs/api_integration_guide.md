# Hapa Transcribe: API Integration Guide

This guide provides detailed instructions for integrating the OpenAI Realtime API for transcription within Hapa Transcribe. It covers the setup of WebRTC connections, authentication flow, and handling of transcription events.

## OpenAI Realtime API Overview

The OpenAI Realtime API enables low-latency, multimodal interactions including real-time transcription. Hapa Transcribe uses this API specifically for transcription use cases, leveraging the WebRTC connection method for client-side applications.

### Available Models

For Hapa Transcribe, we use the following OpenAI transcription models:
- `gpt-4o-transcribe` - Full-featured transcription model
- `gpt-4o-mini-transcribe` - Lighter, faster transcription model

## Authentication Flow

Hapa Transcribe implements a secure authentication flow using ephemeral tokens:

1. **Token Request**: Frontend requests an ephemeral token from the Hapa Transcribe backend
2. **Backend Authentication**: Backend verifies user via Hapa's DID authentication system
3. **Token Generation**: Backend uses its server-side OpenAI API key to generate an ephemeral token
4. **Token Delivery**: Ephemeral token is returned to the frontend (valid for 1 minute)
5. **Connection Authentication**: Frontend uses the ephemeral token to establish WebRTC connection

### Server-Side Implementation

```javascript
// Node.js backend code for generating ephemeral token
import express from "express";
import { verifyDidAuth } from "./hapaAuth.js";

const app = express();

app.post("/api/transcribe/token", async (req, res) => {
  try {
    // Verify Hapa DID authentication
    const didAuth = req.headers.authorization;
    const validUser = await verifyDidAuth(didAuth);
    
    if (!validUser) {
      return res.status(401).json({ error: "Unauthorized: Invalid DID authentication" });
    }
    
    // Generate ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-transcribe",
      }),
    });
    
    const tokenData = await response.json();
    
    // Return ephemeral token to client
    res.json({ 
      token: tokenData.client_secret.value,
      expires_at: tokenData.client_secret.expires_at
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(3000, () => {
  console.log("Token server running on port 3000");
});
```

## WebRTC Connection Setup

### Frontend Implementation

```javascript
// React component for establishing WebRTC connection
import React, { useState, useEffect, useRef } from 'react';

const TranscriptionService = () => {
  const [transcript, setTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);
  
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const audioElement = useRef(new Audio());
  
  const startTranscription = async () => {
    try {
      // Step 1: Request ephemeral token from backend
      const tokenResponse = await fetch('/api/transcribe/token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hapaDidToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to obtain token');
      }
      
      const tokenData = await tokenResponse.json();
      const EPHEMERAL_KEY = tokenData.token;
      
      // Step 2: Create WebRTC peer connection
      peerConnection.current = new RTCPeerConnection();
      
      // Step 3: Setup audio track
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      peerConnection.current.addTrack(mediaStream.getTracks()[0]);
      
      // Step 4: Create data channel for events
      dataChannel.current = peerConnection.current.createDataChannel("oai-events");
      dataChannel.current.addEventListener("message", handleTranscriptionEvent);
      
      // Step 5: Create and set local description (offer)
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      // Step 6: Exchange SDP with OpenAI service
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-transcribe";
      const intentParam = "intent=transcription";
      const sdpResponse = await fetch(`${baseUrl}?${intentParam}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });
      
      if (!sdpResponse.ok) {
        throw new Error('Failed to establish connection with OpenAI');
      }
      
      // Step 7: Set remote description (answer)
      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await peerConnection.current.setRemoteDescription(answer);
      
      setIsConnected(true);
      setIsTranscribing(true);
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error.message);
    }
  };
  
  const stopTranscription = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }
    
    setIsTranscribing(false);
    setIsConnected(false);
  };
  
  const handleTranscriptionEvent = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different event types
      if (data.type === 'transcription') {
        setTranscript(prevTranscript => prevTranscript + ' ' + data.text);
      } else if (data.type === 'error') {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error parsing transcription event:', error);
    }
  };
  
  // Component cleanup
  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, []);
  
  return (
    <div className="transcription-container">
      <div className="controls">
        {!isTranscribing ? (
          <button onClick={startTranscription}>Start Transcription</button>
        ) : (
          <button onClick={stopTranscription}>Stop Transcription</button>
        )}
      </div>
      
      <div className="status">
        {isConnected ? 'Connected' : 'Disconnected'}
        {error && <div className="error">{error}</div>}
      </div>
      
      <div className="transcript-display">
        {transcript || 'Transcript will appear here...'}
      </div>
    </div>
  );
};

export default TranscriptionService;
```

## Handling Transcription Events

The OpenAI Realtime API sends events through the WebRTC data channel. For transcription, the following events are relevant:

### Transcription Events

1. **Initialization Events**:
   - `{"type": "connected"}` - Connection established
   - `{"type": "session_begins"}` - Transcription session started

2. **Text Events**:
   - `{"type": "transcription", "text": "transcribed text", "final": false}` - Interim transcription
   - `{"type": "transcription", "text": "transcribed text", "final": true}` - Final transcription segment

3. **Turn Detection Events**:
   - `{"type": "turn_beginning"}` - Beginning of speech detected
   - `{"type": "turn_end"}` - End of speech detected

4. **Error Events**:
   - `{"type": "error", "message": "error description"}` - API or connection error

### Processing Transcription Data

```javascript
// Helper function to process transcription events
const processTranscriptionEvent = (event, currentTranscript) => {
  try {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'transcription':
        if (data.final) {
          // This is a final transcription segment
          return {
            transcriptText: currentTranscript + data.text + '. ',
            isFinal: true
          };
        } else {
          // This is an interim transcription
          return {
            transcriptText: currentTranscript + data.text,
            isFinal: false
          };
        }
        
      case 'turn_beginning':
        console.log('Speech started');
        return { transcriptText: currentTranscript, isFinal: false };
        
      case 'turn_end':
        console.log('Speech ended');
        return { transcriptText: currentTranscript, isFinal: true };
        
      case 'error':
        console.error('Transcription error:', data.message);
        return { transcriptText: currentTranscript, isFinal: false, error: data.message };
        
      default:
        return { transcriptText: currentTranscript, isFinal: false };
    }
  } catch (error) {
    console.error('Failed to process event:', error);
    return { transcriptText: currentTranscript, isFinal: false, error: 'Event processing error' };
  }
};
```

## Error Handling

### Common Errors

1. **Authentication Errors**:
   - 401 Unauthorized - Invalid or expired token
   - 403 Forbidden - API key lacks permissions

2. **Connection Errors**:
   - WebRTC negotiation failures
   - Network interruptions

3. **API Limitations**:
   - Rate limiting
   - Quota exhaustion

### Error Handling Strategy

```javascript
// Error handling middleware for backend
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  if (err.name === 'AuthenticationError') {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  
  if (err.name === 'RateLimitError') {
    return res.status(429).json({ error: 'API rate limit exceeded', retry_after: err.retryAfter });
  }
  
  return res.status(500).json({ error: 'Internal server error' });
});

// Frontend connection error handler
const handleConnectionError = (error) => {
  const errorMessage = error.message || 'Unknown error';
  
  if (errorMessage.includes('getUserMedia')) {
    return 'Microphone access denied. Please check permissions.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Network connection error. Please check your internet connection.';
  }
  
  if (errorMessage.includes('token') || errorMessage.includes('authentication')) {
    return 'Authentication error. Please sign in again.';
  }
  
  return 'Error connecting to transcription service. Please try again.';
};
```

## API Reference

### OpenAI Realtime API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://api.openai.com/v1/realtime` | WebRTC | Main connection endpoint for WebRTC |
| `https://api.openai.com/v1/realtime/sessions` | POST | Create ephemeral tokens |

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model ID (e.g., "gpt-4o-transcribe") |
| `intent` | string | Set to "transcription" for transcription-only use case |

### Headers

| Header | Description |
|--------|-------------|
| `Authorization` | Bearer token for authentication |
| `Content-Type` | "application/sdp" for WebRTC SDP exchange |
| `OpenAI-Beta` | "realtime=v1" (required during beta) | 