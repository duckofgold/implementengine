# Time Class Documentation

## Overview
The `Time` class provides time management functionality for ImplementEngine. It tracks delta time, total time, frame rate, and provides time scaling and pause capabilities. Uses singleton pattern with static access methods.

## Class Declaration
```typescript
export class Time
```

## Static Properties (Read-Only)

### `deltaTime: number`
Time in seconds since the last frame.
- Affected by timeScale
- Zero when paused
- Clamped to maximum of 0.1 seconds (prevents huge jumps)

### `time: number`
Total time in seconds since engine start.
- Affected by timeScale
- Does not advance when paused
- Resets when engine restarts

### `timeScale: number`
Time scaling factor.
- `1.0` = Normal speed
- `2.0` = Double speed
- `0.5` = Half speed
- `0.0` = Effectively paused
- Cannot be negative (clamped to 0)

### `isPaused: boolean`
Whether time is currently paused.
- When true, deltaTime returns 0
- time does not advance
- Controlled by pause()/resume() methods

### `frameCount: number`
Total number of frames since engine start.
- Increments every frame regardless of pause state
- Resets when engine restarts

### `fps: number`
Current frames per second.
- Updated approximately every second
- Based on actual frame timing, not target FPS

## Static Methods

### `pause(): void`
Pauses time advancement.
- Sets isPaused to true
- deltaTime becomes 0
- time stops advancing
- frameCount continues incrementing

### `resume(): void`
Resumes time advancement.
- Sets isPaused to false
- deltaTime returns to normal values
- time resumes advancing

### `update(): void`
Updates time values (called by Engine).
- Calculates deltaTime from performance.now()
- Advances total time
- Updates FPS counter
- **Internal method - do not call manually**

### `reset(): void`
Resets all time values to zero (called by Engine).
- **Internal method - do not call manually**

## Usage Examples

### Basic Time Usage
```typescript
import { Time } from '../core/Time';

class MovementComponent extends Component {
    private speed: number = 100; // pixels per second
    
    update(): void {
        // Move at consistent speed regardless of framerate
        const movement = this.speed * Time.deltaTime;
        
        if (this.transform) {
            this.transform.position.x += movement;
        }
    }
}
```

### Time-Based Animation
```typescript
class AnimatedComponent extends Component {
    private frequency: number = 2; // oscillations per second
    private amplitude: number = 50; // pixels
    private basePosition: Vector2 = Vector2.zero;
    
    start(): void {
        if (this.transform) {
            this.basePosition = this.transform.position.clone();
        }
    }
    
    update(): void {
        if (this.transform) {
            // Sine wave animation based on total time
            const offset = Math.sin(Time.time * this.frequency * Math.PI * 2) * this.amplitude;
            this.transform.position = this.basePosition.add(new Vector2(0, offset));
        }
    }
}
```

### Frame Rate Independent Movement
```typescript
class PlayerController extends Component {
    private moveSpeed: number = 200; // pixels per second
    private jumpForce: number = 500;
    
    update(): void {
        // Horizontal movement
        let moveInput = 0;
        if (Input.getKey('a')) moveInput = -1;
        if (Input.getKey('d')) moveInput = 1;
        
        if (moveInput !== 0 && this.transform) {
            // Frame-rate independent movement
            const movement = moveInput * this.moveSpeed * Time.deltaTime;
            this.transform.position.x += movement;
        }
        
        // Jump with physics
        if (Input.getKeyDown(' ')) {
            const rigidbody = this.getComponent(Rigidbody2D);
            if (rigidbody) {
                rigidbody.addForce(new Vector2(0, -this.jumpForce), ForceMode.Impulse);
            }
        }
    }
}
```

### Cooldown System
```typescript
class WeaponComponent extends Component {
    private fireRate: number = 2; // shots per second
    private lastFireTime: number = 0;
    
    update(): void {
        if (Input.getKey(' ') && this.canFire()) {
            this.fire();
            this.lastFireTime = Time.time;
        }
    }
    
    private canFire(): boolean {
        const cooldown = 1 / this.fireRate; // seconds between shots
        return Time.time - this.lastFireTime >= cooldown;
    }
    
    private fire(): void {
        console.log('Bang!');
        // Create bullet, play sound, etc.
    }
}
```

