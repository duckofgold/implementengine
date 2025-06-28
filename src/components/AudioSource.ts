import { Component } from '../core/Component';
import { AudioClip } from '../audio/AudioClip';
import { AudioManager } from '../audio/AudioManager';
import { AudioSource as AudioSourceCore, AudioType, AudioSourceConfig } from '../audio/AudioSource';
import { Vector2 } from '../utils/Vector2';

export class AudioSource extends Component {
    private audioSource: AudioSourceCore;
    private audioManager: AudioManager;

    constructor(config?: AudioSourceConfig) {
        super();
        
        this.audioManager = AudioManager.getInstance();
        this.audioSource = new AudioSourceCore(this.audioManager, config);
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.audioSource.on('play', () => this.emit('play'));
        this.audioSource.on('pause', () => this.emit('pause'));
        this.audioSource.on('resume', () => this.emit('resume'));
        this.audioSource.on('stop', () => this.emit('stop'));
        this.audioSource.on('ended', () => this.emit('ended'));
        this.audioSource.on('error', (error) => this.emit('error', error));
    }

    public awake(): void {
        super.awake();
        this.updateSpatialPosition();
    }

    public update(): void {
        this.updateSpatialPosition();
    }

    private updateSpatialPosition(): void {
        if (this.audioSource.getSpatialBlend() > 0) {
            const worldPosition = this.transform.getWorldPosition();
            this.audioSource.setPosition(worldPosition);
        }
    }

    // Playback controls
    public play(startTime: number = 0): void {
        this.audioSource.play(startTime);
    }

    public pause(): void {
        this.audioSource.pause();
    }

    public resume(): void {
        this.audioSource.resume();
    }

    public stop(): void {
        this.audioSource.stop();
    }

    // Properties
    public setClip(clip: AudioClip): void {
        this.audioSource.setClip(clip);
    }

    public getClip(): AudioClip | null {
        return this.audioSource.getClip();
    }

    public setVolume(volume: number): void {
        this.audioSource.setVolume(volume);
    }

    public getVolume(): number {
        return this.audioSource.getVolume();
    }

    public setPitch(pitch: number): void {
        this.audioSource.setPitch(pitch);
    }

    public getPitch(): number {
        return this.audioSource.getPitch();
    }

    public setLoop(loop: boolean): void {
        this.audioSource.setLoop(loop);
    }

    public getLoop(): boolean {
        return this.audioSource.getLoop();
    }

    public setAudioType(type: AudioType): void {
        this.audioSource.setAudioType(type);
    }

    public getAudioType(): AudioType {
        return this.audioSource.getAudioType();
    }

    // Spatial audio
    public setSpatialBlend(blend: number): void {
        this.audioSource.setSpatialBlend(blend);
        this.updateSpatialPosition();
    }

    public getSpatialBlend(): number {
        return this.audioSource.getSpatialBlend();
    }

    public setMinDistance(distance: number): void {
        this.audioSource.setMinDistance(distance);
    }

    public getMinDistance(): number {
        return this.audioSource.getMinDistance();
    }

    public setMaxDistance(distance: number): void {
        this.audioSource.setMaxDistance(distance);
    }

    public getMaxDistance(): number {
        return this.audioSource.getMaxDistance();
    }

    public setRolloffFactor(factor: number): void {
        this.audioSource.setRolloffFactor(factor);
    }

    public getRolloffFactor(): number {
        return this.audioSource.getRolloffFactor();
    }

    // State queries
    public isPlaying(): boolean {
        return this.audioSource.isPlaying();
    }

    public isPaused(): boolean {
        return this.audioSource.isPaused();
    }

    public isStopped(): boolean {
        return this.audioSource.isStopped();
    }

    public getCurrentTime(): number {
        return this.audioSource.getCurrentTime();
    }

    public getDuration(): number {
        return this.audioSource.getDuration();
    }

    public getProgress(): number {
        return this.audioSource.getProgress();
    }

    // Utility methods
    public fadeIn(duration: number = 1.0): void {
        this.audioSource.fadeIn(duration);
    }

    public fadeOut(duration: number = 1.0, stopAfterFade: boolean = true): void {
        this.audioSource.fadeOut(duration, stopAfterFade);
    }

    public crossFade(newClip: AudioClip, duration: number = 1.0): void {
        this.audioSource.crossFade(newClip, duration);
    }

    // Quick play methods
    public static playSfx(clipName: string, volume: number = 1.0, pitch: number = 1.0): AudioSourceCore | null {
        return AudioManager.getInstance().playSfx(clipName, volume, pitch);
    }

    public static playMusic(clipName: string, volume: number = 1.0, loop: boolean = true): AudioSourceCore | null {
        return AudioManager.getInstance().playMusic(clipName, volume, loop);
    }

    // Component lifecycle
    public onDestroy(): void {
        this.audioSource.destroy();
        super.onDestroy();
    }
}