# AudioManager Class Documentation

## Overview
The `AudioManager` class is the central singleton responsible for managing all audio functionality in ImplementEngine. It provides Web Audio API initialization, volume controls, spatial audio support, audio source management, and convenient playback methods. The AudioManager handles audio context lifecycle, gain node hierarchies, and coordinates between AudioClip and AudioSource instances.

## Class Declaration
```typescript
export class AudioManager extends EventEmitter
```

## Interfaces

### AudioSettings Interface
```typescript
interface AudioSettings {
    masterVolume: number;               // Overall volume level (0.0 to 1.0)
    musicVolume: number;               // Background music volume (0.0 to 1.0)
    sfxVolume: number;                 // Sound effects volume (0.0 to 1.0)
    enableSpatialAudio: boolean;       // Enable 3D positional audio
    maxAudioSources: number;           // Maximum concurrent audio sources
    audioContext?: AudioContext;       // Custom AudioContext (optional)
}
```

## Constructor and Singleton Pattern

### Private Constructor
```typescript
constructor(settings?: Partial<AudioSettings>)
```

### Static Methods

#### `static getInstance(): AudioManager`
Gets the singleton AudioManager instance, creating it if necessary.

#### `static createInstance(settings?: Partial<AudioSettings>): AudioManager`
Creates the singleton instance with specific settings. Throws error if instance already exists.

#### `static get isInitialized(): boolean`
Returns true if AudioManager has been initialized.

**Example:**
```typescript
// Initialize with custom settings
const audioManager = AudioManager.createInstance({
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 1.0,
    enableSpatialAudio: true,
    maxAudioSources: 64
});

// Get existing instance
const manager = AudioManager.getInstance();

// Check if initialized
if (AudioManager.isInitialized) {
    console.log('Audio system ready');
}
```

## Properties and State

### Volume Controls

#### `setMasterVolume(volume: number): void`
Sets the master volume level (affects all audio).

#### `setMusicVolume(volume: number): void`
Sets the music-specific volume level.

#### `setSfxVolume(volume: number): void`
Sets the sound effects volume level.

#### `getMasterVolume(): number`
Returns current master volume.

#### `getMusicVolume(): number`
Returns current music volume.

#### `getSfxVolume(): number`
Returns current sound effects volume.

**Example:**
```typescript
// Set volumes
audioManager.setMasterVolume(0.8);
audioManager.setMusicVolume(0.4);
audioManager.setSfxVolume(0.9);

// Get current volumes
const volumes = {
    master: audioManager.getMasterVolume(),
    music: audioManager.getMusicVolume(),
    sfx: audioManager.getSfxVolume()
};

console.log('Current volumes:', volumes);
```

### Audio Context and Nodes

#### `getAudioContext(): AudioContext`
Returns the Web Audio API AudioContext.

#### `getMasterGainNode(): GainNode`
Returns the master gain node (all audio flows through this).

#### `getMusicGainNode(): GainNode`
Returns the music gain node.

#### `getSfxGainNode(): GainNode`
Returns the sound effects gain node.

#### `isAudioContextReady(): boolean`
Returns true if AudioContext is running (not suspended).

**Example:**
```typescript
// Access Web Audio API directly
const audioContext = audioManager.getAudioContext();
const masterGain = audioManager.getMasterGainNode();

// Check audio context state
if (audioManager.isAudioContextReady()) {
    console.log('Audio context is running');
} else {
    console.log('Audio context suspended (user interaction needed)');
}
```

## Audio Source Management

### Registration

#### `registerAudioSource(source: AudioSource): void`
Registers an audio source for management.

#### `unregisterAudioSource(source: AudioSource): void`
Unregisters an audio source.

#### `getActiveSourceCount(): number`
Returns the number of currently active audio sources.

#### `getMaxConcurrentSources(): number`
Returns the maximum allowed concurrent sources.

**Example:**
```typescript
// Check audio source limits
const activeCount = audioManager.getActiveSourceCount();
const maxCount = audioManager.getMaxConcurrentSources();

console.log(`Audio sources: ${activeCount}/${maxCount}`);

if (activeCount >= maxCount) {
    console.warn('Audio source limit reached');
}
```

