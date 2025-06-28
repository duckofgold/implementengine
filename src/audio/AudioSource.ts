import { Vector2 } from '../utils/Vector2';
import { EventEmitter } from '../utils/EventEmitter';
import { AudioClip } from './AudioClip';
import { AudioManager } from './AudioManager';

export type AudioType = 'sfx' | 'music';

export interface AudioSourceConfig {
    volume?: number;
    pitch?: number;
    loop?: boolean;
    autoPlay?: boolean;
    audioType?: AudioType;
    spatialBlend?: number; // 0 = 2D, 1 = 3D
    minDistance?: number;
    maxDistance?: number;
    rolloffFactor?: number;
}

export class AudioSource extends EventEmitter {
    private audioManager: AudioManager;
    private audioClip: AudioClip | null = null;
    private sourceNode: AudioBufferSourceNode | null = null;
    private gainNode: GainNode;
    private pannerNode: PannerNode | null = null;
    
    // State
    private isCurrentlyPlaying: boolean = false;
    private isCurrentlyPaused: boolean = false;
    private startTime: number = 0;
    private pauseTime: number = 0;
    private playbackPosition: number = 0;
    
    // Settings
    private volume: number = 1.0;
    private pitch: number = 1.0;
    private loop: boolean = false;
    private autoPlay: boolean = false;
    private audioType: AudioType = 'sfx';
    
    // Spatial audio properties
    private spatialBlend: number = 0; // 0 = 2D, 1 = 3D
    private position: Vector2 = Vector2.zero;
    private minDistance: number = 1;
    private maxDistance: number = 100;
    private rolloffFactor: number = 1;
    
    // Callbacks
    private onEndedCallback: (() => void) | null = null;

    constructor(audioManager: AudioManager, config?: AudioSourceConfig) {
        super();
        
        this.audioManager = audioManager;
        
        if (config) {
            this.volume = config.volume ?? 1.0;
            this.pitch = config.pitch ?? 1.0;
            this.loop = config.loop ?? false;
            this.autoPlay = config.autoPlay ?? false;
            this.audioType = config.audioType ?? 'sfx';
            this.spatialBlend = config.spatialBlend ?? 0;
            this.minDistance = config.minDistance ?? 1;
            this.maxDistance = config.maxDistance ?? 100;
            this.rolloffFactor = config.rolloffFactor ?? 1;
        }
        
        this.setupAudioNodes();
        this.audioManager.registerAudioSource(this);
    }

    private setupAudioNodes(): void {
        const audioContext = this.audioManager.getAudioContext();
        
        // Create gain node for volume control
        this.gainNode = audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        
        // Create panner node for spatial audio if needed
        if (this.spatialBlend > 0) {
            this.createPannerNode();
        }
        
        // Connect to appropriate output
        this.connectToOutput();
    }

    private createPannerNode(): void {
        const audioContext = this.audioManager.getAudioContext();
        
        this.pannerNode = audioContext.createPanner();
        this.pannerNode.panningModel = 'HRTF';
        this.pannerNode.distanceModel = 'inverse';
        this.pannerNode.refDistance = this.minDistance;
        this.pannerNode.maxDistance = this.maxDistance;
        this.pannerNode.rolloffFactor = this.rolloffFactor;
        
        // Set initial position
        this.updatePannerPosition();
    }

    private connectToOutput(): void {
        let outputNode: AudioNode = this.gainNode;
        
        // Connect spatial audio if enabled
        if (this.pannerNode && this.spatialBlend > 0) {
            this.gainNode.connect(this.pannerNode);
            outputNode = this.pannerNode;
        }
        
        // Connect to appropriate mixer channel
        if (this.audioType === 'music') {
            outputNode.connect(this.audioManager.getMusicGainNode());
        } else {
            outputNode.connect(this.audioManager.getSfxGainNode());
        }
    }

    private updatePannerPosition(): void {
        if (!this.pannerNode) return;
        
        // Convert 2D position to 3D space (Y becomes Z, X stays X, Y becomes 0)
        this.pannerNode.positionX.value = this.position.x;
        this.pannerNode.positionY.value = 0;
        this.pannerNode.positionZ.value = this.position.y;
    }

