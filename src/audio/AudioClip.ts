import { EventEmitter } from '../utils/EventEmitter';

export interface AudioClipData {
    url: string;
    preload?: boolean;
    volume?: number;
    loop?: boolean;
    format?: string;
}

export class AudioClip extends EventEmitter {
    private audioBuffer: AudioBuffer | null = null;
    private url: string;
    private name: string;
    private isLoaded: boolean = false;
    private isLoading: boolean = false;
    private loadPromise: Promise<void> | null = null;
    
    // Metadata
    private duration: number = 0;
    private sampleRate: number = 0;
    private channels: number = 0;
    private format: string = 'unknown';
    
    // Settings
    private defaultVolume: number = 1.0;
    private defaultLoop: boolean = false;

    constructor(name: string, data: AudioClipData) {
        super();
        
        this.name = name;
        this.url = data.url;
        this.defaultVolume = data.volume || 1.0;
        this.defaultLoop = data.loop || false;
        this.format = data.format || this.getFormatFromUrl(data.url);
        
        if (data.preload) {
            this.load();
        }
    }

    private getFormatFromUrl(url: string): string {
        const extension = url.split('.').pop()?.toLowerCase();
        return extension || 'unknown';
    }

    public async load(): Promise<void> {
        if (this.isLoaded || this.isLoading) {
            return this.loadPromise || Promise.resolve();
        }
        
        this.isLoading = true;
        this.emit('loadStart');
        
        this.loadPromise = this.loadAudioData();
        
        try {
            await this.loadPromise;
            this.isLoaded = true;
            this.isLoading = false;
            this.emit('loadComplete');
        } catch (error) {
            this.isLoading = false;
            this.emit('loadError', error);
            throw error;
        }
        
        return this.loadPromise;
    }

    private async loadAudioData(): Promise<void> {
        try {
            // Fetch audio file
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio file: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode audio data
            const audioContext = this.getAudioContext();
            this.audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Extract metadata
            this.duration = this.audioBuffer.duration;
            this.sampleRate = this.audioBuffer.sampleRate;
            this.channels = this.audioBuffer.numberOfChannels;
            
        } catch (error) {
            console.error(`Failed to load audio clip "${this.name}":`, error);
            throw error;
        }
    }

    private getAudioContext(): AudioContext {
        // Get audio context from AudioManager
        if (typeof window !== 'undefined' && (window as any).audioManagerInstance) {
            return (window as any).audioManagerInstance.getAudioContext();
        } else {
            throw new Error('AudioManager not initialized');
        }
    }

    public unload(): void {
        this.audioBuffer = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
        this.emit('unloaded');
    }

    public createAudioBufferSourceNode(): AudioBufferSourceNode {
        if (!this.isLoaded || !this.audioBuffer) {
            throw new Error(`Audio clip "${this.name}" is not loaded`);
        }
        
        const audioContext = this.getAudioContext();
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = this.audioBuffer;
        
        return sourceNode;
    }

    // Getters
    public getName(): string {
        return this.name;
    }

    public getUrl(): string {
        return this.url;
    }

    public getDuration(): number {
        return this.duration;
    }

    public getSampleRate(): number {
        return this.sampleRate;
    }

    public getChannels(): number {
        return this.channels;
    }

    public getFormat(): string {
        return this.format;
    }

    public getDefaultVolume(): number {
        return this.defaultVolume;
    }

    public getDefaultLoop(): boolean {
        return this.defaultLoop;
    }

    public isReady(): boolean {
        return this.isLoaded;
    }

    public isCurrentlyLoading(): boolean {
        return this.isLoading;
    }

    public getAudioBuffer(): AudioBuffer | null {
        return this.audioBuffer;
    }

    // Setters
    public setDefaultVolume(volume: number): void {
        this.defaultVolume = Math.max(0, Math.min(1, volume));
    }

    public setDefaultLoop(loop: boolean): void {
        this.defaultLoop = loop;
    }

    // Audio analysis methods
    public getFrequencyData(): Float32Array | null {
        if (!this.audioBuffer) return null;
        
        // Return the raw audio data from the first channel
        return this.audioBuffer.getChannelData(0);
    }

    public getPeakAmplitude(): number {
        const frequencyData = this.getFrequencyData();
        if (!frequencyData) return 0;
        
        let peak = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            const amplitude = Math.abs(frequencyData[i]);
            if (amplitude > peak) {
                peak = amplitude;
            }
        }
        
        return peak;
    }

    public getRMSVolume(): number {
        const frequencyData = this.getFrequencyData();
        if (!frequencyData) return 0;
        
        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            sum += frequencyData[i] * frequencyData[i];
        }
        
        return Math.sqrt(sum / frequencyData.length);
    }

    // Utility methods
    public clone(newName?: string): AudioClip {
        return new AudioClip(newName || `${this.name}_copy`, {
            url: this.url,
            volume: this.defaultVolume,
            loop: this.defaultLoop,
            format: this.format
        });
    }

    public getInfo(): object {
        return {
            name: this.name,
            url: this.url,
            duration: this.duration,
            sampleRate: this.sampleRate,
            channels: this.channels,
            format: this.format,
            isLoaded: this.isLoaded,
            isLoading: this.isLoading,
            defaultVolume: this.defaultVolume,
            defaultLoop: this.defaultLoop
        };
    }

    // Static utility methods
    public static async loadFromUrl(name: string, url: string, preload: boolean = true): Promise<AudioClip> {
        const clip = new AudioClip(name, { url, preload });
        
        if (preload) {
            await clip.load();
        }
        
        return clip;
    }

    public static async loadMultiple(clips: Array<{ name: string; url: string }>): Promise<AudioClip[]> {
        const loadPromises = clips.map(({ name, url }) => 
            AudioClip.loadFromUrl(name, url, true)
        );
        
        return Promise.all(loadPromises);
    }

    // Cleanup
    public destroy(): void {
        this.unload();
        this.removeAllListeners();
    }
}