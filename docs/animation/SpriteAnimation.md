# SpriteAnimation Class Documentation

## Overview
The `SpriteAnimation` class extends the base Animation class to provide sprite sheet-based animation. It manages frame sequences, timing, ping-pong playback, and per-frame duration overrides. This class is used by the Animator component to display animated sprites.

## Class Declaration
```typescript
export class SpriteAnimation extends Animation
```

## Interfaces

### SpriteFrame Interface
```typescript
interface SpriteFrame {
    x: number;        // X position in sprite sheet
    y: number;        // Y position in sprite sheet
    width: number;    // Frame width
    height: number;   // Frame height
    duration?: number; // Optional per-frame duration override
}
```

### SpriteAnimationData Interface
```typescript
interface SpriteAnimationData {
    name: string;                              // Animation name
    texture: HTMLImageElement | HTMLCanvasElement; // Sprite sheet texture
    frames: SpriteFrame[];                     // Frame definitions
    fps?: number;                              // Frames per second (default: 12)
    loop?: boolean;                            // Whether to loop (default: false)
    pingPong?: boolean;                        // Play forward then backward (default: false)
}
```

## Constructor
```typescript
constructor(data: SpriteAnimationData)
```

**Parameters:**
- `data` (SpriteAnimationData): Configuration object with animation settings

**Example:**
```typescript
const animData: SpriteAnimationData = {
    name: 'walk',
    texture: spriteSheet,
    frames: [
        { x: 0, y: 0, width: 32, height: 32 },
        { x: 32, y: 0, width: 32, height: 32 },
        { x: 64, y: 0, width: 32, height: 32 }
    ],
    fps: 8,
    loop: true
};

const animation = new SpriteAnimation(animData);
```

## Properties

### Animation Properties

#### `texture: HTMLImageElement | HTMLCanvasElement`
The sprite sheet texture containing all animation frames.

#### `frames: SpriteFrame[]`
Array of frame definitions specifying regions in the sprite sheet.

#### `fps: number`
Frames per second for animation playback.

#### `pingPong: boolean`
Whether animation plays forward then backward (bounces).

**Example:**
```typescript
// Access animation properties
console.log('Frame count:', animation.frameCount);
console.log('FPS:', animation.fps);
console.log('Is ping-pong:', animation.pingPong);
```

### Current State (Read-only)

#### `currentFrame: SpriteFrame` (get)
Gets the current frame definition.

#### `currentFrameIndex: number` (get)
Gets the current frame index (0-based).

#### `frameCount: number` (get)
Gets the total number of frames.

**Example:**
```typescript
// Get current frame info
const frame = animation.currentFrame;
console.log(`Frame ${animation.currentFrameIndex}/${animation.frameCount}`);
console.log(`Frame rect: ${frame.x}, ${frame.y}, ${frame.width}, ${frame.height}`);
```

## Methods

### Frame Control

#### `setFrame(index: number): void`
Sets the current frame by index (clamped to valid range).

#### `nextFrame(): void`
Advances to the next frame (handles looping and ping-pong).

#### `previousFrame(): void`
Goes to the previous frame (handles looping and ping-pong).

**Example:**
```typescript
// Manual frame control
animation.setFrame(5);
animation.nextFrame();
animation.previousFrame();

// Jump to specific frames
animation.setFrame(0);              // First frame
animation.setFrame(animation.frameCount - 1); // Last frame
```

### Animation Creation

#### `clone(): SpriteAnimation`
Creates a copy of the animation with a new name.

#### `reverse(): SpriteAnimation`
Creates a reversed version of the animation.

**Example:**
```typescript
// Clone animation
const walkCopy = walkAnimation.clone();

// Create reverse animation
const walkBackward = walkAnimation.reverse();
```

## Static Factory Methods

### `fromSpriteSheet(name, texture, frameWidth, frameHeight, startX, startY, frameCount, fps): SpriteAnimation`
Creates animation from a regular grid sprite sheet.

