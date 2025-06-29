# Animation Class Documentation

## Overview
The `Animation` class is an abstract base class that provides the foundation for all animation types in ImplementEngine. It handles timing, playback control, looping, events, and state management. Concrete implementations like SpriteAnimation extend this class to provide specific animation functionality.

## Class Declaration
```typescript
export abstract class Animation extends EventEmitter
```

## Interface

### AnimationEvent Interface
```typescript
interface AnimationEvent {
    type: 'start' | 'end' | 'loop' | 'pause' | 'resume';
    animation: Animation;        // Reference to the animation
    currentTime?: number;        // Current time when event occurred
}
```

## Constructor
```typescript
constructor(name: string, duration: number)
```

**Parameters:**
- `name` (string): Unique name for the animation
- `duration` (number): Total duration in seconds

**Example:**
```typescript
// Creating a custom animation (would be done in subclass)
class CustomAnimation extends Animation {
    constructor() {
        super('my-animation', 2.5); // 2.5 second animation
    }
    
    protected onUpdate(normalizedTime: number): void {
        // Implementation specific logic
    }
    
    protected onEnd(): void {
        // Cleanup when animation ends
    }
    
    protected onStop(): void {
        // Cleanup when animation is stopped
    }
}
```

## Properties

### Basic Properties

#### `name: string`
The name identifier for this animation.

#### `duration: number`
Total duration of the animation in seconds.

#### `loop: boolean`
Whether the animation should loop when it reaches the end.

#### `autoDestroy: boolean`
Whether the animation should automatically destroy itself when finished.

**Example:**
```typescript
animation.name = 'character-walk';
animation.duration = 1.0;
animation.loop = true;
animation.autoDestroy = false;
```

### Playback State (Read-only)

#### `isPlaying: boolean` (get)
True if animation is currently playing (not paused).

#### `isPaused: boolean` (get)
True if animation is currently paused.

#### `currentTime: number` (get)
Current playback time in seconds.

#### `progress: number` (get)
Progress from 0.0 to 1.0+ (can exceed 1.0 before looping).

#### `normalizedTime: number` (get)
Progress clamped between 0.0 and 1.0.

**Example:**
```typescript
if (animation.isPlaying) {
    console.log(`Time: ${animation.currentTime.toFixed(2)}s`);
    console.log(`Progress: ${(animation.progress * 100).toFixed(1)}%`);
}
```

### Playback Control

#### `playbackSpeed: number` (get/set)
Speed multiplier for playback (1.0 = normal, 2.0 = double speed).

#### `loopCount: number` (get)
Number of times the animation has looped.

#### `maxLoops: number` (get/set)
Maximum number of loops (-1 = infinite).

**Example:**
```typescript
// Double speed playback
animation.playbackSpeed = 2.0;

// Limit to 3 loops
animation.maxLoops = 3;

// Check how many times it has looped
console.log(`Looped ${animation.loopCount} times`);
```

## Methods

### Playback Controls

#### `play(): void`
Starts or resumes animation playback.

#### `pause(): void`
Pauses animation playback.

#### `resume(): void`
Resumes paused animation.

#### `stop(): void`
Stops animation and resets to beginning.

#### `restart(): void`
Stops and immediately starts the animation from the beginning.

**Example:**
```typescript
// Basic playback control
animation.play();
setTimeout(() => animation.pause(), 1000);
setTimeout(() => animation.resume(), 2000);
setTimeout(() => animation.stop(), 3000);

// Quick restart
animation.restart();
```

### Time Control

#### `setTime(time: number): void`
Sets the current playback time (triggers appropriate callbacks).

#### `update(deltaTime: number): void`
Updates animation by the given time delta (called by animation system).

**Example:**
```typescript
// Jump to specific time
animation.setTime(1.5); // Jump to 1.5 seconds

// Manual update (usually done by system)
animation.update(Time.deltaTime);
```

### Cleanup

#### `destroy(): void`
Stops animation and removes all event listeners.

**Example:**
```typescript
// Clean up animation
animation.destroy();
```

## Abstract Methods

These methods must be implemented by subclasses:

#### `protected abstract onUpdate(normalizedTime: number): void`
Called each frame while animation is playing.

