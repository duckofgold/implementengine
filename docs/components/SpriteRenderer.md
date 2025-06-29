# SpriteRenderer Component Documentation

## Overview
The `SpriteRenderer` component handles rendering sprites (images) for GameObjects. It supports sprite transformations, tinting, alpha blending, flipping, pivot points, source rectangles for sprite sheets, and layer-based rendering. This component integrates with the Transform component for positioning and scaling.

## Class Declaration
```typescript
export class SpriteRenderer extends Component
```

## Constructor
```typescript
constructor(sprite?: HTMLImageElement | HTMLCanvasElement | string)
```

**Parameters:**
- `sprite` (optional): Initial sprite as image element, canvas element, or asset name string

**Example:**
```typescript
// Create with image element
const renderer = new SpriteRenderer(imageElement);

// Create with asset name (loads via AssetLoader)
const renderer = new SpriteRenderer('player-sprite');

// Create empty (set sprite later)
const renderer = new SpriteRenderer();
```

## Properties

### Sprite Properties

#### `sprite: HTMLImageElement | HTMLCanvasElement | null`
The image or canvas element to render.

#### `size: Vector2 | null`
Custom size for rendering. If null, uses sprite's natural dimensions.

#### `sourceRect: { x: number; y: number; width: number; height: number } | null`
Source rectangle for sprite sheet rendering. If null, uses entire sprite.

**Example:**
```typescript
// Use natural sprite size
renderer.size = null;

// Custom size
renderer.setSize(64, 64);

// Sprite sheet usage
renderer.setSourceRect(0, 0, 32, 32); // Top-left 32x32 region
```

### Appearance Properties

#### `color: string`
Tint color applied to sprite (defaults to '#FFFFFF' - no tint).

#### `alpha: number`
Transparency level (0.0 = transparent, 1.0 = opaque).

#### `visible: boolean`
Whether the sprite should be rendered.

**Example:**
```typescript
// Red tint
renderer.color = '#FF0000';

// Semi-transparent
renderer.alpha = 0.5;

// Hide sprite
renderer.visible = false;
```

### Transform Properties

#### `flipX: boolean`
Horizontally flip the sprite.

#### `flipY: boolean`
Vertically flip the sprite.

#### `pivot: Vector2`
Pivot point for rotation and scaling (0,0 = top-left, 0.5,0.5 = center, 1,1 = bottom-right).

**Example:**
```typescript
// Flip horizontally
renderer.flipX = true;

// Center pivot
renderer.setPivot(0.5, 0.5);

// Bottom-center pivot
renderer.setPivot(0.5, 1.0);
```

### Rendering Properties

#### `layer: number`
Rendering layer (for future layer-based sorting).

#### `sortingOrder: number` (get/set)
Sorting order within the same layer (higher values render on top).

**Example:**
```typescript
// Background layer
renderer.layer = 0;
renderer.sortingOrder = 0;

// Player layer  
renderer.layer = 1;
renderer.sortingOrder = 10;

// UI layer
renderer.layer = 2;
renderer.sortingOrder = 100;
```

## Methods

### Sprite Management

#### `setSprite(sprite: HTMLImageElement | HTMLCanvasElement | null): void`
Sets the sprite to render.

#### `async loadSprite(spriteName: string): Promise<void>`
Loads a sprite from AssetLoader by name.

**Example:**
```typescript
// Set sprite directly
renderer.setSprite(imageElement);

// Load from AssetLoader
await renderer.loadSprite('character-idle');
```

### Size Management

#### `setSize(width: number, height: number): void`
Sets custom rendering size.

#### `setSizeToSprite(): void`
Resets size to sprite's natural dimensions.

**Example:**
```typescript
// Custom size
renderer.setSize(128, 128);

// Reset to sprite size
renderer.setSizeToSprite();
```

### Source Rectangle (Sprite Sheets)

