import { Vector2 } from '../utils/Vector2';
import { EventEmitter } from '../utils/EventEmitter';

export interface AudioSettings {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    enableSpatialAudio: boolean;
    maxAudioSources: number;
    audioContext?: AudioContext;
}

export class AudioManager extends EventEmitter {
    private static _instance: AudioManager | null = null;
    
    private audioContext: AudioContext;
    private masterGainNode: GainNode;
    private musicGainNode: GainNode;
    private sfxGainNode: GainNode;
    
    private settings: AudioSettings;
    private activeSources: Set<AudioSource> = new Set();
    private audioClips: Map<string, AudioClip> = new Map();
    
    // Spatial audio
    private listenerPosition: Vector2 = Vector2.zero;
    private listenerOrientation: number = 0;
    
    // Performance tracking
    private maxConcurrentSources: number;
    private currentlyPlaying: number = 0;

    constructor(settings?: Partial<AudioSettings>) {
        super();
        
        this.settings = {
            masterVolume: 1.0,
            musicVolume: 0.8,
            sfxVolume: 1.0,
            enableSpatialAudio: true,
            maxAudioSources: 32,
            ...settings
        };
        
        this.maxConcurrentSources = this.settings.maxAudioSources;
        this.initializeAudioContext();
        this.setupGainNodes();
        this.setupEventListeners();
        
        // Make instance available globally for AudioClip
        if (typeof window !== 'undefined') {
            (window as any).audioManagerInstance = this;
        }
    }

    public static getInstance(): AudioManager {
        if (!AudioManager._instance) {
            AudioManager._instance = new AudioManager();
        }
        return AudioManager._instance;
    }

    public static createInstance(settings?: Partial<AudioSettings>): AudioManager {
        if (AudioManager._instance) {
            throw new Error('AudioManager instance already exists. Use AudioManager.getInstance() instead.');
        }
        
        AudioManager._instance = new AudioManager(settings);
        return AudioManager._instance;
    }

    public static get isInitialized(): boolean {
        return AudioManager._instance !== null;
    }

