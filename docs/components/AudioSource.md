# AudioSource Component Documentation

## Overview
The `AudioSource` component provides 3D positional audio playback for GameObjects. It wraps the core AudioSource functionality and automatically updates spatial positioning based on the GameObject's Transform. Supports volume, pitch, looping, spatial audio, and fade effects.

## Class Declaration
```typescript
export class AudioSource extends Component
```

## Constructor
```typescript
constructor(config?: AudioSourceConfig)
```

**Parameters:**
- `config` (AudioSourceConfig, optional): Initial configuration for the audio source

**Example:**
```typescript
// Default audio source
const audioSource = new AudioSource();

// Configured audio source
const audioSource = new AudioSource({
    volume: 0.8,
    pitch: 1.2,
    loop: true,
    audioType: AudioType.SFX,
    spatialBlend: 1.0
});
```

## Methods

### Playback Controls

#### `play(startTime: number = 0): void`
Starts playing the current audio clip from the specified time.

#### `pause(): void`
Pauses the current playback.

#### `resume(): void`
Resumes paused playback.

#### `stop(): void`
Stops playback and resets position to beginning.

**Example:**
```typescript
// Basic playback
audioSource.play();

// Play from 2 seconds in
audioSource.play(2.0);

// Pause and resume
audioSource.pause();
setTimeout(() => audioSource.resume(), 1000);

// Stop completely
audioSource.stop();
```

### Audio Clip Management

#### `setClip(clip: AudioClip): void`
Sets the audio clip to play.

#### `getClip(): AudioClip | null`
Gets the current audio clip.

**Example:**
```typescript
// Set clip
const footstepClip = await AssetLoader.loadAudio('footstep.wav');
audioSource.setClip(footstepClip);

// Get current clip
const currentClip = audioSource.getClip();
if (currentClip) {
    console.log('Playing:', currentClip.name);
}
```

### Volume and Pitch

#### `setVolume(volume: number): void`
Sets playback volume (0.0 to 1.0).

#### `getVolume(): number`
Gets current volume.

#### `setPitch(pitch: number): void`
Sets playback pitch/speed (0.5 = half speed, 2.0 = double speed).

#### `getPitch(): number`
Gets current pitch.

**Example:**
```typescript
// Set volume
audioSource.setVolume(0.7);

// Set pitch
audioSource.setPitch(1.5); // 50% faster

// Get current values
const vol = audioSource.getVolume();
const pitch = audioSource.getPitch();
```

### Looping

#### `setLoop(loop: boolean): void`
Enables or disables looping.

#### `getLoop(): boolean`
Gets current loop setting.

**Example:**
```typescript
// Enable looping for music
audioSource.setLoop(true);

// Check if looping
if (audioSource.getLoop()) {
    console.log('Audio will loop');
}
```

### Audio Type

#### `setAudioType(type: AudioType): void`
Sets the audio type for volume category management.

#### `getAudioType(): AudioType`
Gets the current audio type.

**Example:**
```typescript
// Set as music
audioSource.setAudioType(AudioType.MUSIC);

// Set as sound effect
audioSource.setAudioType(AudioType.SFX);

// Set as voice
audioSource.setAudioType(AudioType.VOICE);
```

### Spatial Audio

#### `setSpatialBlend(blend: number): void`
Sets spatial blend (0.0 = 2D audio, 1.0 = 3D audio).

#### `getSpatialBlend(): number`
Gets current spatial blend.

#### `setMinDistance(distance: number): void`
Sets minimum distance for 3D audio falloff.

#### `getMinDistance(): number`
Gets minimum distance.

#### `setMaxDistance(distance: number): void`
Sets maximum distance for 3D audio (audio inaudible beyond this).

#### `getMaxDistance(): number`
Gets maximum distance.

#### `setRolloffFactor(factor: number): void`
Sets how quickly audio fades with distance.

#### `getRolloffFactor(): number`
Gets rolloff factor.

**Example:**
```typescript
// 3D spatial audio
audioSource.setSpatialBlend(1.0);
audioSource.setMinDistance(50);   // Full volume within 50 units
audioSource.setMaxDistance(500);  // Inaudible beyond 500 units
audioSource.setRolloffFactor(1.0); // Linear falloff

// 2D non-spatial audio
audioSource.setSpatialBlend(0.0);
```