## Audio Clip Management

### Registration and Access

#### `registerAudioClip(name: string, clip: AudioClip): void`
Registers an audio clip for centralized access.

#### `getAudioClip(name: string): AudioClip | null`
Retrieves a registered audio clip by name.

#### `unregisterAudioClip(name: string): void`
Unregisters an audio clip.

**Example:**
```typescript
// Register audio clips
const explosionClip = new AudioClip('explosion', { url: 'explosion.wav' });
await explosionClip.load();
audioManager.registerAudioClip('explosion', explosionClip);

// Access registered clips
const clip = audioManager.getAudioClip('explosion');
if (clip) {
    console.log('Explosion clip ready for playback');
}

// Clean up
audioManager.unregisterAudioClip('explosion');
```

## Spatial Audio

### Listener Management

#### `setListenerPosition(position: Vector2): void`
Sets the listener position for spatial audio calculations.

#### `getListenerPosition(): Vector2`
Returns the current listener position.

#### `setListenerOrientation(angle: number): void`
Sets the listener orientation angle in radians.

#### `getListenerOrientation(): number`
Returns the current listener orientation.

**Example:**
```typescript
// Update listener position (typically camera position)
const cameraPosition = camera.getPosition();
audioManager.setListenerPosition(cameraPosition);

// Set listener orientation (direction camera is facing)
const cameraAngle = camera.getRotation();
audioManager.setListenerOrientation(cameraAngle);

// Get current listener state
const listenerPos = audioManager.getListenerPosition();
const listenerAngle = audioManager.getListenerOrientation();
```

## Global Playback Controls

### Mass Control

#### `pauseAll(): void`
Pauses all currently playing audio sources.

#### `resumeAll(): void`
Resumes all paused audio sources.

#### `stopAll(): void`
Stops all audio sources.

**Example:**
```typescript
// Game pause functionality
class GameStateManager {
    public pauseGame(): void {
        Time.setTimeScale(0);
        AudioManager.getInstance().pauseAll();
    }
    
    public resumeGame(): void {
        Time.setTimeScale(1);
        AudioManager.getInstance().resumeAll();
    }
    
    public gameOver(): void {
        AudioManager.getInstance().stopAll();
    }
}
```

## Quick Playback Methods

### Convenience Functions

#### `playSfx(clipName: string, volume: number = 1.0, pitch: number = 1.0): AudioSource | null`
Creates and plays a sound effect immediately.

#### `playMusic(clipName: string, volume: number = 1.0, loop: boolean = true): AudioSource | null`
Creates and plays background music immediately.

**Example:**
```typescript
// Simple sound effect playback
audioManager.playSfx('explosion', 0.8, 1.2); // 80% volume, 120% pitch

// Background music playback
const musicSource = audioManager.playMusic('level1_bg', 0.4, true);

// Control the music source
if (musicSource) {
    musicSource.setVolume(0.2); // Fade to 20% volume
}
```

## Events

The AudioManager emits the following events:

- `audioContextResumed` - Audio context resumed from suspended state
- `volumeChanged` - Volume level changed (includes type and new value)
- `audioSourceRegistered` - New audio source registered
- `audioSourceUnregistered` - Audio source unregistered
- `audioClipRegistered` - New audio clip registered
- `audioClipUnregistered` - Audio clip unregistered
- `allAudioPaused` - All audio sources paused
- `allAudioResumed` - All audio sources resumed
- `allAudioStopped` - All audio sources stopped
- `audioManagerDestroyed` - AudioManager is being destroyed

**Example:**
```typescript
const audioManager = AudioManager.getInstance();

audioManager.on('volumeChanged', (event) => {
    console.log(`${event.type} volume changed to ${event.volume}`);
    updateVolumeSliders(event.type, event.volume);
});

audioManager.on('audioContextResumed', () => {
    console.log('Audio context resumed - audio is now available');
    hideAudioDisabledWarning();
});

audioManager.on('allAudioPaused', () => {
    console.log('All audio paused');
});
```

