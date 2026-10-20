/**
 * Audio Processor for Appointmentlyy SDR Live Cockpit
 * Captures microphone audio using Web Audio API, downsamples/formats to 16kHz 16-bit Mono PCM,
 * computes real-time volume RMS for visual meters, and emits Int16Array buffers.
 */

export interface MicStreamOptions {
  sampleRate?: number;
  chunkDurationMs?: number; // Target chunk duration (e.g. 150ms - 250ms)
  onPcmChunk?: (chunk: Int16Array) => void;
  onVolumeChange?: (rmsPercent: number) => void;
  onError?: (err: Error) => void;
}

export class MicStreamer {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private running = false;
  private targetSampleRate = 16000;
  private chunkDurationMs = 200;
  private bufferAccumulator: number[] = [];
  private onPcmChunk?: (chunk: Int16Array) => void;
  private onVolumeChange?: (rmsPercent: number) => void;
  private onError?: (err: Error) => void;

  constructor(options: MicStreamOptions = {}) {
    this.targetSampleRate = options.sampleRate || 16000;
    this.chunkDurationMs = options.chunkDurationMs || 200;
    this.onPcmChunk = options.onPcmChunk;
    this.onVolumeChange = options.onVolumeChange;
    this.onError = options.onError;
  }

  public async start(): Promise<void> {
    if (this.running) return;

    try {
      // 1. Request microphone with hardware acoustic constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.targetSampleRate,
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
        video: false,
      });

      this.mediaStream = stream;

      // 2. Initialize AudioContext
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate: this.targetSampleRate,
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);

      // 3. Create audio processor (buffer size 4096 gives ~85ms at 48kHz or ~256ms at 16kHz)
      const bufferSize = 4096;
      this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      const actualSampleRate = this.audioContext.sampleRate;
      const targetChunkSamples = Math.floor((this.targetSampleRate * this.chunkDurationMs) / 1000);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.running) return;

        const inputChannel = e.inputBuffer.getChannelData(0);

        // Compute RMS for live visual meter [0 - 100%]
        let sumSquares = 0;
        for (let i = 0; i < inputChannel.length; i++) {
          sumSquares += inputChannel[i] * inputChannel[i];
        }
        const rms = Math.sqrt(sumSquares / inputChannel.length);
        const volumePercent = Math.min(100, Math.round(rms * 250)); // Scaled for speech dynamics
        if (this.onVolumeChange) {
          this.onVolumeChange(volumePercent);
        }

        // Resample to targetSampleRate if browser didn't match 16000Hz
        let resampled: Float32Array;
        if (actualSampleRate === this.targetSampleRate) {
          resampled = inputChannel;
        } else {
          const ratio = actualSampleRate / this.targetSampleRate;
          const newLength = Math.round(inputChannel.length / ratio);
          resampled = new Float32Array(newLength);
          for (let i = 0; i < newLength; i++) {
            const originalIndex = Math.floor(i * ratio);
            resampled[i] = inputChannel[originalIndex] || 0;
          }
        }

        // Convert Float32 [-1.0, 1.0] to 16-bit Signed Integer PCM
        for (let i = 0; i < resampled.length; i++) {
          const s = Math.max(-1, Math.min(1, resampled[i]));
          const pcmSample = s < 0 ? s * 0x8000 : s * 0x7fff;
          this.bufferAccumulator.push(Math.round(pcmSample));

          // When chunk size threshold reached, emit Int16Array
          if (this.bufferAccumulator.length >= targetChunkSamples) {
            const chunk = new Int16Array(this.bufferAccumulator.slice(0, targetChunkSamples));
            this.bufferAccumulator = this.bufferAccumulator.slice(targetChunkSamples);
            if (this.onPcmChunk) {
              this.onPcmChunk(chunk);
            }
          }
        }
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.running = true;
    } catch (err) {
      this.stop();
      if (this.onError) {
        this.onError(err instanceof Error ? err : new Error(String(err)));
      } else {
        console.error('[MicStreamer] Failed to initialize microphone:', err);
      }
      throw err;
    }
  }

  public stop(): void {
    this.running = false;

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      this.audioContext = null;
    }

    this.bufferAccumulator = [];
    if (this.onVolumeChange) {
      this.onVolumeChange(0);
    }
  }

  public isStreaming(): boolean {
    return this.running;
  }
}
