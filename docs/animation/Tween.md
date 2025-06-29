# Tween and TweenManager Documentation

## Overview
The `Tween` class provides smooth interpolation of object properties over time using easing functions. It extends the Animation class to provide value tweening for positions, scales, colors, and any numeric properties. The `TweenManager` singleton manages multiple tweens and provides convenient static methods for creating and playing tweens.

## Classes

### Tween Class
```typescript
export class Tween<T extends Record<string, any>> extends Animation
```

### TweenManager Class
```typescript
export class TweenManager
```

## Interfaces

### TweenConfig Interface
```typescript
interface TweenConfig<T> {
    target: T;                          // Object to animate
    to: Partial<T>;                     // Target property values
    duration: number;                   // Animation duration in seconds
    easing?: EasingFunction | string;   // Easing function or name
    delay?: number;                     // Delay before starting (seconds)
    loop?: boolean;                     // Whether to loop
    maxLoops?: number;                  // Maximum loop count
    autoDestroy?: boolean;              // Auto-destroy when complete (default: true)
    onUpdate?: (target: T, progress: number) => void;  // Update callback
    onComplete?: (target: T) => void;   // Completion callback
}
```

## Tween Constructor
```typescript
constructor(config: TweenConfig<T>)
```

**Example:**
```typescript
const tween = new Tween({
    target: gameObject.transform,
    to: { 
        position: new Vector2(100, 200),
        rotation: Math.PI / 2
    },
    duration: 2.0,
    easing: 'easeOutBounce',
    onComplete: (transform) => {
        console.log('Movement complete');
    }
});
```

## Tween Static Factory Methods

### `Tween.to<T>(target: T, to: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T>`
Creates a tween from current values to target values.

### `Tween.from<T>(target: T, from: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T>`
Sets initial values and tweens back to current values.

### `Tween.fromTo<T>(target: T, from: Partial<T>, to: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T>`
Sets initial values and tweens to target values.

**Example:**
```typescript
// Tween to new position
const tween1 = Tween.to(transform, { 
    position: new Vector2(200, 100) 
}, 1.5, 'easeOutQuad');

// Start from specific position and tween to current
const tween2 = Tween.from(transform, { 
    position: new Vector2(0, 0) 
}, 1.0);

// Tween from one position to another
const tween3 = Tween.fromTo(transform, 
    { position: new Vector2(0, 0) },
    { position: new Vector2(300, 150) },
    2.0,
    'easeInOutCubic'
);
```

## TweenManager Methods

### Instance Management

#### `static getInstance(): TweenManager`
Gets the singleton TweenManager instance.

#### `add<T>(tween: Tween<T>): Tween<T>`
Adds a tween to be managed and updated.

#### `remove<T>(tween: Tween<T>): boolean`
Removes and stops a specific tween.

#### `killTweensOf<T>(target: T): void`
Stops and removes all tweens targeting a specific object.

#### `killAllTweens(): void`
Stops and removes all active tweens.

#### `update(deltaTime: number): void`
Updates all active tweens (called by animation system).

#### `getTweenCount(): number`
Returns the number of active tweens.

**Example:**
```typescript
const manager = TweenManager.getInstance();

// Add tween manually
const tween = new Tween(config);
manager.add(tween);
tween.play();

// Remove specific tween
manager.remove(tween);

// Kill all tweens of an object
manager.killTweensOf(gameObject.transform);

// Kill everything
manager.killAllTweens();
```

### Static Convenience Methods

#### `TweenManager.to<T>(target: T, to: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T>`
Creates, adds, and plays a tween in one call.

#### `TweenManager.from<T>(target: T, from: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T>`
Creates, adds, and plays a from-tween in one call.

#### `TweenManager.fromTo<T>(target: T, from: Partial<T>, to: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T>`
Creates, adds, and plays a from-to tween in one call.

**Example:**
```typescript
// Simple position tween
TweenManager.to(transform, { 
    position: new Vector2(100, 100) 
}, 1.0, 'easeOutQuad');

// Fade in effect
TweenManager.from(spriteRenderer, { 
    alpha: 0 
}, 0.5);

// Scale bounce effect
TweenManager.fromTo(transform,
    { scale: Vector2.zero },
    { scale: new Vector2(1.2, 1.2) },
    0.3,
    'easeOutBounce'
);
```

## Supported Data Types

The Tween system supports interpolation of:

- **Numbers**: Direct linear interpolation
- **Vector2**: Component-wise interpolation using Vector2.lerp()
- **Objects**: Property-wise interpolation for numeric properties
- **Other types**: Snap to target value at 50% progress