#### `setSourceRect(x: number, y: number, width: number, height: number): void`
Sets the source rectangle for sprite sheet rendering.

#### `clearSourceRect(): void`
Clears source rectangle to use entire sprite.

**Example:**
```typescript
// Select region from sprite sheet
renderer.setSourceRect(64, 32, 32, 32); // x=64, y=32, width=32, height=32

// Use entire sprite
renderer.clearSourceRect();
```

### Appearance Control

#### `setColor(color: string): void`
Sets the tint color.

#### `setAlpha(alpha: number): void`
Sets transparency (automatically clamped between 0 and 1).

#### `setFlip(flipX: boolean, flipY: boolean): void`
Sets horizontal and vertical flipping.

#### `setPivot(x: number, y: number): void`
Sets the pivot point.

**Example:**
```typescript
// Blue tint
renderer.setColor('#0066FF');

// Half transparent
renderer.setAlpha(0.5);

// Flip both axes
renderer.setFlip(true, true);

// Bottom-center pivot
renderer.setPivot(0.5, 1.0);
```

### Rendering

#### `render(): void`
Renders the sprite (called automatically by rendering system).
- **Internal method - do not call manually**

#### `isVisibleInCamera(): boolean`
Checks if sprite is visible within camera bounds (frustum culling).

**Returns:**
- `boolean` - True if sprite overlaps with camera view

### Utility Methods

#### `bounds: { min: Vector2; max: Vector2 } | null` (get)
Gets world-space bounding box of the sprite.

#### `getPixelPerfectPosition(): Vector2`
Gets position rounded to nearest pixel (for crisp sprite rendering).

#### `clone(): SpriteRenderer`
Creates a copy of this SpriteRenderer component.

**Example:**
```typescript
// Check bounds
const bounds = renderer.bounds;
if (bounds) {
    console.log('Min:', bounds.min, 'Max:', bounds.max);
}

// Pixel-perfect positioning
const pixelPos = renderer.getPixelPerfectPosition();
transform.position = pixelPos;

// Clone component
const copy = renderer.clone();
```

## Usage Examples

### Basic Sprite Rendering
```typescript
class Player extends Component {
    private spriteRenderer: SpriteRenderer;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.spriteRenderer.loadSprite('player-idle');
        this.spriteRenderer.setPivot(0.5, 1.0); // Bottom-center pivot
    }
}
```

### Animated Character with Flip
```typescript
class Character extends Component {
    private spriteRenderer: SpriteRenderer;
    private facingRight: boolean = true;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.spriteRenderer.loadSprite('character');
    }
    
    update(): void {
        const velocity = this.getComponent(Rigidbody2D)?.velocity || Vector2.zero;
        
        // Flip sprite based on movement direction
        if (velocity.x > 0 && !this.facingRight) {
            this.facingRight = true;
            this.spriteRenderer.flipX = false;
        } else if (velocity.x < 0 && this.facingRight) {
            this.facingRight = false;
            this.spriteRenderer.flipX = true;
        }
    }
}
```

### Sprite Sheet Animation
```typescript
class SpriteSheetAnimator extends Component {
    private spriteRenderer: SpriteRenderer;
    private frameWidth: number = 32;
    private frameHeight: number = 32;
    private currentFrame: number = 0;
    private frameCount: number = 8;
    private animationSpeed: number = 10; // frames per second
    private frameTimer: number = 0;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.spriteRenderer.loadSprite('character-walk-sheet');
        this.updateFrame();
    }
    
    update(): void {
        this.frameTimer += Time.deltaTime;
        
        if (this.frameTimer >= 1 / this.animationSpeed) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.updateFrame();
        }
    }
    
    private updateFrame(): void {
        const x = this.currentFrame * this.frameWidth;
        this.spriteRenderer.setSourceRect(x, 0, this.frameWidth, this.frameHeight);
    }
}
```