### State Queries

#### `isPlaying(): boolean`
Checks if audio is currently playing.

#### `isPaused(): boolean`
Checks if audio is paused.

#### `isStopped(): boolean`
Checks if audio is stopped.

#### `getCurrentTime(): number`
Gets current playback position in seconds.

#### `getDuration(): number`
Gets total duration of the audio clip.

#### `getProgress(): number`
Gets playback progress (0.0 to 1.0).

**Example:**
```typescript
// Check playback state
if (audioSource.isPlaying()) {
    const time = audioSource.getCurrentTime();
    const duration = audioSource.getDuration();
    const progress = audioSource.getProgress();
    
    console.log(`Playing: ${time.toFixed(1)}s / ${duration.toFixed(1)}s (${(progress * 100).toFixed(1)}%)`);
}
```

### Fade Effects

#### `fadeIn(duration: number = 1.0): void`
Fades in the audio over the specified duration.

#### `fadeOut(duration: number = 1.0, stopAfterFade: boolean = true): void`
Fades out the audio, optionally stopping after fade completes.

#### `crossFade(newClip: AudioClip, duration: number = 1.0): void`
Cross-fades from current clip to a new clip.

**Example:**
```typescript
// Fade in over 2 seconds
audioSource.fadeIn(2.0);

// Fade out over 1 second and stop
audioSource.fadeOut(1.0, true);

// Cross-fade to new music
const newMusic = await AssetLoader.loadAudio('new-track.mp3');
audioSource.crossFade(newMusic, 3.0);
```

### Static Convenience Methods

#### `static playSfx(clipName: string, volume: number = 1.0, pitch: number = 1.0): AudioSourceCore | null`
Quickly plays a sound effect by name.

#### `static playMusic(clipName: string, volume: number = 1.0, loop: boolean = true): AudioSourceCore | null`
Quickly plays music by name.

**Example:**
```typescript
// Quick sound effect
AudioSource.playSfx('explosion', 0.8);

// Quick music with custom settings
AudioSource.playMusic('background-music', 0.6, true);
```

## Events

The AudioSource emits the following events:

- `play` - When playback starts
- `pause` - When playback is paused
- `resume` - When playback resumes
- `stop` - When playback stops
- `ended` - When playback reaches the end
- `error` - When an error occurs

**Example:**
```typescript
audioSource.on('ended', () => {
    console.log('Audio finished playing');
});

audioSource.on('error', (error) => {
    console.error('Audio error:', error);
});
```

## Usage Examples

### Character Footsteps
```typescript
class CharacterFootsteps extends Component {
    private audioSource: AudioSource;
    private footstepClips: AudioClip[] = [];
    private walkSpeed: number = 100;
    private lastFootstepTime: number = 0;
    private footstepInterval: number = 0.5; // seconds
    
    start(): void {
        this.audioSource = this.addComponent(AudioSource);
        this.audioSource.setAudioType(AudioType.SFX);
        this.audioSource.setVolume(0.7);
        this.audioSource.setSpatialBlend(1.0); // 3D audio
        this.audioSource.setMinDistance(20);
        this.audioSource.setMaxDistance(200);
        
        this.loadFootstepSounds();
    }
    
    private async loadFootstepSounds(): Promise<void> {
        this.footstepClips = [
            await AssetLoader.loadAudio('footstep1.wav'),
            await AssetLoader.loadAudio('footstep2.wav'),
            await AssetLoader.loadAudio('footstep3.wav'),
            await AssetLoader.loadAudio('footstep4.wav')
        ];
    }
    
    update(): void {
        const rigidbody = this.getComponent(Rigidbody2D);
        if (rigidbody && rigidbody.getIsGrounded()) {
            const speed = rigidbody.velocity.magnitude();
            
            if (speed > 10) { // Moving
                const currentTime = Time.time;
                
                // Adjust footstep rate based on speed
                const speedFactor = speed / this.walkSpeed;
                const adjustedInterval = this.footstepInterval / speedFactor;
                
                if (currentTime - this.lastFootstepTime >= adjustedInterval) {
                    this.playFootstep(speedFactor);
                    this.lastFootstepTime = currentTime;
                }
            }
        }
    }
    
    private playFootstep(speedFactor: number): void {
        if (this.footstepClips.length === 0) return;
        
        // Random footstep sound
        const randomClip = this.footstepClips[Math.floor(Math.random() * this.footstepClips.length)];
        this.audioSource.setClip(randomClip);
        
        // Adjust pitch based on speed
        const pitch = 0.8 + (speedFactor * 0.4); // 0.8 to 1.2 range
        this.audioSource.setPitch(pitch);
        
        this.audioSource.play();
    }
}
```