**Example:**
```typescript
// Number properties
TweenManager.to(spriteRenderer, { alpha: 0 }, 1.0);

// Vector2 properties
TweenManager.to(transform, { 
    position: new Vector2(100, 200),
    scale: new Vector2(2, 2)
}, 1.5);

// Object properties (if object has numeric properties)
TweenManager.to(colorObject, { 
    r: 255, 
    g: 0, 
    b: 0 
}, 1.0);
```

## Usage Examples

### Basic Transform Animation
```typescript
class MovingPlatform extends Component {
    private waypoints: Vector2[] = [
        new Vector2(100, 300),
        new Vector2(400, 300),
        new Vector2(400, 100),
        new Vector2(100, 100)
    ];
    private currentWaypoint: number = 0;
    
    start(): void {
        this.moveToNextWaypoint();
    }
    
    private moveToNextWaypoint(): void {
        const target = this.waypoints[this.currentWaypoint];
        
        TweenManager.to(this.transform, {
            position: target
        }, 2.0, 'easeInOutQuad').on('end', () => {
            this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
            this.moveToNextWaypoint();
        });
    }
}
```

### UI Animation
```typescript
class UIAnimations {
    public static fadeIn(element: SpriteRenderer, duration: number = 0.5): Tween<SpriteRenderer> {
        return TweenManager.from(element, { alpha: 0 }, duration, 'easeOutQuad');
    }
    
    public static fadeOut(element: SpriteRenderer, duration: number = 0.5): Tween<SpriteRenderer> {
        return TweenManager.to(element, { alpha: 0 }, duration, 'easeOutQuad');
    }
    
    public static scaleIn(transform: Transform, duration: number = 0.3): Tween<Transform> {
        return TweenManager.from(transform, { 
            scale: Vector2.zero 
        }, duration, 'easeOutBack');
    }
    
    public static scaleOut(transform: Transform, duration: number = 0.3): Tween<Transform> {
        return TweenManager.to(transform, { 
            scale: Vector2.zero 
        }, duration, 'easeInBack');
    }
    
    public static slideIn(transform: Transform, from: Vector2, duration: number = 0.5): Tween<Transform> {
        return TweenManager.from(transform, { 
            position: from 
        }, duration, 'easeOutCubic');
    }
    
    public static pulse(transform: Transform, scale: number = 1.2, duration: number = 0.5): Tween<Transform> {
        const originalScale = transform.scale.clone();
        
        return TweenManager.to(transform, {
            scale: new Vector2(scale, scale)
        }, duration / 2, 'easeOutQuad').on('end', () => {
            TweenManager.to(transform, {
                scale: originalScale
            }, duration / 2, 'easeInQuad');
        });
    }
}

// Usage
class Button extends Component {
    private spriteRenderer: SpriteRenderer;
    
    start(): void {
        this.spriteRenderer = this.getComponent(SpriteRenderer);
        
        // Fade in when created
        UIAnimations.fadeIn(this.spriteRenderer);
    }
    
    onMouseEnter(): void {
        UIAnimations.pulse(this.transform, 1.1, 0.3);
    }
    
    onMouseDown(): void {
        UIAnimations.scaleIn(this.transform, 0.1);
    }
    
    onDestroy(): void {
        UIAnimations.fadeOut(this.spriteRenderer);
    }
}
```

### Character Animation
```typescript
class CharacterAnimations {
    public static jump(transform: Transform, height: number = 100, duration: number = 0.8): void {
        const startY = transform.position.y;
        const peakY = startY - height;
        
        // Jump up
        TweenManager.to(transform, {
            position: new Vector2(transform.position.x, peakY)
        }, duration / 2, 'easeOutQuad').on('end', () => {
            // Fall down
            TweenManager.to(transform, {
                position: new Vector2(transform.position.x, startY)
            }, duration / 2, 'easeInQuad');
        });
    }
    
    public static damage(transform: Transform, spriteRenderer: SpriteRenderer): void {
        // Screen shake effect
        const originalPos = transform.position.clone();
        const shakeAmount = 5;
        
        TweenManager.to(transform, {
            position: originalPos.add(new Vector2(
                (Math.random() - 0.5) * shakeAmount,
                (Math.random() - 0.5) * shakeAmount
            ))
        }, 0.05).on('end', () => {
            TweenManager.to(transform, {
                position: originalPos
            }, 0.05);
        });
        
        // Flash effect
        TweenManager.to(spriteRenderer, { alpha: 0.5 }, 0.1, 'linear').on('end', () => {
            TweenManager.to(spriteRenderer, { alpha: 1.0 }, 0.1, 'linear');
        });
    }
    
    public static death(transform: Transform, spriteRenderer: SpriteRenderer): void {
        // Shrink and fade
        TweenManager.to(transform, {
            scale: Vector2.zero
        }, 1.0, 'easeInQuad');
        
        TweenManager.to(spriteRenderer, {
            alpha: 0
        }, 1.0, 'easeInQuad').on('end', () => {
            // Destroy after animation
            transform.gameObject?.destroy();
        });
    }
}
```