#### `protected abstract onEnd(): void`
Called when animation reaches the end.

#### `protected abstract onStop(): void`
Called when animation is manually stopped.

#### `clone(): Animation`
Should return a copy of the animation.

#### `reverse(): Animation`
Should return a reversed version of the animation.

## Events

The Animation class emits the following events:

- `start` - Animation starts playing
- `pause` - Animation is paused
- `resume` - Animation resumes from pause
- `loop` - Animation completes a loop cycle
- `end` - Animation finishes (no more loops)

**Example:**
```typescript
animation.on('start', (event: AnimationEvent) => {
    console.log(`Animation ${event.animation.name} started`);
});

animation.on('loop', (event: AnimationEvent) => {
    console.log(`Animation looped (count: ${event.animation.loopCount})`);
});

animation.on('end', (event: AnimationEvent) => {
    console.log(`Animation finished at time: ${event.currentTime}`);
});
```

## Usage Examples

### Custom Tween Animation
```typescript
class TweenAnimation extends Animation {
    private startValue: number;
    private endValue: number;
    private target: any;
    private property: string;
    private easingFunction: (t: number) => number;
    
    constructor(
        name: string,
        target: any,
        property: string,
        startValue: number,
        endValue: number,
        duration: number,
        easingFunction: (t: number) => number = (t) => t
    ) {
        super(name, duration);
        this.target = target;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.easingFunction = easingFunction;
    }
    
    protected onUpdate(normalizedTime: number): void {
        const easedTime = this.easingFunction(normalizedTime);
        const currentValue = this.startValue + (this.endValue - this.startValue) * easedTime;
        this.target[this.property] = currentValue;
    }
    
    protected onEnd(): void {
        this.target[this.property] = this.endValue;
    }
    
    protected onStop(): void {
        // Could reset to start value or leave as-is
    }
    
    public clone(): TweenAnimation {
        return new TweenAnimation(
            this.name + '_clone',
            this.target,
            this.property,
            this.startValue,
            this.endValue,
            this.duration,
            this.easingFunction
        );
    }
    
    public reverse(): TweenAnimation {
        return new TweenAnimation(
            this.name + '_reversed',
            this.target,
            this.property,
            this.endValue,
            this.startValue,
            this.duration,
            this.easingFunction
        );
    }
}

// Usage
const fadeAnimation = new TweenAnimation(
    'fade-out',
    spriteRenderer,
    'alpha',
    1.0,
    0.0,
    2.0,
    (t) => t * t // Quadratic easing
);

fadeAnimation.loop = false;
fadeAnimation.play();
```

### Sequence Animation
```typescript
class SequenceAnimation extends Animation {
    private animations: Animation[];
    private currentAnimationIndex: number = 0;
    private startTimes: number[] = [];
    
    constructor(name: string, animations: Animation[]) {
        super(name, 0);
        this.animations = animations;
        this.calculateDuration();
        this.calculateStartTimes();
    }
    
    private calculateDuration(): void {
        this.duration = this.animations.reduce((total, anim) => total + anim.duration, 0);
    }
    
    private calculateStartTimes(): void {
        this.startTimes = [];
        let accumulated = 0;
        
        for (const anim of this.animations) {
            this.startTimes.push(accumulated);
            accumulated += anim.duration;
        }
    }
    
    protected onUpdate(normalizedTime: number): void {
        const currentTime = normalizedTime * this.duration;
        
        // Find which animation should be playing
        let activeIndex = 0;
        for (let i = 0; i < this.startTimes.length; i++) {
            if (currentTime >= this.startTimes[i]) {
                activeIndex = i;
            } else {
                break;
            }
        }
        
        // Update the active animation
        if (activeIndex < this.animations.length) {
            const activeAnimation = this.animations[activeIndex];
            const localTime = currentTime - this.startTimes[activeIndex];
            const localNormalizedTime = localTime / activeAnimation.duration;
            
            // Only update if this animation should be active
            if (localNormalizedTime <= 1.0) {
                activeAnimation.setTime(localTime);
            }
        }
    }
    
    protected onEnd(): void {
        // Ensure all animations are completed
        this.animations.forEach(anim => {
            anim.setTime(anim.duration);
        });
    }
    
    protected onStop(): void {
        // Stop all child animations
        this.animations.forEach(anim => anim.stop());
    }
    
    public clone(): SequenceAnimation {
        const clonedAnimations = this.animations.map(anim => anim.clone());
        return new SequenceAnimation(this.name + '_clone', clonedAnimations);
    }
    
    public reverse(): SequenceAnimation {
        const reversedAnimations = this.animations.slice().reverse().map(anim => anim.reverse());
        return new SequenceAnimation(this.name + '_reversed', reversedAnimations);
    }
}
```