## Usage Examples

### Complete Audio System Setup
```typescript
class AudioSystem {
    private audioManager: AudioManager;
    private audioClips: Map<string, AudioClip> = new Map();
    
    public async initialize(): Promise<void> {
        // Initialize AudioManager with settings
        this.audioManager = AudioManager.createInstance({
            masterVolume: 0.8,
            musicVolume: 0.6,
            sfxVolume: 1.0,
            enableSpatialAudio: true,
            maxAudioSources: 32
        });
        
        // Load audio assets
        await this.loadAudioAssets();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        console.log('Audio system initialized');
    }
    
    private async loadAudioAssets(): Promise<void> {
        const audioAssets = [
            { name: 'bg_music', url: 'music/background.mp3', type: 'music' },
            { name: 'explosion', url: 'sfx/explosion.wav', type: 'sfx' },
            { name: 'jump', url: 'sfx/jump.wav', type: 'sfx' },
            { name: 'collect', url: 'sfx/collect.wav', type: 'sfx' },
            { name: 'menu_click', url: 'ui/click.wav', type: 'ui' }
        ];
        
        const loadPromises = audioAssets.map(async (asset) => {
            try {
                const clip = new AudioClip(asset.name, {
                    url: asset.url,
                    preload: true,
                    volume: asset.type === 'music' ? 0.8 : 1.0,
                    loop: asset.type === 'music'
                });
                
                await clip.load();
                this.audioClips.set(asset.name, clip);
                this.audioManager.registerAudioClip(asset.name, clip);
                
                console.log(`Loaded: ${asset.name}`);
            } catch (error) {
                console.error(`Failed to load ${asset.name}:`, error);
            }
        });
        
        await Promise.all(loadPromises);
    }
    
    private setupEventHandlers(): void {
        this.audioManager.on('volumeChanged', (event) => {
            this.saveVolumeSettings(event.type, event.volume);
        });
        
        // Handle browser visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.audioManager.pauseAll();
            } else {
                this.audioManager.resumeAll();
            }
        });
    }
    
    private saveVolumeSettings(type: string, volume: number): void {
        localStorage.setItem(`volume_${type}`, volume.toString());
    }
    
    public playSound(name: string, volume?: number, pitch?: number): AudioSource | null {
        return this.audioManager.playSfx(name, volume, pitch);
    }
    
    public playMusic(name: string, volume?: number): AudioSource | null {
        return this.audioManager.playMusic(name, volume);
    }
    
    public destroy(): void {
        this.audioClips.forEach(clip => clip.destroy());
        this.audioClips.clear();
        this.audioManager.destroy();
    }
}

// Usage
const audioSystem = new AudioSystem();
await audioSystem.initialize();

// Play sounds
audioSystem.playSound('explosion', 0.8);
audioSystem.playMusic('bg_music', 0.4);
```

