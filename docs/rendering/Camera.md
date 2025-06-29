# Camera Class Documentation

## Overview
The `Camera` class manages the viewport, position, rotation, and zoom for 2D rendering. It handles coordinate transformations between world space and screen space.

## Class Declaration
```typescript
export class Camera
```

## Constructor
```typescript
constructor(position?: Vector2, zoom: number = 1)
```

**Parameters:**
- `position` (Vector2, optional): Initial camera position (defaults to Vector2.zero)
- `zoom` (number, optional): Initial zoom level (defaults to 1.0)

## Properties

### Public Properties
- `position: Vector2` - Camera position in world space
- `rotation: number` - Camera rotation in radians
- `zoom: number` - Camera zoom level (1.0 = normal, 2.0 = 2x zoom in, 0.5 = 2x zoom out)
- `viewport: { x: number; y: number; width: number; height: number }` - Normalized viewport rectangle (0-1)

## Position Methods

### `setPosition(x: number, y: number): void`
### `setPosition(position: Vector2): void`
Sets the camera position.

**Overloads:**
- `setPosition(x, y)` - Set position with individual coordinates
- `setPosition(vector)` - Set position with Vector2

**Examples:**
```typescript
// Set position with coordinates
camera.setPosition(100, 200);

// Set position with Vector2
camera.setPosition(new Vector2(100, 200));

// Direct property assignment also works
camera.position = new Vector2(100, 200);
```

### `translate(x: number, y: number): void`
### `translate(translation: Vector2): void`
Moves the camera by the specified offset.

**Examples:**
```typescript
// Move camera by offset
camera.translate(10, -5);

// Move camera with Vector2
camera.translate(new Vector2(10, -5));
```

## Zoom Methods

### `setZoom(zoom: number): void`
Sets the zoom level.
- `zoom > 1.0` = Zoom in (objects appear larger)
- `zoom < 1.0` = Zoom out (objects appear smaller)
- `zoom = 1.0` = Normal size

**Example:**
```typescript
camera.setZoom(2.0);  // 2x zoom in
camera.setZoom(0.5);  // 2x zoom out
camera.setZoom(1.0);  // Normal zoom
```

### `zoom(factor: number): void`
Multiplies current zoom by the given factor.

**Example:**
```typescript
camera.zoom(1.1); // Zoom in by 10%
camera.zoom(0.9); // Zoom out by 10%
```

## Coordinate Transformation

### `worldToScreen(worldPosition: Vector2, viewportSize: Vector2): Vector2`
Converts world coordinates to screen coordinates.
- Takes camera position, rotation, and zoom into account
- Used internally by renderer

### `screenToWorld(screenPosition: Vector2, viewportSize: Vector2): Vector2`
Converts screen coordinates to world coordinates.
- Useful for mouse input handling
- Reverses camera transformations

**Example:**
```typescript
// Convert mouse click to world position
const canvasRect = canvas.getBoundingClientRect();
const mouseScreen = new Vector2(
    event.clientX - canvasRect.left,
    event.clientY - canvasRect.top
);

const renderer = engine.getRenderer();
const worldPos = camera.screenToWorld(mouseScreen, renderer.size);
```

## Matrix Operations

### `getTransformMatrix(viewportSize: Vector2): number[]`
Gets the transformation matrix for rendering.
- Returns 6-element array for Canvas2D setTransform()
- Used internally by renderer
- Combines translation, rotation, and zoom

### `getInverseTransformMatrix(viewportSize: Vector2): number[]`
Gets the inverse transformation matrix.
- Used for screen-to-world coordinate conversion

## Viewport Management

### `setViewport(x: number, y: number, width: number, height: number): void`
Sets the normalized viewport rectangle.
- All parameters are in range 0-1
- (0,0) = top-left, (1,1) = bottom-right
- Default viewport is (0, 0, 1, 1) = full screen

**Example:**
```typescript
// Split screen - left half
camera.setViewport(0, 0, 0.5, 1);

// Picture-in-picture - bottom-right quarter
camera.setViewport(0.75, 0.75, 0.25, 0.25);

// Full screen (default)
camera.setViewport(0, 0, 1, 1);
```

## Usage Examples

### Basic Camera Setup
```typescript
// Create camera centered at origin with normal zoom
const camera = new Camera(Vector2.zero, 1.0);

// Set camera on renderer
const renderer = engine.getRenderer();
renderer.setCamera(camera);
```

### Following a Player
```typescript
class CameraController extends Component {
    constructor(target, offset = Vector2.zero, smoothing = 3.0) {
        super();
        this.target = target;
        this.offset = offset;
        this.smoothing = smoothing;
    }
    
    update() {
        if (!this.target) return;
        
        const camera = Engine.getInstance().getRenderer().getCamera();
        const targetPosition = this.target.transform.position.add(this.offset);
        
        // Smooth following
        const currentPos = camera.position;
        const lerpFactor = this.smoothing * Time.deltaTime;
        const newPos = currentPos.lerp(targetPosition, lerpFactor);
        
        camera.setPosition(newPos);
    }
}

// Attach to game object
const cameraController = cameraObject.addComponent(CameraController, player, new Vector2(0, -100));
```

### Camera Bounds/Constraints
```typescript
class BoundedCamera extends Component {
    constructor(minBounds, maxBounds) {
        super();
        this.minBounds = minBounds; // Vector2
        this.maxBounds = maxBounds; // Vector2
    }
    
    update() {
        const camera = Engine.getInstance().getRenderer().getCamera();
        const pos = camera.position;
        
        // Clamp position to bounds
        const clampedX = Math.max(this.minBounds.x, Math.min(this.maxBounds.x, pos.x));
        const clampedY = Math.max(this.minBounds.y, Math.min(this.maxBounds.y, pos.y));
        
        camera.setPosition(new Vector2(clampedX, clampedY));
    }
}
```

