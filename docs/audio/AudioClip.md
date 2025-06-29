# AudioClip Class Documentation

## Overview
The `AudioClip` class represents a loaded audio asset in ImplementEngine. It handles loading, decoding, and managing audio data using the Web Audio API. AudioClip provides audio file management, metadata extraction, audio analysis capabilities, and efficient audio buffer creation for playback through AudioSource components.

## Class Declaration
```typescript
export class AudioClip extends EventEmitter
```

## Interfaces

### AudioClipData Interface
```typescript
interface AudioClipData {
    url: string;                        // Path or URL to audio file
    preload?: boolean;                  // Whether to load immediately
    volume?: number;                    // Default volume (0.0 to 1.0)
    loop?: boolean;                     // Default loop setting
    format?: string;                    // Audio format hint
}
```

## Constructor
```typescript
constructor(name: string, data: AudioClipData)
```

**Parameters:**
- `name` (string): Unique identifier for the audio clip
- `data` (AudioClipData): Configuration object with URL and settings

**Example:**
```typescript
const audioClip = new AudioClip('explosion', {
    url: 'assets/sounds/explosion.mp3',
    preload: true,
    volume: 0.8,
    loop: false,
    format: 'mp3'
});
```

## Properties (Read-only via Getters)

### Audio Metadata

#### `getName(): string`
Returns the unique name identifier.

#### `getUrl(): string`
Returns the source URL of the audio file.

#### `getDuration(): number`
Returns duration in seconds (0 if not loaded).

#### `getSampleRate(): number`
Returns sample rate in Hz.

#### `getChannels(): number`
Returns number of audio channels (1 = mono, 2 = stereo).

#### `getFormat(): string`
Returns detected or specified audio format.

**Example:**
```typescript
console.log(`Audio: ${clip.getName()}`);
console.log(`Duration: ${clip.getDuration().toFixed(2)}s`);
console.log(`Format: ${clip.getFormat()}`);
console.log(`Channels: ${clip.getChannels()}`);
```

### Loading State

#### `isReady(): boolean`
Returns true if audio is fully loaded and ready for playback.

#### `isCurrentlyLoading(): boolean`
Returns true if currently loading audio data.

**Example:**
```typescript
if (clip.isReady()) {
    audioSource.play(clip);
} else if (clip.isCurrentlyLoading()) {
    console.log('Audio is still loading...');
} else {
    clip.load(); // Start loading
}
```

### Default Settings

#### `getDefaultVolume(): number`
Returns default volume level (0.0 to 1.0).

#### `getDefaultLoop(): boolean`
Returns default loop setting.

**Example:**
```typescript
const volume = clip.getDefaultVolume();
const shouldLoop = clip.getDefaultLoop();
```

## Methods

### Loading and Unloading

#### `async load(): Promise<void>`
Loads and decodes the audio file. Safe to call multiple times.

#### `unload(): void`
Releases audio buffer and resets loading state.

**Example:**
```typescript
// Load audio
try {
    await clip.load();
    console.log('Audio loaded successfully');
} catch (error) {
    console.error('Failed to load audio:', error);
}

// Unload when no longer needed
clip.unload();
```

### Audio Buffer Access

#### `getAudioBuffer(): AudioBuffer | null`
Returns the raw Web Audio API AudioBuffer.

#### `createAudioBufferSourceNode(): AudioBufferSourceNode`
Creates a new source node for playback (requires loaded audio).

**Example:**
```typescript
// Direct Web Audio API usage
if (clip.isReady()) {
    const sourceNode = clip.createAudioBufferSourceNode();
    const audioContext = AudioManager.getInstance().getAudioContext();
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
}
```

### Configuration

#### `setDefaultVolume(volume: number): void`
Sets the default volume (clamped between 0.0 and 1.0).

#### `setDefaultLoop(loop: boolean): void`
Sets the default loop setting.

**Example:**
```typescript
clip.setDefaultVolume(0.5);
clip.setDefaultLoop(true);
```

### Audio Analysis

#### `getFrequencyData(): Float32Array | null`
Returns raw audio data from the first channel.

#### `getPeakAmplitude(): number`
Returns the highest amplitude value in the audio.

#### `getRMSVolume(): number`
Returns the RMS (Root Mean Square) volume level.

**Example:**
```typescript
if (clip.isReady()) {
    const peak = clip.getPeakAmplitude();
    const rms = clip.getRMSVolume();
    
    console.log(`Peak amplitude: ${peak.toFixed(3)}`);
    console.log(`RMS volume: ${rms.toFixed(3)}`);
    
    // Use for dynamic volume normalization
    const normalizedVolume = 0.8 / peak; // Normalize to 80% of peak
    clip.setDefaultVolume(normalizedVolume);
}
```