**Parameters:**
- `name` (string): Animation name
- `texture` (HTMLImageElement | HTMLCanvasElement): Sprite sheet
- `frameWidth` (number): Width of each frame
- `frameHeight` (number): Height of each frame
- `startX` (number, optional): Starting X position (default: 0)
- `startY` (number, optional): Starting Y position (default: 0)
- `frameCount` (number, optional): Number of frames (default: auto-calculate)
- `fps` (number, optional): Frames per second (default: 12)

### `fromFrameRange(name, texture, frameWidth, frameHeight, startFrame, endFrame, fps): SpriteAnimation`
Creates animation from a range of frames in a sprite sheet.

**Parameters:**
- `name` (string): Animation name
- `texture` (HTMLImageElement | HTMLCanvasElement): Sprite sheet
- `frameWidth` (number): Width of each frame
- `frameHeight` (number): Height of each frame
- `startFrame` (number): Starting frame index
- `endFrame` (number): Ending frame index
- `fps` (number, optional): Frames per second (default: 12)

### `fromFrameArray(name, texture, frameIndices, frameWidth, frameHeight, fps): SpriteAnimation`
Creates animation from custom frame indices.

**Parameters:**
- `name` (string): Animation name
- `texture` (HTMLImageElement | HTMLCanvasElement): Sprite sheet
- `frameIndices` (number[]): Array of frame indices to use
- `frameWidth` (number): Width of each frame
- `frameHeight` (number): Height of each frame
- `fps` (number, optional): Frames per second (default: 12)

**Example:**
```typescript
// Regular sprite sheet (8 frames, 32x32 each)
const walkAnim = SpriteAnimation.fromSpriteSheet(
    'walk', spriteSheet, 32, 32, 0, 0, 8, 12
);

// Frame range (frames 10-15 from sprite sheet)
const runAnim = SpriteAnimation.fromFrameRange(
    'run', spriteSheet, 32, 32, 10, 15, 15
);

// Custom frame sequence
const specialAnim = SpriteAnimation.fromFrameArray(
    'special', spriteSheet, [0, 1, 2, 1, 0, 5, 6, 7], 32, 32, 10
);
```

## Usage Examples

### Basic Character Animation
```typescript
class CharacterAnimations {
    private spriteSheet: HTMLImageElement;
    private animations: Map<string, SpriteAnimation> = new Map();
    
    async loadAnimations(): Promise<void> {
        this.spriteSheet = await AssetLoader.loadImage('character-sheet.png');
        
        // Create various animations
        this.createIdleAnimation();
        this.createWalkAnimation();
        this.createRunAnimation();
        this.createJumpAnimation();
        this.createAttackAnimation();
    }
    
    private createIdleAnimation(): void {
        const idleAnim = SpriteAnimation.fromFrameRange(
            'idle',
            this.spriteSheet,
            32, 32,     // 32x32 frames
            0, 3,       // frames 0-3
            6           // 6 fps (slow breathing)
        );
        idleAnim.loop = true;
        idleAnim.pingPong = true; // Breathe in and out
        
        this.animations.set('idle', idleAnim);
    }
    
    private createWalkAnimation(): void {
        const walkAnim = SpriteAnimation.fromFrameRange(
            'walk',
            this.spriteSheet,
            32, 32,
            4, 11,      // frames 4-11
            8           // 8 fps
        );
        walkAnim.loop = true;
        
        this.animations.set('walk', walkAnim);
    }
    
    private createRunAnimation(): void {
        const runAnim = SpriteAnimation.fromFrameRange(
            'run',
            this.spriteSheet,
            32, 32,
            12, 19,     // frames 12-19
            12          // 12 fps (faster)
        );
        runAnim.loop = true;
        
        this.animations.set('run', runAnim);
    }
    
    private createJumpAnimation(): void {
        const jumpAnim = SpriteAnimation.fromFrameRange(
            'jump',
            this.spriteSheet,
            32, 32,
            20, 23,     // frames 20-23
            10
        );
        jumpAnim.loop = false; // Play once
        
        this.animations.set('jump', jumpAnim);
    }
    
    private createAttackAnimation(): void {
        // Custom frame timing for impact frame
        const frames: SpriteFrame[] = [];
        
        // Wind-up frames (fast)
        for (let i = 24; i <= 26; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;
            frames.push({
                x: col * 32,
                y: row * 32,
                width: 32,
                height: 32,
                duration: 0.1 // 100ms each
            });
        }
        
        // Impact frame (hold longer)
        frames.push({
            x: (27 % 8) * 32,
            y: Math.floor(27 / 8) * 32,
            width: 32,
            height: 32,
            duration: 0.3 // 300ms hold
        });
        
        // Recovery frames (medium speed)
        for (let i = 28; i <= 31; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;
            frames.push({
                x: col * 32,
                y: row * 32,
                width: 32,
                height: 32,
                duration: 0.15 // 150ms each
            });
        }
        
        const attackAnim = new SpriteAnimation({
            name: 'attack',
            texture: this.spriteSheet,
            frames: frames,
            loop: false
        });
        
        this.animations.set('attack', attackAnim);
    }
    
    public getAnimation(name: string): SpriteAnimation | null {
        return this.animations.get(name) || null;
    }
}
```