    // Playback control
    public play(startTime: number = 0): void {
        if (!this.audioClip || !this.audioClip.isReady()) {
            console.warn('Cannot play: audio clip not ready');
            return;
        }
        
        this.stop(); // Stop any current playback
        
        try {
            this.sourceNode = this.audioClip.createAudioBufferSourceNode();
            this.sourceNode.playbackRate.value = this.pitch;
            this.sourceNode.loop = this.loop;
            
            // Connect source to gain node
            this.sourceNode.connect(this.gainNode);
            
            // Set up ended callback
            this.onEndedCallback = () => {
                this.onPlaybackEnded();
            };
            this.sourceNode.addEventListener('ended', this.onEndedCallback);
            
            // Start playback
            this.playbackPosition = startTime;
            this.sourceNode.start(0, startTime);
            this.startTime = this.audioManager.getAudioContext().currentTime - startTime;
            
            this.isCurrentlyPlaying = true;
            this.isCurrentlyPaused = false;
            
            this.emit('play');
            
        } catch (error) {
            console.error('Failed to play audio:', error);
            this.emit('error', error);
        }
    }

    public pause(): void {
        if (!this.isCurrentlyPlaying || this.isCurrentlyPaused) return;
        
        this.pauseTime = this.audioManager.getAudioContext().currentTime;
        this.playbackPosition = this.getCurrentTime();
        
        this.stop();
        this.isCurrentlyPaused = true;
        this.emit('pause');
    }

    public resume(): void {
        if (!this.isCurrentlyPaused) return;
        
        this.play(this.playbackPosition);
        this.isCurrentlyPaused = false;
        this.emit('resume');
    }

    public stop(): void {
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
            } catch (error) {
                // Source might already be stopped
            }
            
            if (this.onEndedCallback) {
                this.sourceNode.removeEventListener('ended', this.onEndedCallback);
                this.onEndedCallback = null;
            }
            