### Utility Methods

#### `clone(newName?: string): AudioClip`
Creates a copy of the AudioClip with the same settings.

#### `getInfo(): object`
Returns comprehensive information about the audio clip.

#### `destroy(): void`
Unloads audio and removes all event listeners.

**Example:**
```typescript
// Clone for variations
const explosionQuiet = explosionClip.clone('explosion_quiet');
explosionQuiet.setDefaultVolume(0.3);

// Get detailed info
const info = clip.getInfo();
console.log('Audio info:', info);

// Clean up
clip.destroy();
```

## Static Methods

### Loading Utilities

#### `static async loadFromUrl(name: string, url: string, preload: boolean = true): Promise<AudioClip>`
Convenience method to create and load an AudioClip from a URL.

#### `static async loadMultiple(clips: Array<{name: string; url: string}>): Promise<AudioClip[]>`
Loads multiple audio clips in parallel.

**Example:**
```typescript
// Load single clip
const bgMusic = await AudioClip.loadFromUrl('background', 'music/bg.mp3');

// Load multiple clips
const sounds = await AudioClip.loadMultiple([
    { name: 'jump', url: 'sounds/jump.wav' },
    { name: 'collect', url: 'sounds/collect.wav' },
    { name: 'hurt', url: 'sounds/hurt.wav' }
]);
```

## Events

The AudioClip class emits the following events:

- `loadStart` - Audio loading begins
- `loadComplete` - Audio successfully loaded
- `loadError` - Audio loading failed (includes error details)
- `unloaded` - Audio buffer released

**Example:**
```typescript
clip.on('loadStart', () => {
    console.log('Loading audio...');
    showLoadingIndicator();
});

clip.on('loadComplete', () => {
    console.log('Audio ready for playback');
    hideLoadingIndicator();
});

clip.on('loadError', (error) => {
    console.error('Audio load failed:', error);
    showErrorMessage('Failed to load audio');
});

clip.on('unloaded', () => {
    console.log('Audio buffer released');
});
```

## Usage Examples

### Basic Audio Loading
```typescript
class AudioAssets {
    public static clips: Map<string, AudioClip> = new Map();
    
    public static async loadSounds(): Promise<void> {
        const soundList = [
            { name: 'jump', url: 'sounds/jump.wav', volume: 0.7 },
            { name: 'background', url: 'music/bg.mp3', volume: 0.4, loop: true },
            { name: 'explosion', url: 'sounds/explosion.wav', volume: 0.9 },
            { name: 'pickup', url: 'sounds/pickup.wav', volume: 0.6 }
        ];
        
        for (const sound of soundList) {
            const clip = new AudioClip(sound.name, {
                url: sound.url,
                preload: true,
                volume: sound.volume,
                loop: sound.loop
            });
            
            try {
                await clip.load();
                this.clips.set(sound.name, clip);
                console.log(`Loaded: ${sound.name}`);
            } catch (error) {
                console.error(`Failed to load ${sound.name}:`, error);
            }
        }
    }
    
    public static getClip(name: string): AudioClip | null {
        return this.clips.get(name) || null;
    }
    
    public static unloadAll(): void {
        this.clips.forEach(clip => clip.destroy());
        this.clips.clear();
    }
}

// Usage
await AudioAssets.loadSounds();
const jumpSound = AudioAssets.getClip('jump');
```

### Dynamic Audio Loading
```typescript
class DynamicAudioLoader {
    private loadingClips: Map<string, Promise<AudioClip>> = new Map();
    private loadedClips: Map<string, AudioClip> = new Map();
    
    public async getClip(name: string, url: string): Promise<AudioClip> {
        // Check if already loaded
        if (this.loadedClips.has(name)) {
            return this.loadedClips.get(name)!;
        }
        
        // Check if currently loading
        if (this.loadingClips.has(name)) {
            return await this.loadingClips.get(name)!;
        }
        
        // Start loading
        const loadPromise = this.loadAudioClip(name, url);
        this.loadingClips.set(name, loadPromise);
        
        try {
            const clip = await loadPromise;
            this.loadedClips.set(name, clip);
            this.loadingClips.delete(name);
            return clip;
        } catch (error) {
            this.loadingClips.delete(name);
            throw error;
        }
    }
    
    private async loadAudioClip(name: string, url: string): Promise<AudioClip> {
        return new Promise((resolve, reject) => {
            const clip = new AudioClip(name, { url, preload: false });
            
            clip.on('loadComplete', () => resolve(clip));
            clip.on('loadError', (error) => reject(error));
            
            clip.load();
        });
    }
    
    public preloadClips(clipData: Array<{name: string; url: string}>): void {
        clipData.forEach(({ name, url }) => {
            this.getClip(name, url).catch(error => {
                console.warn(`Failed to preload ${name}:`, error);
            });
        });
    }
    
    public unloadClip(name: string): void {
        const clip = this.loadedClips.get(name);
        if (clip) {
            clip.destroy();
            this.loadedClips.delete(name);
        }
    }
}

// Usage
const audioLoader = new DynamicAudioLoader();

// Preload common sounds
audioLoader.preloadClips([
    { name: 'ui_click', url: 'ui/click.wav' },
    { name: 'ui_hover', url: 'ui/hover.wav' }
]);

// Load on demand
const explosionClip = await audioLoader.getClip('explosion', 'fx/explosion.wav');
```

