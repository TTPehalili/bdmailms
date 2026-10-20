/**
 * ElevenLabs Scribe v2 Real-time WebSocket Client
 * Streams 16kHz PCM chunks and emits interim and finalized transcription events.
 */

export interface ScribeSocketOptions {
  apiKey?: string;
  modelId?: string; // 'scribe_v2' or 'scribe_v1'
  sampleRate?: number;
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (status: 'connected' | 'connecting' | 'disconnected' | 'fallback_active') => void;
}

export class ScribeSocketClient {
  private socket: WebSocket | null = null;
  private apiKey: string;
  private sampleRate: number;
  private status: 'connected' | 'connecting' | 'disconnected' | 'fallback_active' = 'disconnected';
  private onInterimTranscript?: (text: string) => void;
  private onFinalTranscript?: (text: string) => void;
  private onError?: (error: Error) => void;
  private onConnectionChange?: (status: 'connected' | 'connecting' | 'disconnected' | 'fallback_active') => void;

  constructor(options: ScribeSocketOptions = {}) {
    this.apiKey = options.apiKey || '';
    this.sampleRate = options.sampleRate || 16000;
    this.onInterimTranscript = options.onInterimTranscript;
    this.onFinalTranscript = options.onFinalTranscript;
    this.onError = options.onError;
    this.onConnectionChange = options.onConnectionChange;
  }

  public setApiKey(key: string) {
    this.apiKey = key;
  }

  public connect(): Promise<void> {
    return new Promise((resolve) => {
      this.updateStatus('connecting');

      // If no ElevenLabs API key is provided, or in local dev fallback, flag fallback mode
      if (!this.apiKey) {
        console.warn('[ScribeSocket] No ElevenLabs API key provided. Operating in client-side speech recognition mode.');
        this.updateStatus('fallback_active');
        resolve();
        return;
      }

      try {
        // ElevenLabs Scribe v2 Streaming endpoint
        // Query parameters include model_id and audio format
        const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/streaming?model_id=scribe_v2&sample_rate=${this.sampleRate}&encoding=pcm_s16le`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.updateStatus('connected');
          // Send authentication and configuration handshake
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
              JSON.stringify({
                type: 'start',
                api_key: this.apiKey,
                sample_rate: this.sampleRate,
                language_code: 'en',
              })
            );
          }
          resolve();
        };

        this.socket.onmessage = (event: MessageEvent) => {
          this.handleIncomingMessage(event.data);
        };

        this.socket.onerror = (err) => {
          console.warn('[ScribeSocket] WebSocket error, switching to fallback mode:', err);
          this.updateStatus('fallback_active');
          if (this.onError) {
            this.onError(new Error('Scribe WebSocket connection error. Active fallback enabled.'));
          }
          resolve();
        };

        this.socket.onclose = () => {
          if (this.status !== 'fallback_active') {
            this.updateStatus('disconnected');
          }
        };
      } catch (err) {
        console.warn('[ScribeSocket] Connection attempt failed, fallback active:', err);
        this.updateStatus('fallback_active');
        resolve();
      }
    });
  }

  private handleIncomingMessage(data: string) {
    try {
      const payload = JSON.parse(data);

      // Handle standard Scribe v2 event schemas
      // 1. Partial/Interim transcription
      if (payload.type === 'interim_transcript' || payload.message_type === 'interim' || (!payload.is_final && payload.text)) {
        const text = payload.text || payload.transcript || '';
        if (text && this.onInterimTranscript) {
          this.onInterimTranscript(text);
        }
      }

      // 2. Finalized segment transcription
      if (payload.type === 'final_transcript' || payload.message_type === 'final' || payload.is_final) {
        const text = payload.text || payload.transcript || '';
        if (text && this.onFinalTranscript) {
          this.onFinalTranscript(text);
        }
      }
    } catch {
      // Non-JSON binary or ping/pong frame
    }
  }

  public sendPcmChunk(chunk: Int16Array): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Send raw binary buffer or base64 audio envelope
      try {
        this.socket.send(chunk.buffer);
      } catch (e) {
        console.error('[ScribeSocket] Error sending PCM chunk:', e);
      }
    }
  }

  public disconnect(): void {
    if (this.socket) {
      try {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: 'stop' }));
        }
        this.socket.close();
      } catch {
        // Safe close
      }
      this.socket = null;
    }
    this.updateStatus('disconnected');
  }

  public getStatus() {
    return this.status;
  }

  private updateStatus(status: 'connected' | 'connecting' | 'disconnected' | 'fallback_active') {
    this.status = status;
    if (this.onConnectionChange) {
      this.onConnectionChange(status);
    }
  }
}