### Particle Effect Animation
```typescript
class ParticleAnimation {
    public static createExplosionAnimation(texture: HTMLImageElement): SpriteAnimation {
        // Explosion frames with increasing delays (slow-motion effect)
        const frames: SpriteFrame[] = [];
        
        for (let i = 0; i < 8; i++) {
            frames.push({
                x: i * 64,
                y: 0,
                width: 64,
                height: 64,
                duration: 0.05 + (i * 0.02) // Increasing delay
            });
        }
        
        return new SpriteAnimation({
            name: 'explosion',
            texture: texture,
            frames: frames,
            loop: false
        });
    }
    
    public static createSparkAnimation(texture: HTMLImageElement): SpriteAnimation {
        return SpriteAnimation.fromSpriteSheet(
            'spark',
            texture,
            16, 16,    // Small 16x16 frames
            0, 0,
            12,        // 12 frames
            24         // Fast 24 fps
        );
    }
    
    public static createSmokeAnimation(texture: HTMLImageElement): SpriteAnimation {
        const smokeAnim = SpriteAnimation.fromFrameRange(
            'smoke',
            texture,
            32, 32,
            0, 15,     // 16 frames
            8          // Slow 8 fps
        );
        smokeAnim.loop = true;
        return smokeAnim;
    }
}
```

### UI Animation
```typescript
class UIAnimations {
    public static createButtonHoverAnimation(texture: HTMLImageElement): SpriteAnimation {
        const hoverAnim = SpriteAnimation.fromFrameRange(
            'button-hover',
            texture,
            100, 32,   // Button dimensions
            0, 4,      // 5 frames
            12
        );
        hoverAnim.loop = true;
        hoverAnim.pingPong = true; // Pulse effect
        
        return hoverAnim;
    }
    
    public static createLoadingSpinnerAnimation(texture: HTMLImageElement): SpriteAnimation {
        return SpriteAnimation.fromSpriteSheet(
            'spinner',
            texture,
            24, 24,
            0, 0,
            8,         // 8 rotation frames
            16         // Fast spin
        );
    }
    
    public static createMenuTransitionAnimation(texture: HTMLImageElement): SpriteAnimation {
        // Custom timing for smooth menu slide
        const frames: SpriteFrame[] = [];
        
        // Accelerating frames
        const totalFrames = 10;
        for (let i = 0; i < totalFrames; i++) {
            const easeOut = 1 - Math.pow(1 - (i / (totalFrames - 1)), 3);
            const duration = 0.03 + (easeOut * 0.07); // 30-100ms range
            
            frames.push({
                x: i * 80,
                y: 0,
                width: 80,
                height: 60,
                duration: duration
            });
        }
        
        return new SpriteAnimation({
            name: 'menu-slide',
            texture: texture,
            frames: frames,
            loop: false
        });
    }
}
```

