# Animator Component Documentation

## Overview
The `Animator` component provides sprite animation and state machine functionality. It integrates with SpriteRenderer to display animated sprites, supports state transitions, triggers, and provides a complete animation system for 2D games. Uses the AnimationStateMachine for complex animation logic.

## Class Declaration
```typescript
export class Animator extends Component
```

## Constructor
```typescript
constructor()
```

Creates an Animator with an internal AnimationStateMachine and EventEmitter for animation events.

## Properties (Read-only)

### Current State

#### `currentAnimation: string | null` (get)
Name of the currently playing animation.

#### `isPlaying: boolean` (get)
Whether any animation is currently playing.

#### `isInTransition: boolean` (get)
Whether the animator is transitioning between states.

**Example:**
```typescript
// Check current state
if (animator.isPlaying) {
    console.log(`Playing: ${animator.currentAnimation}`);
}

if (animator.isInTransition) {
    console.log('Transitioning between animations');
}
```

## Methods

### Animation Management

#### `addAnimation(animationData: SpriteAnimationData): void`
Adds a new animation to the animator and creates a corresponding state.

#### `removeAnimation(name: string): boolean`
Removes an animation and its state. Returns true if removed successfully.

#### `hasAnimation(name: string): boolean`
Checks if an animation exists.

#### `getAnimation(name: string): SpriteAnimation | null`
Gets the SpriteAnimation object by name.

#### `getAnimationNames(): string[]`
Returns array of all animation names.

**Example:**
```typescript
// Add animation from data
const animData: SpriteAnimationData = {
    name: 'walk',
    texture: spriteSheet,
    frames: walkFrames,
    fps: 8,
    loop: true
};
animator.addAnimation(animData);

// Check if animation exists
if (animator.hasAnimation('walk')) {
    console.log('Walk animation loaded');
}

// Get all animations
const allAnims = animator.getAnimationNames();
console.log('Available animations:', allAnims);
```

### Playback Controls

#### `play(animationName?: string): void`
Plays the specified animation or resumes current animation.

#### `pause(): void`
Pauses the current animation.

#### `resume(): void`
Resumes the paused animation.

#### `stop(): void`
Stops the current animation.

#### `setSpeed(speed: number): void`
Sets the playback speed multiplier (1.0 = normal, 2.0 = 2x speed).

#### `setLoop(loop: boolean): void`
Sets whether the current animation should loop.

**Example:**
```typescript
// Play specific animation
animator.play('run');

// Pause animation
animator.pause();

// Resume after pause
animator.resume();

// Stop animation
animator.stop();

// Double speed
animator.setSpeed(2.0);

// Disable looping
animator.setLoop(false);
```

### State Machine Controls

#### `addTransition(from: string, to: string, condition?: () => boolean, duration?: number): void`
Adds a transition between animation states with optional condition and crossfade duration.

#### `addTriggerTransition(from: string, to: string, trigger: string, duration?: number): void`
Adds a trigger-based transition between states.

#### `trigger(triggerName: string): void`
Triggers a named transition.

**Example:**
```typescript
// Condition-based transition
animator.addTransition('idle', 'walk', () => {
    return Input.getKey('d') || Input.getKey('a');
}, 0.2);

// Trigger-based transition
animator.addTriggerTransition('idle', 'attack', 'doAttack', 0.1);

// Trigger the attack
if (Input.getKeyDown(' ')) {
    animator.trigger('doAttack');
}
```

### Animation Information

#### `getCurrentFrame(): number`
Gets the current frame index of the playing animation.

#### `getFrameCount(): number`
Gets the total frame count of the current animation.

#### `getProgress(): number`
Gets the progress of the current animation (0.0 to 1.0).

**Example:**
```typescript
// Check animation progress
const frame = animator.getCurrentFrame();
const total = animator.getFrameCount();
const progress = animator.getProgress();

console.log(`Frame ${frame}/${total} (${(progress * 100).toFixed(1)}%)`);
```

### Convenience Methods