### Value Animation with Callbacks
```typescript
class ValueAnimation extends Animation {
    private startValue: number;
    private endValue: number;
    private currentValue: number;
    private onValueChanged: (value: number) => void;
    private easingFunction: (t: number) => number;
    
    constructor(
        name: string,
        startValue: number,
        endValue: number,
        duration: number,
        onValueChanged: (value: number) => void,
        easingFunction?: (t: number) => number
    ) {
        super(name, duration);
        this.startValue = startValue;
        this.endValue = endValue;
        this.currentValue = startValue;
        this.onValueChanged = onValueChanged;
        this.easingFunction = easingFunction || ((t) => t);
    }
    
    public get value(): number {
        return this.currentValue;
    }
    
    protected onUpdate(normalizedTime: number): void {
        const easedTime = this.easingFunction(normalizedTime);
        this.currentValue = this.startValue + (this.endValue - this.startValue) * easedTime;
        this.onValueChanged(this.currentValue);
    }
    
    protected onEnd(): void {
        this.currentValue = this.endValue;
        this.onValueChanged(this.currentValue);
    }
    
    protected onStop(): void {
        // Value remains at current position
    }
    
    public clone(): ValueAnimation {
        return new ValueAnimation(
            this.name + '_clone',
            this.startValue,
            this.endValue,
            this.duration,
            this.onValueChanged,
            this.easingFunction
        );
    }
    
    public reverse(): ValueAnimation {
        return new ValueAnimation(
            this.name + '_reversed',
            this.endValue,
            this.startValue,
            this.duration,
            this.onValueChanged,
            this.easingFunction
        );
    }
}

// Usage for health bar animation
const healthBar = document.getElementById('health-bar');
const healthAnimation = new ValueAnimation(
    'health-change',
    100, // From 100%
    25,  // To 25%
    1.0, // Over 1 second
    (value) => {
        healthBar.style.width = `${value}%`;
        healthBar.style.backgroundColor = value > 50 ? 'green' : value > 25 ? 'yellow' : 'red';
    },
    (t) => 1 - Math.pow(1 - t, 3) // Ease-out cubic
);

healthAnimation.play();
```

### Animation Controller
```typescript
class AnimationController {
    private animations: Map<string, Animation> = new Map();
    private activeAnimations: Set<Animation> = new Set();
    
    public addAnimation(animation: Animation): void {
        this.animations.set(animation.name, animation);
        
        // Set up event listeners
        animation.on('start', () => {
            this.activeAnimations.add(animation);
        });
        
        animation.on('end', () => {
            this.activeAnimations.delete(animation);
        });
    }
    
    public play(name: string): void {
        const animation = this.animations.get(name);
        if (animation) {
            animation.play();
        }
    }
    
    public stop(name: string): void {
        const animation = this.animations.get(name);
        if (animation) {
            animation.stop();
        }
    }
    
    public stopAll(): void {
        this.activeAnimations.forEach(animation => animation.stop());
    }
    
    public pauseAll(): void {
        this.activeAnimations.forEach(animation => animation.pause());
    }
    
    public resumeAll(): void {
        this.activeAnimations.forEach(animation => animation.resume());
    }
    
    public update(deltaTime: number): void {
        this.activeAnimations.forEach(animation => {
            animation.update(deltaTime);
        });
    }
    
    public getAnimation(name: string): Animation | null {
        return this.animations.get(name) || null;
    }
    
    public getAllAnimations(): Animation[] {
        return Array.from(this.animations.values());
    }
    
    public getActiveAnimations(): Animation[] {
        return Array.from(this.activeAnimations);
    }
    
    public destroy(): void {
        this.animations.forEach(animation => animation.destroy());
        this.animations.clear();
        this.activeAnimations.clear();
    }
}
```