### Ambient Sound Zone
```typescript
class AmbientSoundZone extends Component {
    private audioSource: AudioSource;
    private ambientClip: AudioClip | null = null;
    private maxVolume: number = 0.5;
    private fadeDistance: number = 100;
    private player: GameObject | null = null;
    
    start(): void {
        this.audioSource = this.addComponent(AudioSource);
        this.audioSource.setAudioType(AudioType.AMBIENT);
        this.audioSource.setLoop(true);
        this.audioSource.setSpatialBlend(1.0);
        this.audioSource.setMinDistance(50);
        this.audioSource.setMaxDistance(300);
        this.audioSource.setVolume(0);
        
        this.player = this.scene.findGameObject('Player');
        this.loadAmbientSound();
        
        // Add trigger zone
        const collider = this.addComponent(CircleCollider2D);
        collider.setRadius(this.fadeDistance);
        collider.isTrigger = true;
        
        this.scene.on('triggerEnter2D', this.onPlayerEnter.bind(this));
        this.scene.on('triggerExit2D', this.onPlayerExit.bind(this));
    }
    
    private async loadAmbientSound(): Promise<void> {
        this.ambientClip = await AssetLoader.loadAudio('forest-ambience.ogg');
        this.audioSource.setClip(this.ambientClip);
        this.audioSource.play();
    }
    
    private onPlayerEnter(event: any): void {
        if (event.otherGameObject === this.player) {
            this.audioSource.fadeIn(2.0);
        }
    }
    
    private onPlayerExit(event: any): void {
        if (event.otherGameObject === this.player) {
            this.audioSource.fadeOut(2.0, false); // Fade but keep playing
        }
    }
    
    update(): void {
        if (!this.player) return;
        
        // Adjust volume based on distance
        const distance = this.transform.position.distance(this.player.transform.position);
        const volumeFactor = Math.max(0, 1 - (distance / this.fadeDistance));
        const targetVolume = this.maxVolume * volumeFactor;
        
        this.audioSource.setVolume(targetVolume);
    }
}
```

### Interactive Music System
```typescript
class DynamicMusicPlayer extends Component {
    private audioSources: AudioSource[] = [];
    private musicLayers: Map<string, AudioClip> = new Map();
    private currentLayers: Set<string> = new Set();
    private baseVolume: number = 0.8;
    private crossfadeDuration: number = 2.0;
    
    start(): void {
        this.loadMusicLayers();
        this.setupAudioSources();
    }
    
    private async loadMusicLayers(): Promise<void> {
        const layers = [
            { name: 'base', file: 'music-base.ogg' },
            { name: 'combat', file: 'music-combat.ogg' },
            { name: 'tension', file: 'music-tension.ogg' },
            { name: 'victory', file: 'music-victory.ogg' }
        ];
        
        for (const layer of layers) {
            const clip = await AssetLoader.loadAudio(layer.file);
            this.musicLayers.set(layer.name, clip);
        }
    }
    
    private setupAudioSources(): void {
        // Create audio source for each layer
        this.musicLayers.forEach((clip, layerName) => {
            const audioSource = this.addComponent(AudioSource);
            audioSource.setClip(clip);
            audioSource.setAudioType(AudioType.MUSIC);
            audioSource.setLoop(true);
            audioSource.setSpatialBlend(0); // 2D music
            audioSource.setVolume(0); // Start silent
            
            this.audioSources.push(audioSource);
            
            // Play all layers (they stay in sync)
            audioSource.play();
        });
    }
    
    public addLayer(layerName: string): void {
        if (this.musicLayers.has(layerName) && !this.currentLayers.has(layerName)) {
            this.currentLayers.add(layerName);
            
            const layerIndex = Array.from(this.musicLayers.keys()).indexOf(layerName);
            const audioSource = this.audioSources[layerIndex];
            
            audioSource.fadeIn(this.crossfadeDuration);
        }
    }
    
    public removeLayer(layerName: string): void {
        if (this.currentLayers.has(layerName)) {
            this.currentLayers.delete(layerName);
            
            const layerIndex = Array.from(this.musicLayers.keys()).indexOf(layerName);
            const audioSource = this.audioSources[layerIndex];
            
            audioSource.fadeOut(this.crossfadeDuration, false);
        }
    }
    
    public setMoodState(mood: 'peaceful' | 'tense' | 'combat' | 'victory'): void {
        // Clear all layers first
        this.currentLayers.clear();
        this.audioSources.forEach(source => source.fadeOut(0.5, false));
        
        // Add appropriate layers
        switch (mood) {
            case 'peaceful':
                this.addLayer('base');
                break;
            case 'tense':
                this.addLayer('base');
                this.addLayer('tension');
                break;
            case 'combat':
                this.addLayer('base');
                this.addLayer('combat');
                break;
            case 'victory':
                this.addLayer('victory');
                break;
        }
    }
}
```