### Health Bar with Color Tinting
```typescript
class HealthBar extends Component {
    private spriteRenderer: SpriteRenderer;
    private maxHealth: number = 100;
    private currentHealth: number = 100;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.spriteRenderer.loadSprite('health-bar');
        this.updateHealthColor();
    }
    
    public setHealth(health: number): void {
        this.currentHealth = Math.max(0, Math.min(this.maxHealth, health));
        this.updateHealthColor();
        this.updateScale();
    }
    
    private updateHealthColor(): void {
        const healthPercent = this.currentHealth / this.maxHealth;
        
        if (healthPercent > 0.6) {
            this.spriteRenderer.setColor('#00FF00'); // Green
        } else if (healthPercent > 0.3) {
            this.spriteRenderer.setColor('#FFFF00'); // Yellow
        } else {
            this.spriteRenderer.setColor('#FF0000'); // Red
        }
    }
    
    private updateScale(): void {
        const healthPercent = this.currentHealth / this.maxHealth;
        this.transform.scale = new Vector2(healthPercent, 1);
    }
}
```

### Fade Effect
```typescript
class FadeEffect extends Component {
    private spriteRenderer: SpriteRenderer;
    private fadeSpeed: number = 1.0;
    private targetAlpha: number = 1.0;
    
    start(): void {
        this.spriteRenderer = this.getComponent(SpriteRenderer);
    }
    
    public fadeIn(duration: number = 1.0): void {
        this.fadeSpeed = 1.0 / duration;
        this.targetAlpha = 1.0;
    }
    
    public fadeOut(duration: number = 1.0): void {
        this.fadeSpeed = 1.0 / duration;
        this.targetAlpha = 0.0;
    }
    
    update(): void {
        if (!this.spriteRenderer) return;
        
        const currentAlpha = this.spriteRenderer.alpha;
        const difference = this.targetAlpha - currentAlpha;
        
        if (Math.abs(difference) > 0.01) {
            const change = Math.sign(difference) * this.fadeSpeed * Time.deltaTime;
            const newAlpha = Math.max(0, Math.min(1, currentAlpha + change));
            this.spriteRenderer.setAlpha(newAlpha);
        }
    }
}
```

### Parallax Background Layer
```typescript
class ParallaxLayer extends Component {
    private spriteRenderer: SpriteRenderer;
    private parallaxFactor: number = 0.5; // 0 = static, 1 = moves with camera
    private basePosition: Vector2;
    private camera: Camera;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.spriteRenderer.loadSprite('background-layer');
        this.spriteRenderer.layer = -1; // Background layer
        
        this.basePosition = this.transform.position.clone();
        this.camera = Engine.getInstance().getRenderer().getCamera();
    }
    
    update(): void {
        const cameraOffset = this.camera.position.multiply(this.parallaxFactor);
        this.transform.position = this.basePosition.subtract(cameraOffset);
    }
}
```

### Damage Flash Effect
```typescript
class DamageFlash extends Component {
    private spriteRenderer: SpriteRenderer;
    private originalColor: string;
    private flashColor: string = '#FFFFFF';
    private flashDuration: number = 0.1;
    private flashTimer: number = 0;
    private isFlashing: boolean = false;
    
    start(): void {
        this.spriteRenderer = this.getComponent(SpriteRenderer);
        this.originalColor = this.spriteRenderer.color;
    }
    
    public flash(): void {
        this.isFlashing = true;
        this.flashTimer = this.flashDuration;
        this.spriteRenderer.setColor(this.flashColor);
    }
    
    update(): void {
        if (this.isFlashing) {
            this.flashTimer -= Time.deltaTime;
            
            if (this.flashTimer <= 0) {
                this.isFlashing = false;
                this.spriteRenderer.setColor(this.originalColor);
            }
        }
    }
}
```