### Advanced Animation Techniques
```typescript
class AdvancedAnimationDemo {
    public static createLayeredAnimation(
        baseTexture: HTMLImageElement,
        overlayTexture: HTMLImageElement
    ): SpriteAnimation[] {
        // Create synchronized animations for layered rendering
        
        const baseAnim = SpriteAnimation.fromSpriteSheet(
            'character-base',
            baseTexture,
            32, 32,
            0, 0, 8, 10
        );
        
        const overlayAnim = SpriteAnimation.fromSpriteSheet(
            'character-equipment',
            overlayTexture,
            32, 32,
            0, 0, 8, 10
        );
        
        // Ensure they have same timing
        baseAnim.loop = true;
        overlayAnim.loop = true;
        
        return [baseAnim, overlayAnim];
    }
    
    public static createComboAnimation(texture: HTMLImageElement): SpriteAnimation {
        // Complex fighting game combo with varied timing
        const comboFrames: SpriteFrame[] = [];
        
        // Define combo sequence with custom timing
        const sequence = [
            { frames: [0, 1, 2], duration: 0.08 },      // Startup
            { frames: [3], duration: 0.05 },            // Active (fast)
            { frames: [4, 5], duration: 0.12 },         // Recovery
            { frames: [6, 7, 8], duration: 0.06 },      // Chain into next
            { frames: [9], duration: 0.03 },            // Second active
            { frames: [10, 11, 12], duration: 0.15 }    // Endlag
        ];
        
        sequence.forEach(segment => {
            segment.frames.forEach(frameIndex => {
                const row = Math.floor(frameIndex / 8);
                const col = frameIndex % 8;
                
                comboFrames.push({
                    x: col * 48,
                    y: row * 48,
                    width: 48,
                    height: 48,
                    duration: segment.duration
                });
            });
        });
        
        return new SpriteAnimation({
            name: 'combo-attack',
            texture: texture,
            frames: comboFrames,
            loop: false
        });
    }
    
    public static createDynamicAnimation(
        texture: HTMLImageElement,
        speedMultiplier: number
    ): SpriteAnimation {
        // Create animation with speed-adjusted timing
        
        const baseFrames = SpriteAnimation.fromSpriteSheet(
            'dynamic',
            texture,
            32, 32,
            0, 0, 6, 12
        ).frames;
        
        // Adjust frame durations based on speed
        const adjustedFrames = baseFrames.map(frame => ({
            ...frame,
            duration: (1/12) / speedMultiplier // Faster = shorter duration
        }));
        
        return new SpriteAnimation({
            name: `dynamic-${speedMultiplier}x`,
            texture: texture,
            frames: adjustedFrames,
            loop: true
        });
    }
}
```

### Animation Events and Callbacks
```typescript
class AnimationEventDemo extends Component {
    private animation: SpriteAnimation;
    
    start(): void {
        this.setupAnimation();
        this.setupAnimationEvents();
    }
    
    private async setupAnimation(): Promise<void> {
        const texture = await AssetLoader.loadImage('character.png');
        
        this.animation = SpriteAnimation.fromFrameRange(
            'special-attack',
            texture,
            64, 64,
            0, 12,
            15
        );
        
        // Custom per-frame events
        this.setupFrameEvents();
    }
    
    private setupAnimationEvents(): void {
        this.animation.on('start', () => {
            console.log('Animation started');
        });
        
        this.animation.on('end', () => {
            console.log('Animation ended');
            this.onAttackFinished();
        });
        
        this.animation.on('loop', () => {
            console.log('Animation looped');
        });
    }
    
    private setupFrameEvents(): void {
        // Trigger events on specific frames
        this.animation.on('frame', (frameIndex: number) => {
            switch (frameIndex) {
                case 3:
                    this.onWindupComplete();
                    break;
                case 6:
                    this.onAttackActive();
                    break;
                case 9:
                    this.onAttackHit();
                    break;
                case 12:
                    this.onRecoveryStart();
                    break;
            }
        });
    }
    
    private onWindupComplete(): void {
        console.log('Attack windup complete');
        // Play wind sound, screen shake, etc.
    }
    
    private onAttackActive(): void {
        console.log('Attack is now active');
        // Enable hitbox, play swoosh sound
    }
    
    private onAttackHit(): void {
        console.log('Attack impact frame');
        // Check for hits, play impact effects
    }
    
    private onRecoveryStart(): void {
        console.log('Attack recovery phase');
        // Disable hitbox
    }
    
    private onAttackFinished(): void {
        console.log('Attack sequence complete');
        // Return to idle state
    }
}
```