#### `playOnce(animationName: string, onComplete?: () => void): void`
Plays an animation once regardless of its loop setting, with optional completion callback.

#### `crossfade(animationName: string, duration: number = 0.3): void`
Smoothly transitions to another animation with crossfading.

#### `setDefaultAnimation(animationName: string): void`
Sets the default animation to play on start.

#### `setAutoPlay(autoPlay: boolean): void`
Sets whether animations should auto-play on start.

**Example:**
```typescript
// Play attack animation once
animator.playOnce('attack', () => {
    console.log('Attack animation finished');
    animator.play('idle');
});

// Smooth transition to run
animator.crossfade('run', 0.5);

// Set default startup animation
animator.setDefaultAnimation('idle');
```

### Helper Methods for Creating Animations

#### `createSpriteSheetAnimation(name, texture, frameWidth, frameHeight, frameCount, fps, loop): void`
Creates an animation from a sprite sheet with uniform frame sizes.

#### `createFrameRangeAnimation(name, texture, frameWidth, frameHeight, startFrame, endFrame, fps, loop): void`
Creates an animation from a range of frames in a sprite sheet.

#### `createCustomFrameAnimation(name, texture, frameIndices, frameWidth, frameHeight, fps, loop): void`
Creates an animation from custom frame indices.

**Example:**
```typescript
// Create walk animation from sprite sheet
animator.createSpriteSheetAnimation(
    'walk',           // name
    spriteSheet,      // texture
    32,               // frame width
    32,               // frame height
    8,                // frame count
    12,               // fps
    true              // loop
);

// Create attack from specific frames
animator.createFrameRangeAnimation(
    'attack',
    spriteSheet,
    32, 32,
    24, 31,           // frames 24-31
    15,               // fps
    false             // don't loop
);

// Create custom frame sequence
animator.createCustomFrameAnimation(
    'special',
    spriteSheet,
    [0, 1, 2, 1, 0],  // custom frame order
    32, 32,
    8,
    false
);
```

### Event System

#### `on(event: string, listener: (...args: any[]) => void): void`
Adds event listener for animation events.

#### `off(event: string, listener: (...args: any[]) => void): void`
Removes event listener.

#### `once(event: string, listener: (...args: any[]) => void): void`
Adds one-time event listener.

**Events:**
- `animationChanged` - When animation state changes
- `transitionStarted` - When transition begins
- `transitionCompleted` - When transition finishes
- `animationEnter` - When entering an animation state
- `animationExit` - When leaving an animation state

**Example:**
```typescript
// Listen for animation changes
animator.on('animationChanged', (event) => {
    console.log(`Changed from ${event.from} to ${event.to}`);
});

// Listen for transition completion
animator.once('transitionCompleted', () => {
    console.log('Transition finished');
});
```

### Static Tween Management

#### `static updateTweens(deltaTime: number): void`
Updates all active tweens (called by engine).

#### `static killAllTweens(): void`
Stops all active tweens.

#### `static getTweenCount(): number`
Gets the number of active tweens.

## Usage Examples