### Zoom Controls
```typescript
// Zoom in/out with mouse wheel
canvas.addEventListener('wheel', (event) => {
    const camera = engine.getRenderer().getCamera();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    
    const newZoom = camera.zoom * zoomFactor;
    const clampedZoom = Math.max(0.1, Math.min(5.0, newZoom)); // Limit zoom range
    
    camera.setZoom(clampedZoom);
});

// Smooth zoom animation
function zoomTo(targetZoom, duration = 1.0) {
    const camera = engine.getRenderer().getCamera();
    const startZoom = camera.zoom;
    
    TweenManager.getInstance().createTween(camera, duration)
        .to({ zoom: targetZoom })
        .onUpdate((tweenedObject) => {
            camera.setZoom(tweenedObject.zoom);
        })
        .start();
}
```

### Screen Shake Effect
```typescript
class CameraShake extends Component {
    constructor(intensity = 10, duration = 0.5) {
        super();
        this.intensity = intensity;
        this.duration = duration;
        this.timer = 0;
        this.originalPosition = Vector2.zero;
        this.isShaking = false;
    }
    
    startShake() {
        if (this.isShaking) return;
        
        const camera = Engine.getInstance().getRenderer().getCamera();
        this.originalPosition = camera.position.clone();
        this.timer = this.duration;
        this.isShaking = true;
    }
    
    update() {
        if (!this.isShaking) return;
        
        this.timer -= Time.deltaTime;
        
        if (this.timer <= 0) {
            // Stop shaking
            const camera = Engine.getInstance().getRenderer().getCamera();
            camera.setPosition(this.originalPosition);
            this.isShaking = false;
            return;
        }
        
        // Apply random offset
        const camera = Engine.getInstance().getRenderer().getCamera();
        const progress = this.timer / this.duration;
        const currentIntensity = this.intensity * progress;
        
        const shakeOffset = new Vector2(
            (Math.random() - 0.5) * currentIntensity,
            (Math.random() - 0.5) * currentIntensity
        );
        
        camera.setPosition(this.originalPosition.add(shakeOffset));
    }
}
```

### Mouse World Position
```typescript
// Get world position of mouse cursor
function getMouseWorldPosition(event) {
    const canvas = engine.getCanvas();
    const rect = canvas.getBoundingClientRect();
    
    const mouseScreen = new Vector2(
        event.clientX - rect.left,
        event.clientY - rect.top
    );
    
    const renderer = engine.getRenderer();
    const camera = renderer.getCamera();
    
    return camera.screenToWorld(mouseScreen, renderer.size);
}

// Usage
canvas.addEventListener('mousemove', (event) => {
    const worldPos = getMouseWorldPosition(event);
    console.log('Mouse world position:', worldPos);
});
```

## Common Camera Patterns

### Platformer Camera
```typescript
class PlatformerCamera extends Component {
    constructor(target, lookAhead = 100, smoothing = 2.0) {
        super();
        this.target = target;
        this.lookAhead = lookAhead;
        this.smoothing = smoothing;
    }
    
    update() {
        const camera = Engine.getInstance().getRenderer().getCamera();
        const targetRigidbody = this.target.getComponent(Rigidbody2D);
        
        if (targetRigidbody) {
            const velocity = targetRigidbody.velocity;
            const lookAheadOffset = new Vector2(
                Math.sign(velocity.x) * this.lookAhead,
                0
            );
            
            const targetPos = this.target.transform.position.add(lookAheadOffset);
            const currentPos = camera.position;
            
            const newPos = currentPos.lerp(targetPos, this.smoothing * Time.deltaTime);
            camera.setPosition(newPos);
        }
    }
}
```

### RTS Camera
```typescript
class RTSCamera extends Component {
    constructor(panSpeed = 300, zoomSpeed = 0.1, edgeSize = 50) {
        super();
        this.panSpeed = panSpeed;
        this.zoomSpeed = zoomSpeed;
        this.edgeSize = edgeSize;
    }
    
    update() {
        const camera = Engine.getInstance().getRenderer().getCamera();
        const canvas = Engine.getInstance().getCanvas();
        
        // Edge scrolling
        const mousePos = Input.getMousePosition();
        const movement = Vector2.zero;
        
        if (mousePos.x < this.edgeSize) movement.x = -1;
        if (mousePos.x > canvas.width - this.edgeSize) movement.x = 1;
        if (mousePos.y < this.edgeSize) movement.y = -1;
        if (mousePos.y > canvas.height - this.edgeSize) movement.y = 1;
        
        if (movement.magnitude() > 0) {
            const panOffset = movement.multiply(this.panSpeed * Time.deltaTime);
            camera.translate(panOffset);
        }
        
        // Zoom with scroll
        const scrollDelta = Input.getScrollDelta();
        if (scrollDelta !== 0) {
            const zoomFactor = 1 + (scrollDelta * this.zoomSpeed);
            camera.zoom(zoomFactor);
        }
    }
}
```

## Performance Considerations

- Camera transformations are calculated once per frame
- Avoid frequent position/zoom changes within a single frame
- Use smooth interpolation (lerp) for camera movement
- Cache camera reference instead of getting it every frame
- Matrix calculations are optimized for 2D transformations

## Integration Points

- **Renderer**: Uses camera for all drawing transformations
- **Input**: Screen-to-world conversion for mouse/touch input
- **UI**: World-to-screen conversion for world-space UI elements
- **Physics**: Debug rendering uses camera transformations