### Sound Effect Manager
```typescript
class SfxManager extends Component {
    private poolSize: number = 10;
    private audioSources: AudioSource[] = [];
    private nextSourceIndex: number = 0;
    
    start(): void {
        // Create pool of audio sources
        for (let i = 0; i < this.poolSize; i++) {
            const audioSource = this.addComponent(AudioSource);
            audioSource.setAudioType(AudioType.SFX);
            audioSource.setSpatialBlend(0); // 2D audio for UI sounds
            this.audioSources.push(audioSource);
        }
    }
    
    public playSound(clipName: string, volume: number = 1.0, pitch: number = 1.0): void {
        AssetLoader.loadAudio(clipName).then(clip => {
            const audioSource = this.getNextAudioSource();
            audioSource.setClip(clip);
            audioSource.setVolume(volume);
            audioSource.setPitch(pitch);
            audioSource.play();
        });
    }
    
    public playSoundAtPosition(clipName: string, position: Vector2, volume: number = 1.0): void {
        AssetLoader.loadAudio(clipName).then(clip => {
            // Create temporary audio source at position
            const tempObject = new GameObject('TempAudio');
            tempObject.transform.position = position;
            
            const audioSource = tempObject.addComponent(AudioSource);
            audioSource.setClip(clip);
            audioSource.setVolume(volume);
            audioSource.setSpatialBlend(1.0); // 3D audio
            audioSource.setMinDistance(30);
            audioSource.setMaxDistance(200);
            
            // Destroy after playing
            audioSource.on('ended', () => {
                tempObject.destroy();
            });
            
            audioSource.play();
            this.scene.addGameObject(tempObject);
        });
    }
    
    public playRandomPitch(clipName: string, pitchMin: number = 0.8, pitchMax: number = 1.2): void {
        const pitch = pitchMin + Math.random() * (pitchMax - pitchMin);
        this.playSound(clipName, 1.0, pitch);
    }
    
    private getNextAudioSource(): AudioSource {
        const audioSource = this.audioSources[this.nextSourceIndex];
        this.nextSourceIndex = (this.nextSourceIndex + 1) % this.poolSize;
        
        // Stop any currently playing sound on this source
        if (audioSource.isPlaying()) {
            audioSource.stop();
        }
        
        return audioSource;
    }
    
    public stopAllSounds(): void {
        this.audioSources.forEach(source => source.stop());
    }
    
    public pauseAllSounds(): void {
        this.audioSources.forEach(source => {
            if (source.isPlaying()) {
                source.pause();
            }
        });
    }
    
    public resumeAllSounds(): void {
        this.audioSources.forEach(source => {
            if (source.isPaused()) {
                source.resume();
            }
        });
    }
}
```