### Time Scale Effects
```typescript
class TimeManager extends Component {
    start(): void {
        // Set up time scale controls
        Input.on('keyDown', this.handleTimeControls.bind(this));
    }
    
    private handleTimeControls(key: string): void {
        switch (key) {
            case '1':
                Time.timeScale = 0.5; // Slow motion
                break;
            case '2':
                Time.timeScale = 1.0; // Normal speed
                break;
            case '3':
                Time.timeScale = 2.0; // Fast forward
                break;
            case 'p':
                if (Time.isPaused) {
                    Time.resume();
                } else {
                    Time.pause();
                }
                break;
        }
    }
}
```

### Timer Component
```typescript
class Timer extends Component {
    private duration: number;
    private startTime: number = 0;
    private isRunning: boolean = false;
    private onComplete: (() => void) | null = null;
    
    constructor(duration: number, onComplete?: () => void) {
        super();
        this.duration = duration;
        this.onComplete = onComplete || null;
    }
    
    public start(): void {
        this.startTime = Time.time;
        this.isRunning = true;
    }
    
    public stop(): void {
        this.isRunning = false;
    }
    
    public reset(): void {
        this.startTime = Time.time;
    }
    
    update(): void {
        if (!this.isRunning) return;
        
        if (this.getElapsed() >= this.duration) {
            this.isRunning = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    public getElapsed(): number {
        return Time.time - this.startTime;
    }
    
    public getRemaining(): number {
        return Math.max(0, this.duration - this.getElapsed());
    }
    
    public getProgress(): number {
        return Math.min(1, this.getElapsed() / this.duration);
    }
}

// Usage
const timer = gameObject.addComponent(Timer, 5.0, () => {
    console.log('Timer finished!');
});
timer.start();
```

### FPS Display Component
```typescript
class FPSDisplay extends Component {
    private textElement: HTMLElement | null = null;
    
    start(): void {
        // Create FPS display element
        this.textElement = document.createElement('div');
        this.textElement.style.position = 'absolute';
        this.textElement.style.top = '10px';
        this.textElement.style.left = '10px';
        this.textElement.style.color = 'white';
        this.textElement.style.fontFamily = 'monospace';
        this.textElement.style.fontSize = '16px';
        this.textElement.style.zIndex = '1000';
        document.body.appendChild(this.textElement);
    }
    
    update(): void {
        if (this.textElement) {
            this.textElement.textContent = `FPS: ${Time.fps} | Frame: ${Time.frameCount} | Time: ${Time.time.toFixed(2)}s`;
        }
    }
    
    onDestroy(): void {
        if (this.textElement) {
            document.body.removeChild(this.textElement);
        }
    }
}
```

### Smooth Value Interpolation
```typescript
class SmoothFollow extends Component {
    private target: Transform | null = null;
    private smoothTime: number = 2.0; // seconds to reach target
    
    public setTarget(target: Transform): void {
        this.target = target;
    }
    
    update(): void {
        if (!this.target || !this.transform) return;
        
        const targetPos = this.target.position;
        const currentPos = this.transform.position;
        
        // Exponential interpolation (frame-rate independent)
        const lerpFactor = this.smoothTime * Time.deltaTime;
        const newPos = currentPos.lerp(targetPos, lerpFactor);
        
        this.transform.position = newPos;
    }
}
```

### Scheduled Events
```typescript
class ScheduledEvent {
    public time: number;
    public callback: () => void;
    public executed: boolean = false;
    
    constructor(delay: number, callback: () => void) {
        this.time = Time.time + delay;
        this.callback = callback;
    }
}

class EventScheduler extends Component {
    private events: ScheduledEvent[] = [];
    
    public schedule(delay: number, callback: () => void): ScheduledEvent {
        const event = new ScheduledEvent(delay, callback);
        this.events.push(event);
        return event;
    }
    
    update(): void {
        // Process scheduled events
        this.events.forEach(event => {
            if (!event.executed && Time.time >= event.time) {
                event.callback();
                event.executed = true;
            }
        });
        
        // Remove executed events
        this.events = this.events.filter(event => !event.executed);
    }
}

// Usage
const scheduler = gameObject.addComponent(EventScheduler);
scheduler.schedule(3.0, () => {
    console.log('This happens 3 seconds later');
});
```