            this.sourceNode = null;
        }
        
        this.isCurrentlyPlaying = false;
        this.isCurrentlyPaused = false;
        this.playbackPosition = 0;
        
        this.emit('stop');
    }

    private onPlaybackEnded(): void {
        this.isCurrentlyPlaying = false;
        this.isCurrentlyPaused = false;
        this.playbackPosition = 0;
        this.sourceNode = null;
        
        this.emit('ended');
    }

    // Properties
    public setClip(clip: AudioClip): void {
        this.stop();
        this.audioClip = clip;
        
        if (this.autoPlay && clip.isReady()) {
            this.play();
        }
        
        this.emit('clipChanged', clip);
    }

    public getClip(): AudioClip | null {
        return this.audioClip;
    }

    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.gainNode.gain.value = this.volume;
        this.emit('volumeChanged', this.volume);
    }

    public getVolume(): number {
        return this.volume;
    }

    public setPitch(pitch: number): void {
        this.pitch = Math.max(0.25, Math.min(4, pitch)); // Reasonable pitch range
        
        if (this.sourceNode) {
            this.sourceNode.playbackRate.value = this.pitch;
        }
        
        this.emit('pitchChanged', this.pitch);
    }

    public getPitch(): number {
        return this.pitch;
    }

    public setLoop(loop: boolean): void {
        this.loop = loop;
        
        if (this.sourceNode) {
            this.sourceNode.loop = this.loop;
        }
        
        this.emit('loopChanged', this.loop);
    }

    public getLoop(): boolean {
        return this.loop;
    }

    public setAudioType(type: AudioType): void {
        this.audioType = type;
        
        // Reconnect to appropriate output
        this.connectToOutput();
        
        this.emit('audioTypeChanged', this.audioType);
    }

    public getAudioType(): AudioType {
        return this.audioType;
    }

    // Spatial audio
    public setSpatialBlend(blend: number): void {
        this.spatialBlend = Math.max(0, Math.min(1, blend));
        
        if (this.spatialBlend > 0 && !this.pannerNode) {
            this.createPannerNode();
            this.connectToOutput();
        } else if (this.spatialBlend === 0 && this.pannerNode) {
            this.pannerNode = null;
            this.connectToOutput();
        }
        
        this.emit('spatialBlendChanged', this.spatialBlend);
    }

    public getSpatialBlend(): number {
        return this.spatialBlend;
    }

    public setPosition(position: Vector2): void {
        this.position = position.clone();
        this.updatePannerPosition();
        this.emit('positionChanged', this.position);
    }

    public getPosition(): Vector2 {
        return this.position.clone();
    }

    public setMinDistance(distance: number): void {
        this.minDistance = Math.max(0.1, distance);
        
        if (this.pannerNode) {
            this.pannerNode.refDistance = this.minDistance;
        }
        
        this.emit('minDistanceChanged', this.minDistance);
    }

    public getMinDistance(): number {
        return this.minDistance;
    }

    public setMaxDistance(distance: number): void {
        this.maxDistance = Math.max(this.minDistance, distance);
        
        if (this.pannerNode) {
            this.pannerNode.maxDistance = this.maxDistance;
        }
        
        this.emit('maxDistanceChanged', this.maxDistance);
    }

    public getMaxDistance(): number {
        return this.maxDistance;
    }

    public setRolloffFactor(factor: number): void {
        this.rolloffFactor = Math.max(0, factor);
        
        if (this.pannerNode) {
            this.pannerNode.rolloffFactor = this.rolloffFactor;
        }
        
        this.emit('rolloffFactorChanged', this.rolloffFactor);
    }

    public getRolloffFactor(): number {
        return this.rolloffFactor;
    }

    // Spatial audio update (called by AudioManager)
    public updateSpatialAudio(listenerPosition: Vector2, listenerOrientation: number): void {
        if (!this.pannerNode || this.spatialBlend === 0) return;
        
        // Update listener position and orientation
        const audioContext = this.audioManager.getAudioContext();
        const listener = audioContext.listener;
        
        if (listener.positionX) {
            // Modern API
            listener.positionX.value = listenerPosition.x;
            listener.positionY.value = 0;
            listener.positionZ.value = listenerPosition.y;
            
            // Set listener orientation (forward and up vectors)
            const forward = Vector2.fromAngle(listenerOrientation);
            listener.forwardX.value = forward.x;
            listener.forwardY.value = 0;
            listener.forwardZ.value = forward.y;
            
            listener.upX.value = 0;
            listener.upY.value = 1;
            listener.upZ.value = 0;
        } else {
            // Legacy API
            (listener as any).setPosition(listenerPosition.x, 0, listenerPosition.y);
            
            const forward = Vector2.fromAngle(listenerOrientation);
            (listener as any).setOrientation(forward.x, 0, forward.y, 0, 1, 0);
        }
    }

    // State queries
    public isPlaying(): boolean {
        return this.isCurrentlyPlaying;
    }

    public isPaused(): boolean {
        return this.isCurrentlyPaused;
    }

    public isStopped(): boolean {
        return !this.isCurrentlyPlaying && !this.isCurrentlyPaused;
    }

    public getCurrentTime(): number {
        if (!this.isCurrentlyPlaying || !this.audioClip) return 0;
        
        const audioContext = this.audioManager.getAudioContext();
        const elapsed = audioContext.currentTime - this.startTime;
        
        return Math.min(elapsed, this.audioClip.getDuration());
    }

    public getDuration(): number {
        return this.audioClip?.getDuration() || 0;
    }

    public getProgress(): number {
        const duration = this.getDuration();
        if (duration === 0) return 0;
        
        return this.getCurrentTime() / duration;
    }

    // Utility methods
    public fadeIn(duration: number = 1.0): void {
        if (!this.isCurrentlyPlaying) {
            this.setVolume(0);
            this.play();
        }
        
        const audioContext = this.audioManager.getAudioContext();
        const targetVolume = this.volume;
        
        this.gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + duration);
        
        this.emit('fadeIn', duration);
    }

    public fadeOut(duration: number = 1.0, stopAfterFade: boolean = true): void {
        if (!this.isCurrentlyPlaying) return;
        
        const audioContext = this.audioManager.getAudioContext();
        const currentVolume = this.gainNode.gain.value;
        
        this.gainNode.gain.setValueAtTime(currentVolume, audioContext.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        if (stopAfterFade) {
            setTimeout(() => {
                this.stop();
                this.gainNode.gain.value = this.volume; // Restore original volume
            }, duration * 1000);
        }
        
        this.emit('fadeOut', duration);
    }

    public crossFade(newClip: AudioClip, duration: number = 1.0): void {
        this.fadeOut(duration, false);
        
        setTimeout(() => {
            this.setClip(newClip);
            this.fadeIn(duration);
        }, duration * 500); // Start new clip halfway through fade
        
        this.emit('crossFade', { newClip, duration });
    }

    // Cleanup
    public destroy(): void {
        this.stop();
        this.audioManager.unregisterAudioSource(this);
        
        if (this.gainNode) {
            this.gainNode.disconnect();
        }
        
        if (this.pannerNode) {
            this.pannerNode.disconnect();
        }
        
        this.removeAllListeners();
        this.emit('destroyed');
    }
}