### Dialogue System Audio
```typescript
class DialogueAudio extends Component {
    private voiceSource: AudioSource;
    private typingSource: AudioSource;
    private characterVoices: Map<string, AudioClip[]> = new Map();
    
    start(): void {
        // Voice audio source
        this.voiceSource = this.addComponent(AudioSource);
        this.voiceSource.setAudioType(AudioType.VOICE);
        this.voiceSource.setSpatialBlend(0);
        
        // Typing sound source
        this.typingSource = this.addComponent(AudioSource);
        this.typingSource.setAudioType(AudioType.SFX);
        this.typingSource.setSpatialBlend(0);
        this.typingSource.setVolume(0.3);
        
        this.loadCharacterVoices();
        this.loadTypingSounds();
    }
    
    private async loadCharacterVoices(): Promise<void> {
        const characters = ['hero', 'villain', 'npc'];
        
        for (const character of characters) {
            const voices: AudioClip[] = [];
            for (let i = 1; i <= 5; i++) {
                const clip = await AssetLoader.loadAudio(`voice-${character}-${i}.wav`);
                voices.push(clip);
            }
            this.characterVoices.set(character, voices);
        }
    }
    
    private async loadTypingSounds(): Promise<void> {
        const typingClip = await AssetLoader.loadAudio('typing.wav');
        this.typingSource.setClip(typingClip);
        this.typingSource.setLoop(true);
    }
    
    public startDialogue(characterName: string, text: string): void {
        this.playCharacterVoice(characterName);
        this.startTypingSound();
        
        // Stop typing sound when text is fully displayed
        setTimeout(() => {
            this.stopTypingSound();
        }, text.length * 50); // Approximate typing duration
    }
    
    private playCharacterVoice(characterName: string): void {
        const voices = this.characterVoices.get(characterName);
        if (voices && voices.length > 0) {
            const randomVoice = voices[Math.floor(Math.random() * voices.length)];
            this.voiceSource.setClip(randomVoice);
            
            // Vary pitch slightly for different lines
            const pitch = 0.9 + Math.random() * 0.2;
            this.voiceSource.setPitch(pitch);
            
            this.voiceSource.play();
        }
    }
    
    private startTypingSound(): void {
        if (!this.typingSource.isPlaying()) {
            this.typingSource.play();
        }
    }
    
    private stopTypingSound(): void {
        this.typingSource.stop();
    }
    
    public skipDialogue(): void {
        this.voiceSource.stop();
        this.stopTypingSound();
    }
}
```

## Performance Considerations

- Spatial audio updates position every frame when spatialBlend > 0
- Multiple AudioSource components share the same AudioManager
- Audio sources are automatically cleaned up on component destruction
- Use object pooling for frequently played short sounds
- Spatial audio calculations are more expensive than 2D audio

## Common Errors

### ❌ Forgetting to Set Clip
```typescript
// WRONG - No clip set
audioSource.play(); // Nothing will play

// CORRECT - Set clip first
audioSource.setClip(audioClip);
audioSource.play();
```

### ❌ Spatial Audio Without Movement Updates
```typescript
// WRONG - Spatial audio but position never updates
audioSource.setSpatialBlend(1.0);
// Position will be stuck at creation time

// CORRECT - AudioSource component automatically updates position
// Or manually update if using core AudioSourceCore
```

### ❌ Volume Out of Range
```typescript
// WRONG - Volume outside valid range
audioSource.setVolume(1.5); // May be clamped or cause issues
audioSource.setVolume(-0.2); // Negative volume

// CORRECT - Keep volume in 0.0 to 1.0 range
audioSource.setVolume(Math.max(0, Math.min(1, volume)));
```

### ❌ Memory Leaks with Event Listeners
```typescript
// WRONG - Not cleaning up event listeners
audioSource.on('ended', someCallback);
// If component is destroyed, listener may persist

// CORRECT - Component automatically cleans up on destroy
// Or manually remove listeners if needed
audioSource.off('ended', someCallback);
```

## Integration Points

- **AudioManager**: Provides global audio management and loading
- **AudioClip**: Audio data containers loaded through AssetLoader
- **Transform**: Position automatically synced for spatial audio
- **Core AudioSource**: Wrapped core audio functionality
- **EventEmitter**: Provides audio playback events