## Common Patterns

### Fixed Update Simulation
```typescript
class FixedUpdateComponent extends Component {
    private fixedTimeStep: number = 1/60; // 60 FPS physics
    private accumulator: number = 0;
    
    update(): void {
        this.accumulator += Time.deltaTime;
        
        while (this.accumulator >= this.fixedTimeStep) {
            this.fixedUpdate();
            this.accumulator -= this.fixedTimeStep;
        }
    }
    
    private fixedUpdate(): void {
        // Fixed timestep logic here
        // Physics, network updates, etc.
    }
}
```

### Lerp Helper
```typescript
class MathHelper {
    // Exponential interpolation (frame-rate independent)
    static exponentialLerp(current: number, target: number, rate: number): number {
        return current + (target - current) * (1 - Math.exp(-rate * Time.deltaTime));
    }
    
    // Linear interpolation over time
    static lerpOverTime(start: number, end: number, duration: number, elapsed: number): number {
        const t = Math.min(1, elapsed / duration);
        return start + (end - start) * t;
    }
}
```

## Time Scale Use Cases

### Slow Motion Effect
```typescript
class BulletTimeEffect extends Component {
    private normalTimeScale: number = 1.0;
    private slowTimeScale: number = 0.2;
    private transitionSpeed: number = 5.0;
    
    public activateSlowMotion(): void {
        this.tweenTimeScale(this.slowTimeScale);
    }
    
    public deactivateSlowMotion(): void {
        this.tweenTimeScale(this.normalTimeScale);
    }
    
    private tweenTimeScale(targetScale: number): void {
        // Smooth time scale transition
        const startScale = Time.timeScale;
        const startTime = Time.time;
        
        const updateTimeScale = () => {
            const elapsed = Time.time - startTime;
            const progress = Math.min(1, elapsed * this.transitionSpeed);
            const currentScale = MathHelper.lerpOverTime(startScale, targetScale, 1, progress);
            
            Time.timeScale = currentScale;
            
            if (progress < 1) {
                requestAnimationFrame(updateTimeScale);
            }
        };
        
        updateTimeScale();
    }
}
```

## Performance Considerations

- Time.deltaTime is calculated once per frame and cached
- FPS calculation uses a rolling average over 1 second
- Static properties avoid object allocation
- performance.now() provides high-precision timing
- Maximum deltaTime prevents spiral of death in low FPS situations

## Integration Points

- **Engine**: Calls Time.update() and Time.reset()
- **Components**: Use Time.deltaTime for frame-rate independent logic
- **Animation**: TweenManager uses Time.deltaTime for smooth animations
- **Physics**: Physics simulation uses Time.deltaTime for integration
- **Input**: Input timing can be based on Time values

## Common Errors

### ❌ Not Using Delta Time
```typescript
// WRONG - Frame rate dependent
transform.position.x += 5; // Moves faster on higher FPS
```

**Solution:**
```typescript
// CORRECT - Frame rate independent
transform.position.x += 100 * Time.deltaTime; // 100 pixels per second
```

### ❌ Using Raw Performance.now()
```typescript
// WRONG - Doesn't respect pause/timeScale
const currentTime = performance.now();
```

**Solution:**
```typescript
// CORRECT - Respects engine time management
const currentTime = Time.time;
```

### ❌ Ignoring Time Scale
```typescript
// WRONG - Doesn't respect time scale effects
setTimeout(callback, 1000); // Always 1 second real time
```

**Solution:**
```typescript
// CORRECT - Respects time scale
const delay = 1.0 / Time.timeScale; // Adjusted for time scale
setTimeout(callback, delay * 1000);
```