### Basic Character Animation
```typescript
class Character extends Component {
    private animator: Animator;
    private spriteRenderer: SpriteRenderer;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.animator = this.addComponent(Animator);
        
        // Load sprite sheet
        this.loadAnimations();
        
        // Set up state transitions
        this.setupStateMachine();
    }
    
    private async loadAnimations(): Promise<void> {
        const spriteSheet = await AssetLoader.loadImage('character-sheet');
        
        // Create animations
        this.animator.createSpriteSheetAnimation('idle', spriteSheet, 32, 32, 4, 6, true);
        this.animator.createFrameRangeAnimation('walk', spriteSheet, 32, 32, 4, 11, 8, true);
        this.animator.createFrameRangeAnimation('run', spriteSheet, 32, 32, 12, 19, 12, true);
        this.animator.createFrameRangeAnimation('jump', spriteSheet, 32, 32, 20, 23, 10, false);
        this.animator.createFrameRangeAnimation('attack', spriteSheet, 32, 32, 24, 31, 15, false);
        
        this.animator.setDefaultAnimation('idle');
    }
    
    private setupStateMachine(): void {
        // Idle transitions
        this.animator.addTransition('idle', 'walk', () => this.isWalking(), 0.1);
        this.animator.addTransition('idle', 'jump', () => this.isJumping(), 0.05);
        this.animator.addTriggerTransition('idle', 'attack', 'attack', 0.05);
        
        // Walk transitions
        this.animator.addTransition('walk', 'idle', () => !this.isWalking(), 0.1);
        this.animator.addTransition('walk', 'run', () => this.isRunning(), 0.1);
        this.animator.addTransition('walk', 'jump', () => this.isJumping(), 0.05);
        
        // Run transitions
        this.animator.addTransition('run', 'walk', () => !this.isRunning(), 0.1);
        this.animator.addTransition('run', 'jump', () => this.isJumping(), 0.05);
        
        // Jump transitions
        this.animator.addTransition('jump', 'idle', () => this.isGrounded(), 0.1);
        
        // Attack transitions (back to previous state)
        this.animator.on('animationExit', (event) => {
            if (event.animationName === 'attack') {
                if (this.isWalking()) {
                    this.animator.play('walk');
                } else {
                    this.animator.play('idle');
                }
            }
        });
    }
    
    update(): void {
        // Handle attack input
        if (Input.getKeyDown(' ')) {
            this.animator.trigger('attack');
        }
    }
    
    private isWalking(): boolean {
        return (Input.getKey('a') || Input.getKey('d')) && !Input.getKey('shift');
    }
    
    private isRunning(): boolean {
        return (Input.getKey('a') || Input.getKey('d')) && Input.getKey('shift');
    }
    
    private isJumping(): boolean {
        return Input.getKeyDown('w') && this.isGrounded();
    }
    
    private isGrounded(): boolean {
        // Check if character is on ground
        return true; // Placeholder
    }
}
```

### Enemy AI Animation
```typescript
class Enemy extends Component {
    private animator: Animator;
    private player: GameObject | null = null;
    private detectionRange: number = 100;
    private attackRange: number = 40;
    private health: number = 100;
    
    start(): void {
        this.animator = this.addComponent(Animator);
        this.loadEnemyAnimations();
        this.setupEnemyStateMachine();
        
        // Find player
        this.player = this.scene.findGameObject('Player');
    }
    
    private async loadEnemyAnimations(): Promise<void> {
        const spriteSheet = await AssetLoader.loadImage('enemy-sheet');
        
        this.animator.createSpriteSheetAnimation('patrol', spriteSheet, 48, 48, 6, 4, true);
        this.animator.createSpriteSheetAnimation('chase', spriteSheet, 48, 48, 8, 8, true);
        this.animator.createSpriteSheetAnimation('attack', spriteSheet, 48, 48, 4, 12, false);
        this.animator.createSpriteSheetAnimation('hurt', spriteSheet, 48, 48, 3, 10, false);
        this.animator.createSpriteSheetAnimation('death', spriteSheet, 48, 48, 5, 6, false);
        
        this.animator.setDefaultAnimation('patrol');
    }
    
    private setupEnemyStateMachine(): void {
        // Patrol -> Chase
        this.animator.addTransition('patrol', 'chase', () => this.canSeePlayer(), 0.2);
        
        // Chase -> Patrol
        this.animator.addTransition('chase', 'patrol', () => !this.canSeePlayer(), 1.0);
        
        // Chase -> Attack
        this.animator.addTransition('chase', 'attack', () => this.isInAttackRange(), 0.1);
        
        // Attack -> Chase
        this.animator.addTransition('attack', 'chase', () => !this.isInAttackRange(), 0.1);
        
        // Any -> Hurt
        this.animator.addTriggerTransition('patrol', 'hurt', 'takeDamage', 0.05);
        this.animator.addTriggerTransition('chase', 'hurt', 'takeDamage', 0.05);
        this.animator.addTriggerTransition('attack', 'hurt', 'takeDamage', 0.05);
        
        // Hurt -> previous state
        this.animator.on('animationExit', (event) => {
            if (event.animationName === 'hurt') {
                if (this.health <= 0) {
                    this.animator.play('death');
                } else if (this.canSeePlayer()) {
                    this.animator.play('chase');
                } else {
                    this.animator.play('patrol');
                }
            }
        });
        
        // Death is final
        this.animator.on('animationEnter', (event) => {
            if (event.animationName === 'death') {
                // Disable AI, collision, etc.
                this.enabled = false;
            }
        });
    }
    
    public takeDamage(amount: number): void {
        this.health -= amount;
        this.animator.trigger('takeDamage');
    }
    
    private canSeePlayer(): boolean {
        if (!this.player) return false;
        const distance = this.transform.position.distance(this.player.transform.position);
        return distance <= this.detectionRange;
    }
    
    private isInAttackRange(): boolean {
        if (!this.player) return false;
        const distance = this.transform.position.distance(this.player.transform.position);
        return distance <= this.attackRange;
    }
}
```