    private initializeAudioContext(): void {
        try {
            this.audioContext = this.settings.audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                this.resumeAudioContext();
            }
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            throw new Error('Web Audio API is not supported in this browser');
        }
    }

    private setupGainNodes(): void {
        this.masterGainNode = this.audioContext.createGain();
        this.musicGainNode = this.audioContext.createGain();
        this.sfxGainNode = this.audioContext.createGain();
        
        this.musicGainNode.connect(this.masterGainNode);
        this.sfxGainNode.connect(this.masterGainNode);
        this.masterGainNode.connect(this.audioContext.destination);
        
        this.updateVolumes();
    }

    private setupEventListeners(): void {
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        
        // Auto-resume audio context on user interaction
        const resumeAudio = () => {
            if (this.audioContext.state === 'suspended') {
                this.resumeAudioContext();
            }
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
            document.removeEventListener('touchstart', resumeAudio);
        };
        
        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);
        document.addEventListener('touchstart', resumeAudio);
    }

    private async resumeAudioContext(): Promise<void> {
        try {
            await this.audioContext.resume();
            this.emit('audioContextResumed');
        } catch (error) {
            console.error('Failed to resume audio context:', error);
        }
    }

    private updateVolumes(): void {
        this.masterGainNode.gain.value = this.settings.masterVolume;
        this.musicGainNode.gain.value = this.settings.musicVolume;
        this.sfxGainNode.gain.value = this.settings.sfxVolume;
    }

    private onVisibilityChange(): void {
        if (document.hidden) {
            this.pauseAll();
        } else {
            this.resumeAll();
        }
    }

    // Volume controls
    public setMasterVolume(volume: number): void {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.emit('volumeChanged', { type: 'master', volume: this.settings.masterVolume });
    }

    public setMusicVolume(volume: number): void {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.emit('volumeChanged', { type: 'music', volume: this.settings.musicVolume });
    }

    public setSfxVolume(volume: number): void {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.emit('volumeChanged', { type: 'sfx', volume: this.settings.sfxVolume });
    }

    public getMasterVolume(): number {
        return this.settings.masterVolume;
    }

    public getMusicVolume(): number {
        return this.settings.musicVolume;
    }

    public getSfxVolume(): number {
        return this.settings.sfxVolume;
    }

    // Audio source management
    public registerAudioSource(source: AudioSource): void {
        if (this.activeSources.size >= this.maxConcurrentSources) {
            console.warn('Maximum number of audio sources reached');
            return;
        }
        
        this.activeSources.add(source);
        this.emit('audioSourceRegistered', source);
    }

    public unregisterAudioSource(source: AudioSource): void {
        this.activeSources.delete(source);
        this.emit('audioSourceUnregistered', source);
    }

    // Audio clip management
    public registerAudioClip(name: string, clip: AudioClip): void {
        this.audioClips.set(name, clip);
        this.emit('audioClipRegistered', { name, clip });
    }

    public getAudioClip(name: string): AudioClip | null {
        return this.audioClips.get(name) || null;
    }

    public unregisterAudioClip(name: string): void {
        const clip = this.audioClips.get(name);
        if (clip) {
            this.audioClips.delete(name);
            this.emit('audioClipUnregistered', { name, clip });
        }
    }

    // Spatial audio
    public setListenerPosition(position: Vector2): void {
        this.listenerPosition = position.clone();
        this.updateSpatialAudio();
    }

    public getListenerPosition(): Vector2 {
        return this.listenerPosition.clone();
    }

    public setListenerOrientation(angle: number): void {
        this.listenerOrientation = angle;
        this.updateSpatialAudio();
    }

    public getListenerOrientation(): number {
        return this.listenerOrientation;
    }

    private updateSpatialAudio(): void {
        if (!this.settings.enableSpatialAudio) return;
        
        this.activeSources.forEach(source => {
            source.updateSpatialAudio(this.listenerPosition, this.listenerOrientation);
        });
    }

    // Global playback controls
    public pauseAll(): void {
        this.activeSources.forEach(source => {
            if (source.isPlaying()) {
                source.pause();
            }
        });
        this.emit('allAudioPaused');
    }

    public resumeAll(): void {
        this.activeSources.forEach(source => {
            if (source.isPaused()) {
                source.resume();
            }
        });
        this.emit('allAudioResumed');
    }

    public stopAll(): void {
        this.activeSources.forEach(source => {
            source.stop();
        });
        this.emit('allAudioStopped');
    }

    // Quick play methods for simple audio playback
    public playSfx(clipName: string, volume: number = 1.0, pitch: number = 1.0): AudioSource | null {
        const clip = this.getAudioClip(clipName);
        if (!clip) {
            console.warn(`Audio clip "${clipName}" not found`);
            return null;
        }
        
        const source = new AudioSource(this);
        source.setClip(clip);
        source.setVolume(volume);
        source.setPitch(pitch);
        source.setLoop(false);
        source.setAudioType('sfx');
        source.play();
        
        return source;
    }

    public playMusic(clipName: string, volume: number = 1.0, loop: boolean = true): AudioSource | null {
        const clip = this.getAudioClip(clipName);
        if (!clip) {
            console.warn(`Audio clip "${clipName}" not found`);
            return null;
        }
        
        const source = new AudioSource(this);
        source.setClip(clip);
        source.setVolume(volume);
        source.setLoop(loop);
        source.setAudioType('music');
        source.play();
        
        return source;
    }

    // System information
    public getAudioContext(): AudioContext {
        return this.audioContext;
    }

    public getMasterGainNode(): GainNode {
        return this.masterGainNode;
    }

    public getMusicGainNode(): GainNode {
        return this.musicGainNode;
    }

    public getSfxGainNode(): GainNode {
        return this.sfxGainNode;
    }

    public getActiveSourceCount(): number {
        return this.activeSources.size;
    }

    public getMaxConcurrentSources(): number {
        return this.maxConcurrentSources;
    }

    public isAudioContextReady(): boolean {
        return this.audioContext.state === 'running';
    }

    // Cleanup
    public destroy(): void {
        this.stopAll();
        this.activeSources.clear();
        this.audioClips.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.removeAllListeners();
        AudioManager._instance = null;
        
        this.emit('audioManagerDestroyed');
    }
}

// Import statements for other classes
import { AudioSource } from './AudioSource';
import { AudioClip } from './AudioClip';