### Culling and Performance
```typescript
class OptimizedRenderer extends Component {
    private spriteRenderer: SpriteRenderer;
    private lastVisibilityCheck: number = 0;
    private visibilityCheckInterval: number = 0.1; // Check every 100ms
    
    start(): void {
        this.spriteRenderer = this.getComponent(SpriteRenderer);
    }
    
    update(): void {
        // Periodic visibility check for performance
        if (Time.time - this.lastVisibilityCheck > this.visibilityCheckInterval) {
            this.lastVisibilityCheck = Time.time;
            
            const isVisible = this.spriteRenderer.isVisibleInCamera();
            this.spriteRenderer.visible = isVisible;
            
            // Disable other components if not visible
            this.enabled = isVisible;
        }
    }
}
```

### UI Element with Pixel Perfect Rendering
```typescript
class UIElement extends Component {
    private spriteRenderer: SpriteRenderer;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.spriteRenderer.loadSprite('ui-button');
        this.spriteRenderer.layer = 10; // UI layer
        this.spriteRenderer.sortingOrder = 100;
    }
    
    update(): void {
        // Keep pixel-perfect positioning for crisp UI
        const pixelPos = this.spriteRenderer.getPixelPerfectPosition();
        this.transform.position = pixelPos;
    }
}
```

## Integration with Other Components

### With Animator
```typescript
class AnimatedSprite extends Component {
    private spriteRenderer: SpriteRenderer;
    private animator: Animator;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.animator = this.addComponent(Animator);
        
        // Animator will control spriteRenderer's sourceRect for animation
    }
}
```

### With Physics
```typescript
class PhysicsSprite extends Component {
    private spriteRenderer: SpriteRenderer;
    private rigidbody: Rigidbody2D;
    
    start(): void {
        this.spriteRenderer = this.addComponent(SpriteRenderer);
        this.rigidbody = this.addComponent(Rigidbody2D);
        
        // Set sprite pivot to match collider center
        this.spriteRenderer.setPivot(0.5, 0.5);
    }
}
```

## Rendering Pipeline Integration

The SpriteRenderer is automatically called by the rendering system:

1. **Culling**: `isVisibleInCamera()` determines if rendering is needed
2. **Sorting**: Components are sorted by `layer` and `sortingOrder`
3. **Rendering**: `render()` method draws the sprite with all transformations
4. **Transform Integration**: Uses Transform component for position, rotation, scale

## Performance Considerations

- Use `isVisibleInCamera()` for frustum culling
- Large sprites with many pixels may impact performance
- Sprite sheet animations are more efficient than individual files
- `getPixelPerfectPosition()` helps avoid sub-pixel rendering blur
- Set `visible = false` for unused sprites instead of destroying components

## Common Errors

### ❌ Missing Sprite
```typescript
// Sprite not loaded yet
renderer.render(); // May render nothing if sprite is null
```

### ❌ Incorrect Pivot Calculations
```typescript
// Pivot affects both rotation and positioning
renderer.setPivot(0, 0); // Top-left pivot
renderer.setPivot(1, 1); // Bottom-right pivot, not center!
```

### ❌ Source Rectangle Out of Bounds
```typescript
// Source rect extends beyond sprite dimensions
renderer.setSourceRect(100, 100, 64, 64); // May cause rendering issues
```

### ❌ Performance Issues
```typescript
// Checking visibility every frame
update() {
    if (this.spriteRenderer.isVisibleInCamera()) { // Expensive!
        // Do work
    }
}

// BETTER - Check periodically
private lastCheck = 0;
update() {
    if (Time.time - this.lastCheck > 0.1) {
        this.lastCheck = Time.time;
        this.isVisible = this.spriteRenderer.isVisibleInCamera();
    }
}
```

## Integration Points

- **Transform**: Uses position, rotation, scale for rendering
- **AssetLoader**: Loads sprites by name via `loadSprite()`
- **Renderer**: Integrates with rendering pipeline via `drawSprite()`
- **Camera**: Uses camera bounds for visibility culling
- **Animator**: Can control sourceRect for sprite sheet animations