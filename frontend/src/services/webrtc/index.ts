// WebRTC service for connecting to OpenAI's Realtime API in transcription mode
import { getEphemeralToken } from '../api';

export interface TranscriptionOptions {
  onTranscription: (text: string, isFinal: boolean) => void;
  onError: (error: Error) => void;
  onStatusChange: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  selectedMicrophoneId?: string;
}

export class RealtimeTranscriptionService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private mediaStream: MediaStream | null = null;
  private ephemeralToken: string | null = null;
  private options: TranscriptionOptions | null = null;

  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.mediaStream = null;
    this.ephemeralToken = null;
    this.options = null;
  }

  /**
   * Start transcription using the provided API key and microphone
   */
  async startTranscription(apiKey: string, options: TranscriptionOptions): Promise<void> {
    this.options = options;
    
    try {
      options.onStatusChange('connecting');
      
      // Step 1: Get ephemeral token from our backend
      const tokenResponse = await getEphemeralToken(apiKey);
      console.log('Token response:', tokenResponse);
      
      // Extract the ephemeral token value from the client_secret object
      if (!tokenResponse.client_secret || !tokenResponse.client_secret.value) {
        throw new Error('Invalid token response from server');
      }
      
      this.ephemeralToken = tokenResponse.client_secret.value;
      
      // Step 2: Get access to the microphone
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: options.selectedMicrophoneId 
          ? { deviceId: { exact: options.selectedMicrophoneId } }
          : true
      });
      
      // Step 3: Set up WebRTC connection
      this.peerConnection = new RTCPeerConnection();
      
      // Step 4: Add audio track to peer connection
      this.mediaStream.getAudioTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.mediaStream!);
        }
      });
      
      // Step 5: Create data channel for events
      this.dataChannel = this.peerConnection.createDataChannel('oai-events');
      this.dataChannel.addEventListener('message', this.handleTranscriptionEvent);
      
      // Step 6: Create and set local description (offer)
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Step 7: Exchange SDP with OpenAI Realtime API
      const baseUrl = 'https://api.openai.com/v1/realtime';
      
      console.log('Sending SDP to OpenAI with URL:', baseUrl);
      console.log('Using ephemeral token:', this.ephemeralToken ? this.ephemeralToken.substring(0, 10) + '...' : 'none');
      
      const sdpResponse = await fetch(baseUrl, {
        method: 'POST',
        body: this.peerConnection.localDescription?.sdp,
        headers: {
          'Authorization': `Bearer ${this.ephemeralToken}`,
          'Content-Type': 'application/sdp'
        },
      });
      
      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error(`Failed to establish connection with OpenAI: ${errorText}`);
      }
      
      // Step 8: Set remote description (answer)
      const answer = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      } as RTCSessionDescriptionInit;
      
      await this.peerConnection.setRemoteDescription(answer);
      
      // Setup event listeners for connection state changes
      this.peerConnection.addEventListener('connectionstatechange', this.handleConnectionStateChange);
      
      options.onStatusChange('connected');
      
      // Send initial session update to configure for transcription-only mode
      this.sendSessionUpdate();
      
    } catch (error) {
      options.onStatusChange('error');
      options.onError(error instanceof Error ? error : new Error(String(error)));
      this.stopTranscription();
    }
  }

  /**
   * Send session update to configure for transcription-only mode
   */
  private sendSessionUpdate(): void {
    if (!this.dataChannel) return;
    
    const sessionUpdate = {
      type: 'session.update',
      session: {
        instructions: "You are a transcription assistant. Only transcribe what you hear. Do not respond, engage in conversation, or generate any replies. Simply provide accurate transcriptions of the audio input.",
        modalities: ["text", "audio"],
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1200
        },
        tool_choice: "none"
      }
    };
    
    try {
      this.dataChannel.send(JSON.stringify(sessionUpdate));
      console.log('Sent session update for transcription mode');
    } catch (error) {
      console.error('Error sending session update:', error);
    }
  }

  /**
   * Stop transcription and clean up resources
   */
  stopTranscription(): void {
    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.removeEventListener('message', this.handleTranscriptionEvent);
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.removeEventListener('connectionstatechange', this.handleConnectionStateChange);
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.mediaStream = null;
    }
    
    this.ephemeralToken = null;
    
    if (this.options) {
      this.options.onStatusChange('disconnected');
    }
  }

  /**
   * Handle transcription events from the data channel
   */
  private handleTranscriptionEvent = (event: MessageEvent): void => {
    if (!this.options) return;
    
    try {
      const data = JSON.parse(event.data);
      console.log('Received event:', data);
      
      switch (data.type) {
        // Handle input audio transcription events - these contain the transcribed text
        case 'conversation.item.input_audio_transcription.completed':
          // This event contains the final transcription
          if (data.transcript) {
            this.options.onTranscription(data.transcript, true);
          }
          break;
          
        case 'input_audio_buffer.speech_started':
          console.log('Speech detected');
          break;
          
        case 'input_audio_buffer.speech_stopped':
          console.log('Speech ended');
          break;
          
        case 'session.updated':
          console.log('Session updated:', data.session);
          break;
          
        case 'error':
          this.options.onError(new Error(data.error?.message || 'Unknown transcription error'));
          break;
          
        case 'session.created':
          console.log('Session created successfully');
          break;
          
        // Ignore response events since we only want transcription
        case 'response.created':
        case 'response.done':
        case 'response.output_item.added':
        case 'response.content_part.added':
        case 'response.audio.delta':
        case 'response.audio.done':
          console.log('Ignoring response event:', data.type);
          break;
          
        default:
          console.log('Unhandled event type:', data.type, data);
      }
    } catch (error) {
      console.error('Error processing transcription event:', error);
    }
  };

  /**
   * Handle connection state changes
   */
  private handleConnectionStateChange = (): void => {
    if (!this.peerConnection || !this.options) return;
    
    const connectionState = this.peerConnection.connectionState;
    
    switch (connectionState) {
      case 'connected':
        this.options.onStatusChange('connected');
        break;
        
      case 'disconnected':
      case 'closed':
        this.options.onStatusChange('disconnected');
        break;
        
      case 'failed':
        this.options.onStatusChange('error');
        this.options.onError(new Error('WebRTC connection failed'));
        this.stopTranscription();
        break;
    }
  };
} 