### Animation Event System
```typescript
class AnimationEventManager {
    private eventQueue: AnimationEvent[] = [];
    
    public handleAnimationEvent(event: AnimationEvent): void {
        switch (event.type) {
            case 'start':
                this.onAnimationStart(event);
                break;
            case 'end':
                this.onAnimationEnd(event);
                break;
            case 'loop':
                this.onAnimationLoop(event);
                break;
            case 'pause':
                this.onAnimationPause(event);
                break;
            case 'resume':
                this.onAnimationResume(event);
                break;
        }
        
        // Queue event for batch processing
        this.eventQueue.push(event);
    }
    
    private onAnimationStart(event: AnimationEvent): void {
        console.log(`Animation '${event.animation.name}' started`);
        
        // Could trigger other systems
        this.notifyAudioSystem(event);
        this.notifyParticleSystem(event);
    }
    
    private onAnimationEnd(event: AnimationEvent): void {
        console.log(`Animation '${event.animation.name}' ended`);
        
        // Clean up if auto-destroy
        if (event.animation.autoDestroy) {
            event.animation.destroy();
        }
    }
    
    private onAnimationLoop(event: AnimationEvent): void {
        console.log(`Animation '${event.animation.name}' looped (${event.animation.loopCount})`);
    }
    
    private onAnimationPause(event: AnimationEvent): void {
        console.log(`Animation '${event.animation.name}' paused at ${event.currentTime}s`);
    }
    
    private onAnimationResume(event: AnimationEvent): void {
        console.log(`Animation '${event.animation.name}' resumed at ${event.currentTime}s`);
    }
    
    private notifyAudioSystem(event: AnimationEvent): void {
        // Play sound effects based on animation
    }
    
    private notifyParticleSystem(event: AnimationEvent): void {
        // Trigger particle effects
    }
    
    public processEventQueue(): void {
        // Process all queued events
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift()!;
            // Batch process events
        }
    }
}
```

## Performance Considerations

- Animation updates are called every frame when playing
- Event emission has minimal overhead but listeners should be lightweight
- Large numbers of concurrent animations may impact performance
- Use `autoDestroy` for one-time animations to prevent memory leaks
- Consider object pooling for frequently created/destroyed animations

## Common Errors

### ❌ Not Implementing Abstract Methods
```typescript
// WRONG - Missing abstract method implementations
class MyAnimation extends Animation {
    constructor() {
        super('my-anim', 1.0);
    }
    // Missing onUpdate, onEnd, onStop implementations
}

// CORRECT - Implement all abstract methods
class MyAnimation extends Animation {
    protected onUpdate(normalizedTime: number): void { /* implementation */ }
    protected onEnd(): void { /* implementation */ }
    protected onStop(): void { /* implementation */ }
}
```

### ❌ Forgetting to Call Super in Constructor
```typescript
// WRONG - Not calling parent constructor
class MyAnimation extends Animation {
    constructor() {
        // Missing super() call
    }
}

// CORRECT - Call super with name and duration
class MyAnimation extends Animation {
    constructor() {
        super('my-animation', 2.0);
    }
}
```

### ❌ Manual Time Updates Without Bounds Checking
```typescript
// WRONG - Setting time beyond duration without handling end
animation.setTime(animation.duration + 5); // May cause issues

// CORRECT - Use proper time setting
animation.setTime(Math.min(time, animation.duration));
```

### ❌ Memory Leaks with Event Listeners
```typescript
// WRONG - Not removing event listeners
animation.on('end', someCallback);
// If animation persists, callback may hold references

// CORRECT - Remove listeners or use destroy()
animation.off('end', someCallback);
// Or
animation.destroy(); // Removes all listeners
```

## Integration Points

- **EventEmitter**: Inherits event system for animation callbacks
- **Animator**: Uses Animation instances for sprite animation
- **TweenManager**: May use Animation as base for tween systems
- **AnimationStateMachine**: Manages Animation instances and transitions
- **Time**: Provides deltaTime for animation updates