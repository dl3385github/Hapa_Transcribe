/**
 * WebRTC Service
 * Handles WebRTC connections to OpenAI's Realtime API for transcription
 */

// Event handler types for WebRTC events
type TranscriptHandler = (text: string) => void;
type ErrorHandler = (error: string) => void;
type ConnectionStateHandler = (state: RTCPeerConnectionState) => void;

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private mediaStream: MediaStream | null = null;
  private transcriptHandler: TranscriptHandler | null = null;
  private errorHandler: ErrorHandler | null = null;
  private connectionStateHandler: ConnectionStateHandler | null = null;
  
  /**
   * Initialize a new WebRTC connection to OpenAI's Realtime API
   * @param ephemeralToken The ephemeral token from OpenAI
   * @param microphoneId The ID of the microphone to use
   * @returns Promise that resolves when the connection is established
   */
  public async initialize(
    ephemeralToken: string, 
    microphoneId?: string
  ): Promise<void> {
    try {
      // Close any existing connection
      this.close();
      
      // Create a new peer connection
      this.peerConnection = new RTCPeerConnection();
      
      // Set up connection state change handler
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection && this.connectionStateHandler) {
          this.connectionStateHandler(this.peerConnection.connectionState);
        }
      };
      
      // Get audio from the selected microphone or default device
      const constraints: MediaStreamConstraints = {
        audio: microphoneId ? { deviceId: { exact: microphoneId } } : true,
        video: false
      };
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add audio track to the peer connection
      const audioTrack = this.mediaStream.getAudioTracks()[0];
      this.peerConnection.addTrack(audioTrack, this.mediaStream);
      
      // Create data channel
      this.dataChannel = this.peerConnection.createDataChannel('oai-events');
      this.dataChannel.onmessage = this.handleDataChannelMessage.bind(this);
      
      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Set up the connection with OpenAI
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-transcribe"; // Or gpt-4o-mini-transcribe for lower latency
      const intentParam = "intent=transcription"; // Specify transcription intent
      const modelParam = `model=${model}`;
      
      const response = await fetch(`${baseUrl}?${modelParam}&${intentParam}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Authorization": `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to connect to OpenAI: ${errorText}`);
      }
      
      // Set remote description from OpenAI's answer
      const answerSdp = await response.text();
      const answer = {
        type: "answer",
        sdp: answerSdp
      } as RTCSessionDescriptionInit;
      
      await this.peerConnection.setRemoteDescription(answer);
      
    } catch (error: any) {
      this.close();
      if (this.errorHandler) {
        this.errorHandler(error.message || 'Failed to initialize WebRTC connection');
      }
      throw error;
    }
  }
  
  /**
   * Close the WebRTC connection and clean up resources
   */
  public close(): void {
    // Stop all media tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
  
  /**
   * Set handlers for WebRTC events
   */
  public setHandlers(
    transcriptHandler: TranscriptHandler,
    errorHandler: ErrorHandler,
    connectionStateHandler: ConnectionStateHandler
  ): void {
    this.transcriptHandler = transcriptHandler;
    this.errorHandler = errorHandler;
    this.connectionStateHandler = connectionStateHandler;
  }
  
  /**
   * Handle messages from the data channel
   */
  private handleDataChannelMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different event types from OpenAI
      if (data.type === 'transcription' && this.transcriptHandler) {
        this.transcriptHandler(data.text);
      } else if (data.type === 'error' && this.errorHandler) {
        this.errorHandler(data.message || 'Unknown error from OpenAI');
      }
    } catch (error: any) {
      console.error('Error handling WebRTC message:', error);
      if (this.errorHandler) {
        this.errorHandler('Error processing transcription data');
      }
    }
  }
} 