### Complex Sequences
```typescript
class SequenceAnimations {
    public static slideInSequence(transforms: Transform[], stagger: number = 0.1): void {
        transforms.forEach((transform, index) => {
            const delay = index * stagger;
            const originalPos = transform.position.clone();
            
            // Start off-screen
            transform.position = originalPos.add(new Vector2(-200, 0));
            
            // Animate in with delay
            setTimeout(() => {
                TweenManager.to(transform, {
                    position: originalPos
                }, 0.5, 'easeOutCubic');
            }, delay * 1000);
        });
    }
    
    public static collectCoin(transform: Transform, spriteRenderer: SpriteRenderer, targetUI: Vector2): void {
        // Scale up briefly
        const originalScale = transform.scale.clone();
        TweenManager.to(transform, {
            scale: originalScale.multiply(1.5)
        }, 0.1, 'easeOutQuad').on('end', () => {
            
            // Scale back and move to UI
            TweenManager.to(transform, {
                scale: originalScale.multiply(0.5),
                position: targetUI
            }, 0.8, 'easeInQuad').on('end', () => {
                
                // Final fade out
                TweenManager.to(spriteRenderer, {
                    alpha: 0
                }, 0.2).on('end', () => {
                    transform.gameObject?.destroy();
                });
            });
        });
    }
    
    public static levelComplete(transforms: Transform[]): void {
        transforms.forEach((transform, index) => {
            // Staggered celebration jumps
            setTimeout(() => {
                this.celebrationJump(transform);
            }, index * 100);
        });
    }
    
    private static celebrationJump(transform: Transform): void {
        const originalY = transform.position.y;
        const jumpHeight = 50 + Math.random() * 30;
        
        TweenManager.to(transform, {
            position: new Vector2(transform.position.x, originalY - jumpHeight)
        }, 0.3, 'easeOutQuad').on('end', () => {
            TweenManager.to(transform, {
                position: new Vector2(transform.position.x, originalY)
            }, 0.3, 'easeInQuad');
        });
        
        // Random rotation
        const randomRotation = (Math.random() - 0.5) * Math.PI;
        TweenManager.to(transform, {
            rotation: transform.rotation + randomRotation
        }, 0.6, 'easeOutElastic');
    }
}
```

### Camera Effects
```typescript
class CameraEffects {
    public static shake(camera: Camera, intensity: number = 10, duration: number = 0.5): void {
        const originalPos = camera.position.clone();
        const shakeCount = Math.floor(duration * 30); // 30 shakes per second
        const shakeDuration = duration / shakeCount;
        
        for (let i = 0; i < shakeCount; i++) {
            setTimeout(() => {
                const shakeOffset = new Vector2(
                    (Math.random() - 0.5) * intensity,
                    (Math.random() - 0.5) * intensity
                );
                
                camera.setPosition(originalPos.add(shakeOffset));
                
                // Return to original on last shake
                if (i === shakeCount - 1) {
                    setTimeout(() => {
                        camera.setPosition(originalPos);
                    }, shakeDuration * 500);
                }
            }, i * shakeDuration * 1000);
        }
    }
    
    public static zoom(camera: Camera, targetZoom: number, duration: number = 1.0): Tween<Camera> {
        return TweenManager.to(camera, {
            zoom: targetZoom
        }, duration, 'easeOutQuad');
    }
    
    public static pan(camera: Camera, targetPosition: Vector2, duration: number = 2.0): Tween<Camera> {
        return TweenManager.to(camera, {
            position: targetPosition
        }, duration, 'easeInOutQuad');
    }
    
    public static follow(camera: Camera, target: Transform, smoothTime: number = 2.0): void {
        // Continuous smooth following
        const update = () => {
            if (target && target.gameObject && !target.gameObject.destroyed) {
                TweenManager.to(camera, {
                    position: target.worldPosition
                }, smoothTime, 'easeOutQuad');
                
                setTimeout(update, 100); // Update every 100ms
            }
        };
        
        update();
    }
}
```