### Audio Analysis and Effects
```typescript
class AudioAnalyzer {
    public static analyzeClip(clip: AudioClip): AudioAnalysisResult {
        if (!clip.isReady()) {
            throw new Error('Audio clip must be loaded for analysis');
        }
        
        const duration = clip.getDuration();
        const peak = clip.getPeakAmplitude();
        const rms = clip.getRMSVolume();
        const frequencyData = clip.getFrequencyData();
        
        return {
            duration,
            peak,
            rms,
            dynamicRange: this.calculateDynamicRange(frequencyData!),
            suggestedVolume: this.calculateOptimalVolume(peak, rms),
            classification: this.classifyAudio(duration, peak, rms)
        };
    }
    
    private static calculateDynamicRange(data: Float32Array): number {
        let min = Infinity;
        let max = -Infinity;
        
        for (let i = 0; i < data.length; i++) {
            const value = Math.abs(data[i]);
            if (value > 0.001) { // Ignore near-silence
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }
        
        return max / min;
    }
    
    private static calculateOptimalVolume(peak: number, rms: number): number {
        // Normalize based on peak but consider RMS for perceived loudness
        const peakNormalized = 0.8 / peak; // Leave 20% headroom
        const rmsAdjustment = Math.max(0.3, Math.min(1.5, 0.1 / rms));
        
        return Math.min(1.0, peakNormalized * rmsAdjustment);
    }
    
    private static classifyAudio(duration: number, peak: number, rms: number): string {
        if (duration < 0.5) return 'short_sfx';
        if (duration > 30) return 'music';
        if (peak > 0.8 && rms > 0.3) return 'loud_sfx';
        if (peak < 0.3 && rms < 0.1) return 'ambient';
        return 'normal_sfx';
    }
}

interface AudioAnalysisResult {
    duration: number;
    peak: number;
    rms: number;
    dynamicRange: number;
    suggestedVolume: number;
    classification: string;
}

// Usage
const clip = await AudioClip.loadFromUrl('test', 'sounds/test.wav');
const analysis = AudioAnalyzer.analyzeClip(clip);

console.log(`Audio type: ${analysis.classification}`);
console.log(`Suggested volume: ${analysis.suggestedVolume.toFixed(2)}`);

// Apply analysis results
clip.setDefaultVolume(analysis.suggestedVolume);
```