### Interactive Object Animation
```typescript
class Chest extends Component {
    private animator: Animator;
    private isOpen: boolean = false;
    private loot: string[] = ['Gold', 'Potion', 'Key'];
    
    start(): void {
        this.animator = this.addComponent(Animator);
        this.setupChestAnimation();
        
        // Add interaction trigger
        const collider = this.addComponent(CircleCollider2D);
        collider.setRadius(30);
        collider.isTrigger = true;
        
        this.scene.on('triggerEnter2D', this.onPlayerNear.bind(this));
    }
    
    private async setupChestAnimation(): Promise<void> {
        const spriteSheet = await AssetLoader.loadImage('chest-sheet');
        
        this.animator.createSpriteSheetAnimation('closed', spriteSheet, 32, 32, 1, 1, false);
        this.animator.createFrameRangeAnimation('opening', spriteSheet, 32, 32, 1, 8, 12, false);
        this.animator.createSpriteSheetAnimation('open', spriteSheet, 32, 32, 1, 1, false);
        
        this.animator.setDefaultAnimation('closed');
        
        // Opening animation leads to open state
        this.animator.on('animationExit', (event) => {
            if (event.animationName === 'opening') {
                this.animator.play('open');
                this.onChestOpened();
            }
        });
    }
    
    private onPlayerNear(event: any): void {
        if (event.otherGameObject.name === 'Player' && !this.isOpen) {
            this.showInteractionPrompt();
        }
    }
    
    public interact(): void {
        if (!this.isOpen) {
            this.isOpen = true;
            this.animator.play('opening');
        }
    }
    
    private onChestOpened(): void {
        // Spawn loot
        this.loot.forEach((item, index) => {
            setTimeout(() => {
                this.spawnLoot(item);
            }, index * 200);
        });
    }
    
    private showInteractionPrompt(): void {
        // Show "Press F to open" UI
    }
    
    private spawnLoot(item: string): void {
        // Create loot GameObject with item
    }
}
```

### UI Animation
```typescript
class MenuAnimator extends Component {
    private animator: Animator;
    
    start(): void {
        this.animator = this.addComponent(Animator);
        this.setupMenuAnimations();
    }
    
    private async setupMenuAnimations(): Promise<void> {
        const buttonSprites = await AssetLoader.loadImage('ui-buttons');
        
        // Button states
        this.animator.createSpriteSheetAnimation('normal', buttonSprites, 100, 30, 1, 1, false);
        this.animator.createSpriteSheetAnimation('hover', buttonSprites, 100, 30, 3, 8, true);
        this.animator.createFrameRangeAnimation('pressed', buttonSprites, 100, 30, 3, 5, 15, false);
        
        this.animator.setDefaultAnimation('normal');
        
        // Set up transitions
        this.animator.addTriggerTransition('normal', 'hover', 'mouseEnter', 0.1);
        this.animator.addTriggerTransition('hover', 'normal', 'mouseExit', 0.1);
        this.animator.addTriggerTransition('hover', 'pressed', 'mouseDown', 0.05);
        this.animator.addTransition('pressed', 'hover', () => !Input.getMouseButton(0), 0.05);
    }
    
    public onMouseEnter(): void {
        this.animator.trigger('mouseEnter');
    }
    
    public onMouseExit(): void {
        this.animator.trigger('mouseExit');
    }
    
    public onMouseDown(): void {
        this.animator.trigger('mouseDown');
    }
}
```