### Advanced Easing and Callbacks
```typescript
class AdvancedTweenExamples {
    public static complexMovement(transform: Transform): void {
        // Multi-stage movement with different easing
        const path = [
            new Vector2(100, 100),
            new Vector2(200, 50),
            new Vector2(300, 150),
            new Vector2(400, 100)
        ];
        
        let currentIndex = 0;
        
        const moveToNext = () => {
            if (currentIndex < path.length) {
                const target = path[currentIndex];
                const easingType = currentIndex % 2 === 0 ? 'easeInQuad' : 'easeOutBounce';
                
                TweenManager.to(transform, {
                    position: target
                }, 1.0, easingType).on('end', () => {
                    currentIndex++;
                    moveToNext();
                });
            }
        };
        
        moveToNext();
    }
    
    public static customEasing(transform: Transform): void {
        // Using custom easing function
        const customEase = (t: number): number => {
            // Elastic ease out
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 :
                Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        };
        
        TweenManager.to(transform, {
            scale: new Vector2(2, 2)
        }, 1.5, customEase);
    }
    
    public static progressCallback(spriteRenderer: SpriteRenderer): void {
        // Update color during fade based on progress
        TweenManager.to(spriteRenderer, {
            alpha: 0
        }, 2.0, 'linear').onUpdate = (target, progress) => {
            // Change color from white to red as it fades
            const red = Math.floor(255 * progress);
            const green = Math.floor(255 * (1 - progress));
            const blue = 0;
            
            target.color = `rgb(${red}, ${green}, ${blue})`;
        };
    }
    
    public static chainedAnimations(elements: SpriteRenderer[]): void {
        let currentIndex = 0;
        
        const animateNext = () => {
            if (currentIndex < elements.length) {
                const element = elements[currentIndex];
                
                UIAnimations.fadeIn(element, 0.3).on('end', () => {
                    currentIndex++;
                    setTimeout(animateNext, 200); // 200ms delay between elements
                });
            }
        };
        
        animateNext();
    }
}
```

### Performance Optimization
```typescript
class TweenOptimization {
    public static batchUpdate(transforms: Transform[], targetPositions: Vector2[]): void {
        // Animate multiple objects efficiently
        transforms.forEach((transform, index) => {
            if (index < targetPositions.length) {
                TweenManager.to(transform, {
                    position: targetPositions[index]
                }, 1.0, 'easeOutQuad');
            }
        });
    }
    
    public static killAllTweensOfType(type: any): void {
        // Clean up tweens of specific object type
        const manager = TweenManager.getInstance();
        
        // This would require extending TweenManager to track by type
        // For now, kill all tweens
        manager.killAllTweens();
    }
    
    public static pauseAllTweens(): void {
        // Pause all active tweens (would need to extend TweenManager)
        const manager = TweenManager.getInstance();
        // Implementation would iterate through active tweens and pause them
    }
}
```

## Performance Considerations

- Tweens are automatically managed and cleaned up when complete (if autoDestroy = true)
- Large numbers of concurrent tweens may impact performance
- Vector2 interpolation creates new objects each frame
- Use `killTweensOf()` to clean up tweens when objects are destroyed
- Consider object pooling for frequently created/destroyed tweened objects

## Common Errors

### ❌ Forgetting to Play Tweens
```typescript
// WRONG - Tween created but never played
const tween = new Tween(config);

// CORRECT - Use TweenManager static methods (auto-play)
TweenManager.to(target, { position: newPos }, 1.0);

// OR - Play manually
const tween = new Tween(config);
TweenManager.getInstance().add(tween);
tween.play();
```

### ❌ Memory Leaks with Manual Tweens
```typescript
// WRONG - Manual tween not added to manager
const tween = new Tween(config);
tween.play(); // Will never be cleaned up

// CORRECT - Use manager
const tween = new Tween(config);
TweenManager.getInstance().add(tween);
tween.play();
```

### ❌ Tweening Non-Existent Properties
```typescript
// WRONG - Property doesn't exist
TweenManager.to(transform, { 
    nonExistentProperty: 100 
}, 1.0); // No effect

// CORRECT - Use valid properties
TweenManager.to(transform, { 
    position: new Vector2(100, 100) 
}, 1.0);
```

### ❌ Conflicting Tweens
```typescript
// WRONG - Multiple tweens modifying same property
TweenManager.to(transform, { position: pos1 }, 1.0);
TweenManager.to(transform, { position: pos2 }, 1.0); // Conflict!

// CORRECT - Kill existing tweens first
TweenManager.getInstance().killTweensOf(transform);
TweenManager.to(transform, { position: pos2 }, 1.0);
```

## Integration Points

- **Animation**: Extends Animation base class for timing and lifecycle
- **Easing**: Uses Easing utility functions for interpolation curves
- **Vector2**: Special support for Vector2 interpolation with lerp()
- **Transform**: Commonly tweened for position, rotation, scale
- **SpriteRenderer**: Commonly tweened for alpha, color effects
- **EventEmitter**: Inherited event system for completion callbacks