### Dynamic Volume Control UI
```typescript
class AudioControlsUI {
    private audioManager: AudioManager;
    private sliders: { [key: string]: HTMLInputElement } = {};
    
    constructor() {
        this.audioManager = AudioManager.getInstance();
        this.createVolumeControls();
        this.setupEventListeners();
    }
    
    private createVolumeControls(): void {
        const container = document.getElementById('audio-controls');
        if (!container) return;
        
        const volumeTypes = [
            { key: 'master', label: 'Master Volume', getValue: () => this.audioManager.getMasterVolume() },
            { key: 'music', label: 'Music Volume', getValue: () => this.audioManager.getMusicVolume() },
            { key: 'sfx', label: 'SFX Volume', getValue: () => this.audioManager.getSfxVolume() }
        ];
        
        volumeTypes.forEach(({ key, label, getValue }) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'volume-control';
            
            const labelElement = document.createElement('label');
            labelElement.textContent = label;
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '1';
            slider.step = '0.01';
            slider.value = getValue().toString();
            
            const valueDisplay = document.createElement('span');
            valueDisplay.textContent = Math.round(getValue() * 100) + '%';
            
            slider.addEventListener('input', () => {
                const volume = parseFloat(slider.value);\n                this.setVolume(key, volume);\n                valueDisplay.textContent = Math.round(volume * 100) + '%';\n            });\n            \n            wrapper.appendChild(labelElement);\n            wrapper.appendChild(slider);\n            wrapper.appendChild(valueDisplay);\n            container.appendChild(wrapper);\n            \n            this.sliders[key] = slider;\n        });\n    }\n    \n    private setVolume(type: string, volume: number): void {\n        switch (type) {\n            case 'master':\n                this.audioManager.setMasterVolume(volume);\n                break;\n            case 'music':\n                this.audioManager.setMusicVolume(volume);\n                break;\n            case 'sfx':\n                this.audioManager.setSfxVolume(volume);\n                break;\n        }\n    }\n    \n    private setupEventListeners(): void {\n        // Update sliders when volume changes programmatically\n        this.audioManager.on('volumeChanged', (event) => {\n            const slider = this.sliders[event.type];\n            if (slider) {\n                slider.value = event.volume.toString();\n            }\n        });\n    }\n}\n\n// Usage\nconst audioControls = new AudioControlsUI();\n```\n\n### Spatial Audio Game Example\n```typescript\nclass SpatialAudioGame {\n    private audioManager: AudioManager;\n    private camera: Camera;\n    private player: GameObject;\n    private ambientSources: AudioSource[] = [];\n    \n    constructor() {\n        this.audioManager = AudioManager.getInstance();\n        this.setupSpatialAudio();\n    }\n    \n    private setupSpatialAudio(): void {\n        // Enable spatial audio\n        this.audioManager.setListenerPosition(Vector2.zero);\n        this.audioManager.setListenerOrientation(0);\n    }\n    \n    public update(): void {\n        // Update listener position to follow camera/player\n        if (this.camera) {\n            const cameraPos = this.camera.getPosition();\n            this.audioManager.setListenerPosition(cameraPos);\n            \n            const cameraRotation = this.camera.getRotation();\n            this.audioManager.setListenerOrientation(cameraRotation);\n        }\n        \n        // Update spatial audio for all sources\n        this.updateAmbientSources();\n    }\n    \n    private updateAmbientSources(): void {\n        // Ambient sources are automatically updated by AudioManager\n        // when listener position changes\n    }\n    \n    public createAmbientSource(position: Vector2, clipName: string): AudioSource {\n        const clip = this.audioManager.getAudioClip(clipName);\n        if (!clip) {\n            throw new Error(`Audio clip ${clipName} not found`);\n        }\n        \n        const source = new AudioSource(this.audioManager);\n        source.setClip(clip);\n        source.setPosition(position);\n        source.setLoop(true);\n        source.setAudioType('sfx');\n        source.play();\n        \n        this.ambientSources.push(source);\n        return source;\n    }\n    \n    public playPositionalSound(position: Vector2, clipName: string, volume: number = 1.0): AudioSource {\n        const clip = this.audioManager.getAudioClip(clipName);\n        if (!clip) {\n            console.warn(`Audio clip ${clipName} not found`);\n            return null;\n        }\n        \n        const source = new AudioSource(this.audioManager);\n        source.setClip(clip);\n        source.setPosition(position);\n        source.setVolume(volume);\n        source.setAudioType('sfx');\n        source.play();\n        \n        return source;\n    }\n}\n\n// Usage\nconst game = new SpatialAudioGame();\n\n// Create ambient waterfall sound\nconst waterfallPos = new Vector2(100, 200);\ngame.createAmbientSource(waterfallPos, 'waterfall');\n\n// Play explosion at specific location\nconst explosionPos = new Vector2(300, 150);\ngame.playPositionalSound(explosionPos, 'explosion', 0.8);\n```\n\n### Performance Monitoring\n```typescript\nclass AudioPerformanceMonitor {\n    private audioManager: AudioManager;\n    private updateInterval: number;\n    \n    constructor(updateIntervalMs: number = 1000) {\n        this.audioManager = AudioManager.getInstance();\n        this.updateInterval = updateIntervalMs;\n        this.startMonitoring();\n    }\n    \n    private startMonitoring(): void {\n        setInterval(() => {\n            this.logPerformanceStats();\n        }, this.updateInterval);\n    }\n    \n    private logPerformanceStats(): void {\n        const activeCount = this.audioManager.getActiveSourceCount();\n        const maxCount = this.audioManager.getMaxConcurrentSources();\n        const utilization = (activeCount / maxCount) * 100;\n        \n        console.log(`Audio Performance:`);\n        console.log(`  Active Sources: ${activeCount}/${maxCount} (${utilization.toFixed(1)}%)`);\n        console.log(`  Audio Context State: ${this.audioManager.getAudioContext().state}`);\n        \n        if (utilization > 80) {\n            console.warn('High audio source utilization detected');\n        }\n        \n        if (!this.audioManager.isAudioContextReady()) {\n            console.warn('Audio context is suspended');\n        }\n    }\n    \n    public getStats(): object {\n        return {\n            activeSourceCount: this.audioManager.getActiveSourceCount(),\n            maxSourceCount: this.audioManager.getMaxConcurrentSources(),\n            utilizationPercentage: (this.audioManager.getActiveSourceCount() / this.audioManager.getMaxConcurrentSources()) * 100,\n            audioContextState: this.audioManager.getAudioContext().state,\n            isAudioReady: this.audioManager.isAudioContextReady(),\n            volumes: {\n                master: this.audioManager.getMasterVolume(),\n                music: this.audioManager.getMusicVolume(),\n                sfx: this.audioManager.getSfxVolume()\n            }\n        };\n    }\n}\n\n// Usage\nconst monitor = new AudioPerformanceMonitor(5000); // Update every 5 seconds\nconst stats = monitor.getStats();\n```\n\n## Performance Considerations\n\n- AudioContext creation is expensive - use singleton pattern\n- Each audio source uses Web Audio API nodes (limited by browser)\n- Spatial audio calculations update every frame for all active sources\n- Volume changes trigger gain node parameter updates\n- Browser autoplay policies may suspend AudioContext until user interaction\n\n## Common Errors\n\n### ❌ Creating Multiple Instances\n```typescript\n// WRONG - Multiple AudioManager instances\nconst manager1 = new AudioManager(); // Not accessible constructor\nconst manager2 = AudioManager.createInstance();\nconst manager3 = AudioManager.createInstance(); // Throws error\n\n// CORRECT - Singleton usage\nconst manager = AudioManager.createInstance();\nconst sameManager = AudioManager.getInstance();\n```\n\n### ❌ Not Handling Suspended AudioContext\n```typescript\n// WRONG - Ignoring audio context state\nconst audioManager = AudioManager.getInstance();\naudioManager.playSfx('sound'); // May not play if suspended\n\n// CORRECT - Check audio context state\nif (!audioManager.isAudioContextReady()) {\n    console.warn('Audio context suspended - user interaction needed');\n    showAudioEnablePrompt();\n} else {\n    audioManager.playSfx('sound');\n}\n```\n\n### ❌ Volume Values Outside Valid Range\n```typescript\n// WRONG - Invalid volume values\naudioManager.setMasterVolume(1.5); // Clamped to 1.0\naudioManager.setMusicVolume(-0.2); // Clamped to 0.0\n\n// CORRECT - Use valid range\naudioManager.setMasterVolume(0.8); // 0.0 to 1.0\n```\n\n### ❌ Not Cleaning Up Resources\n```typescript\n// WRONG - Not destroying AudioManager\nwindow.addEventListener('beforeunload', () => {\n    // Page unloading but AudioManager still active\n});\n\n// CORRECT - Clean up on page unload\nwindow.addEventListener('beforeunload', () => {\n    AudioManager.getInstance().destroy();\n});\n```\n\n## Integration Points\n\n- **AudioClip**: Provides AudioContext for audio decoding\n- **AudioSource**: Registers/unregisters sources and provides gain nodes\n- **Engine**: Typically initialized during engine startup\n- **Input**: Audio context resume requires user interaction\n- **Vector2**: Used for spatial audio positioning\n- **EventEmitter**: Provides event system for audio state changes