### Particle Effect Animation
```typescript
class AnimatedParticle extends Component {
    private animator: Animator;
    private lifetime: number;
    
    constructor(lifetime: number = 2.0) {
        super();
        this.lifetime = lifetime;
    }
    
    start(): void {
        this.animator = this.addComponent(Animator);
        this.setupParticleAnimation();
        
        // Auto-destroy after lifetime
        setTimeout(() => {
            this.gameObject.destroy();
        }, this.lifetime * 1000);
    }
    
    private async setupParticleAnimation(): Promise<void> {
        const particleSheet = await AssetLoader.loadImage('particle-effects');
        
        // Different particle effects
        this.animator.createSpriteSheetAnimation('spark', particleSheet, 16, 16, 8, 20, false);
        this.animator.createFrameRangeAnimation('smoke', particleSheet, 16, 16, 8, 15, 12, false);
        this.animator.createFrameRangeAnimation('explosion', particleSheet, 32, 32, 16, 23, 25, false);
        
        // Start with random effect
        const effects = ['spark', 'smoke', 'explosion'];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        this.animator.play(randomEffect);
        
        // Fade out near end of lifetime
        this.animator.on('animationExit', () => {
            this.fadeOut();
        });
    }
    
    private fadeOut(): void {
        const spriteRenderer = this.getComponent(SpriteRenderer);
        if (spriteRenderer) {
            // Simple fade using Tween system
            TweenManager.to(spriteRenderer, 0.5, {
                alpha: 0,
                onComplete: () => {
                    this.gameObject.destroy();
                }
            });
        }
    }
}
```

## Performance Considerations

- Animator updates state machine and sprite renderer each frame
- State transitions with conditions are evaluated every frame
- Animation frame updates are optimized but sprite sheet access has cost
- Event system adds minimal overhead for animation callbacks
- Multiple animators can share the same SpriteAnimation instances

## Common Errors

### ❌ Missing SpriteRenderer
```typescript
// WRONG - Animator needs SpriteRenderer
const animator = gameObject.addComponent(Animator);
// No SpriteRenderer component will cause warnings

// CORRECT - Add SpriteRenderer first
const spriteRenderer = gameObject.addComponent(SpriteRenderer);
const animator = gameObject.addComponent(Animator);
```

### ❌ Forgetting to Set Default Animation
```typescript
// WRONG - No default animation set
animator.addAnimation(animData);
// Animation won't auto-play

// CORRECT - Set default for auto-play
animator.addAnimation(animData);
animator.setDefaultAnimation(animData.name);
```

### ❌ Circular State Transitions
```typescript
// WRONG - Can cause infinite transitions
animator.addTransition('walk', 'run', () => true);
animator.addTransition('run', 'walk', () => true);

// CORRECT - Use proper conditions
animator.addTransition('walk', 'run', () => Input.getKey('shift'));
animator.addTransition('run', 'walk', () => !Input.getKey('shift'));
```

### ❌ Expensive Transition Conditions
```typescript
// WRONG - Expensive operation every frame
animator.addTransition('idle', 'alert', () => {
    return this.findAllEnemies().length > 0; // Expensive!
});

// CORRECT - Cache or use triggers
private enemyCount = 0;
// Update enemyCount when enemies spawn/die
animator.addTransition('idle', 'alert', () => this.enemyCount > 0);
```

## Integration Points

- **SpriteRenderer**: Automatically updates sprite and source rectangle
- **AnimationStateMachine**: Provides state management and transitions
- **SpriteAnimation**: Handles frame sequencing and timing
- **TweenManager**: Static methods for managing global tweens
- **EventEmitter**: Provides animation events and callbacks