### Audio Library Management
```typescript
class AudioLibrary {
    private clips: Map<string, AudioClip> = new Map();
    private categories: Map<string, Set<string>> = new Map();
    private loadingProgress: Map<string, number> = new Map();
    
    public async loadLibrary(libraryData: AudioLibraryData): Promise<void> {
        const totalClips = Object.values(libraryData.categories).flat().length;
        let loadedCount = 0;
        
        for (const [category, sounds] of Object.entries(libraryData.categories)) {
            this.categories.set(category, new Set());
            
            for (const sound of sounds) {
                try {
                    const clip = new AudioClip(sound.name, {
                        url: sound.url,
                        preload: false,
                        volume: sound.volume || 1.0,
                        loop: sound.loop || false
                    });
                    
                    // Track loading progress
                    clip.on('loadComplete', () => {
                        loadedCount++;
                        this.loadingProgress.set(sound.name, 100);
                        this.emitProgress(loadedCount / totalClips);
                    });
                    
                    this.clips.set(sound.name, clip);
                    this.categories.get(category)!.add(sound.name);
                    
                    // Load with slight delay to prevent overwhelming the browser
                    setTimeout(() => clip.load(), Math.random() * 100);
                    
                } catch (error) {
                    console.error(`Failed to load ${sound.name}:`, error);
                }
            }
        }
    }
    
    public getClip(name: string): AudioClip | null {
        return this.clips.get(name) || null;
    }
    
    public getClipsByCategory(category: string): AudioClip[] {
        const clipNames = this.categories.get(category);
        if (!clipNames) return [];
        
        return Array.from(clipNames)
            .map(name => this.clips.get(name))
            .filter(clip => clip !== undefined) as AudioClip[];
    }
    
    public getRandomClipFromCategory(category: string): AudioClip | null {
        const clips = this.getClipsByCategory(category);
        if (clips.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * clips.length);
        return clips[randomIndex];
    }
    
    public getAllLoadedClips(): AudioClip[] {
        return Array.from(this.clips.values()).filter(clip => clip.isReady());
    }
    
    public getLoadingStatus(): { total: number; loaded: number; percentage: number } {
        const total = this.clips.size;
        const loaded = Array.from(this.clips.values()).filter(clip => clip.isReady()).length;
        
        return {
            total,
            loaded,
            percentage: total > 0 ? (loaded / total) * 100 : 0
        };
    }
    
    public unloadCategory(category: string): void {
        const clipNames = this.categories.get(category);
        if (!clipNames) return;
        
        clipNames.forEach(name => {
            const clip = this.clips.get(name);
            if (clip) {
                clip.destroy();
                this.clips.delete(name);
            }
        });
        
        this.categories.delete(category);
    }
    
    private emitProgress(progress: number): void {
        // Could emit event for loading progress UI
        console.log(`Audio library loading: ${(progress * 100).toFixed(1)}%`);
    }
}

interface AudioLibraryData {
    categories: {
        [category: string]: Array<{
            name: string;
            url: string;
            volume?: number;
            loop?: boolean;
        }>;
    };
}

// Usage
const audioLibrary = new AudioLibrary();

const libraryData: AudioLibraryData = {
    categories: {
        sfx: [
            { name: 'jump', url: 'sfx/jump.wav', volume: 0.7 },
            { name: 'land', url: 'sfx/land.wav', volume: 0.6 },
            { name: 'collect', url: 'sfx/collect.wav', volume: 0.8 }
        ],
        music: [
            { name: 'bg_level1', url: 'music/level1.mp3', volume: 0.4, loop: true },
            { name: 'bg_menu', url: 'music/menu.mp3', volume: 0.3, loop: true }
        ],
        voice: [
            { name: 'welcome', url: 'voice/welcome.wav', volume: 0.9 },
            { name: 'gameover', url: 'voice/gameover.wav', volume: 0.8 }
        ]
    }
};

await audioLibrary.loadLibrary(libraryData);

// Get specific clip
const jumpSound = audioLibrary.getClip('jump');

// Get random sound effect
const randomSFX = audioLibrary.getRandomClipFromCategory('sfx');

// Check loading status
const status = audioLibrary.getLoadingStatus();
console.log(`Loaded ${status.loaded}/${status.total} audio files`);
```

## Performance Considerations

- Audio files are decoded once when loaded and cached as AudioBuffer
- Multiple AudioBufferSourceNode instances can be created from one AudioClip
- Large audio files consume significant memory when loaded
- Use `unload()` to free memory for unused audio clips
- Consider lazy loading for non-essential audio assets
- Web Audio API has better performance than HTML5 Audio for games

## Common Errors

### ❌ Playing Before Loading
```typescript
// WRONG - Audio not loaded
const clip = new AudioClip('sound', { url: 'sound.wav' });
const sourceNode = clip.createAudioBufferSourceNode(); // Throws error

// CORRECT - Wait for loading
const clip = new AudioClip('sound', { url: 'sound.wav', preload: true });
await clip.load();
const sourceNode = clip.createAudioBufferSourceNode();
```

### ❌ Not Handling Load Errors
```typescript
// WRONG - No error handling
const clip = new AudioClip('sound', { url: 'invalid.wav' });
await clip.load(); // May throw uncaught error

// CORRECT - Handle errors
try {
    const clip = new AudioClip('sound', { url: 'sound.wav' });
    await clip.load();
} catch (error) {
    console.error('Audio load failed:', error);
    // Provide fallback or user feedback
}
```

### ❌ Memory Leaks with Event Listeners
```typescript
// WRONG - Not cleaning up
const clip = new AudioClip('sound', { url: 'sound.wav' });
clip.on('loadComplete', handleLoad);
// If clip persists, listener may hold references

// CORRECT - Use destroy() or remove listeners
clip.destroy(); // Removes all listeners
// OR
clip.off('loadComplete', handleLoad);
```

### ❌ Incorrect Volume Values
```typescript
// WRONG - Volume outside valid range
clip.setDefaultVolume(1.5); // Clamped to 1.0
clip.setDefaultVolume(-0.2); // Clamped to 0.0

// CORRECT - Use valid range
clip.setDefaultVolume(0.8); // 0.0 to 1.0
```

## Integration Points

- **AudioManager**: Provides AudioContext for audio decoding
- **AudioSource**: Uses AudioClip instances for playback
- **AssetLoader**: May use AudioClip for loading audio assets
- **EventEmitter**: Provides event system for load state changes
- **Component System**: AudioSource components reference AudioClip instances