## Ping-Pong Animation Behavior

Ping-pong animations play forward to the end, then backward to the beginning:

```typescript
// Example: 5-frame ping-pong animation
// Forward:  0 → 1 → 2 → 3 → 4
// Backward: 4 → 3 → 2 → 1 → 0
// Repeat cycle

const breathingAnim = SpriteAnimation.fromFrameRange(
    'idle-breathe',
    texture,
    32, 32,
    0, 4,
    6
);
breathingAnim.pingPong = true;
breathingAnim.loop = true;
```

## Performance Considerations

- Frame calculations are performed each update when animation is playing
- Large sprite sheets require more memory but reduce texture swapping
- Per-frame duration overrides add calculation overhead
- Ping-pong mode requires additional direction tracking
- Static factory methods create new frame arrays each time

## Common Errors

### ❌ Invalid Frame Indices
```typescript
// WRONG - Frame indices beyond sprite sheet
SpriteAnimation.fromFrameRange('walk', texture, 32, 32, 0, 20, 12);
// If texture only has 16 frames, indices 17-20 will be invalid

// CORRECT - Verify frame count first
const maxFrames = Math.floor((texture.width * texture.height) / (32 * 32));
const endFrame = Math.min(20, maxFrames - 1);
```

### ❌ Mismatched Frame Dimensions
```typescript
// WRONG - Frame size doesn't match sprite sheet grid
SpriteAnimation.fromSpriteSheet('anim', texture, 33, 33, 0, 0, 8);
// If sprite sheet uses 32x32 grid, this will misalign frames

// CORRECT - Use exact frame dimensions
SpriteAnimation.fromSpriteSheet('anim', texture, 32, 32, 0, 0, 8);
```

### ❌ Zero or Negative FPS
```typescript
// WRONG - Invalid FPS values
const anim = SpriteAnimation.fromSpriteSheet('test', texture, 32, 32, 0, 0, 4, 0);
// FPS of 0 will cause division by zero

// CORRECT - Use positive FPS
const anim = SpriteAnimation.fromSpriteSheet('test', texture, 32, 32, 0, 0, 4, 12);
```

### ❌ Inconsistent Per-Frame Durations
```typescript
// WRONG - Some frames have duration, others don't
const frames = [
    { x: 0, y: 0, width: 32, height: 32, duration: 0.1 },
    { x: 32, y: 0, width: 32, height: 32 }, // No duration
    { x: 64, y: 0, width: 32, height: 32, duration: 0.2 }
];

// CORRECT - Either all frames have duration or none do
const frames = [
    { x: 0, y: 0, width: 32, height: 32, duration: 0.1 },
    { x: 32, y: 0, width: 32, height: 32, duration: 0.1 },
    { x: 64, y: 0, width: 32, height: 32, duration: 0.2 }
];
```

## Integration Points

- **Animation**: Extends base Animation class for timing and events
- **Animator**: Uses SpriteAnimation for sprite-based animation
- **SpriteRenderer**: Receives frame updates to display current frame
- **AssetLoader**: Loads sprite sheet textures
- **EventEmitter**: Inherited event system for animation callbacks