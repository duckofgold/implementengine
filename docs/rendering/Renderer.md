# Renderer Class Documentation

## Overview
The `Renderer` class handles all 2D rendering operations including camera management, drawing primitives, sprites, and applying transformations. Manages the HTML5 Canvas 2D context.

## Class Declaration
```typescript
export class Renderer
```

## Constructor
```typescript
constructor(canvas: HTMLCanvasElement)
```

**Parameters:**
- `canvas` (HTMLCanvasElement): The canvas element to render to

**Throws:** Error if 2D rendering context cannot be obtained

## Properties

### Read-only Properties
- `width: number` - Canvas width in pixels
- `height: number` - Canvas height in pixels  
- `size: Vector2` - Canvas size as Vector2

## Camera Management

### `getCamera(): Camera`
Gets the current camera instance.
**IMPORTANT:** This is the correct way to access the camera system.

### `setCamera(camera: Camera): void`
Sets a new camera instance.

**Example:**
```typescript
const renderer = engine.getRenderer();
const camera = new Camera(new Vector2(0, 0), 1.0);
renderer.setCamera(camera);

// Or get existing camera
const currentCamera = renderer.getCamera();
currentCamera.setPosition(new Vector2(100, 200));
```

## Background and Setup

### `setBackgroundColor(color: string): void`
Sets the background clear color.

**Example:**
```typescript
renderer.setBackgroundColor('#87CEEB'); // Sky blue
renderer.setBackgroundColor('rgb(255, 0, 0)'); // Red
```

## Rendering Lifecycle

### `clear(): void`
Clears the canvas with the background color.
- Resets all transformations
- Fills entire canvas with background color

### `begin(): void`
Begins a rendering frame.
- Saves canvas state
- Applies camera transformations
- **Must be called before any drawing operations**

### `end(): void`
Ends a rendering frame.
- Restores canvas state
- **Must be called after all drawing operations**

**Example Usage:**
```typescript
renderer.clear();
renderer.begin();
// ... draw sprites, shapes, etc ...
renderer.end();
```

## Drawing Methods

### Rectangle Drawing

#### `drawRect(position: Vector2, size: Vector2, options?: RenderOptions): void`
Draws a rectangle.

**Parameters:**
- `position` (Vector2): Top-left corner position
- `size` (Vector2): Width and height
- `options` (RenderOptions, optional): Styling options

### Circle Drawing

#### `drawCircle(center: Vector2, radius: number, options?: RenderOptions): void`
Draws a circle.

**Parameters:**
- `center` (Vector2): Center position
- `radius` (number): Circle radius
- `options` (RenderOptions, optional): Styling options

### Line Drawing

#### `drawLine(start: Vector2, end: Vector2, options?: RenderOptions): void`
Draws a line between two points.

### Text Drawing

#### `drawText(text: string, position: Vector2, options?: TextRenderOptions): void`
Draws text at specified position.

**Extended Options:**
```typescript
interface TextRenderOptions extends RenderOptions {
    font?: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
}
```

### Image Drawing

#### `drawImage(image: HTMLImageElement | HTMLCanvasElement, position: Vector2, size?: Vector2, sourceRect?: SourceRect, options?: RenderOptions): void`
Draws an image or canvas.

**Parameters:**
- `image`: Image or canvas to draw
- `position`: Position to draw at
- `size` (optional): Size to scale to
- `sourceRect` (optional): Source rectangle for sprite sheets
- `options` (optional): Render styling

### Sprite Drawing

#### `drawSprite(image: HTMLImageElement | HTMLCanvasElement, position: Vector2, rotation?: number, scale?: Vector2, pivot?: Vector2, sourceRect?: SourceRect, options?: RenderOptions): void`
Draws a sprite with full transformation support.

**Parameters:**
- `image`: Sprite image/canvas
- `position`: World position
- `rotation` (default: 0): Rotation in radians
- `scale` (default: Vector2.one): Scale factors
- `pivot` (default: Vector2(0.5, 0.5)): Pivot point (0-1 normalized)
- `sourceRect` (optional): Source area for sprite sheets
- `options` (optional): Render styling

**Example:**
```typescript
// Draw rotated sprite centered at position
renderer.drawSprite(
    spriteImage,
    new Vector2(100, 200),     // position
    Math.PI / 4,               // 45 degree rotation
    new Vector2(2, 2),         // 2x scale
    new Vector2(0.5, 0.5)      // center pivot
);
```

## Render Options

```typescript
interface RenderOptions {
    fillStyle?: string | CanvasGradient | CanvasPattern;
    strokeStyle?: string | CanvasGradient | CanvasPattern;
    lineWidth?: number;
    alpha?: number;
}
```

### Usage Examples
```typescript
// Filled red rectangle
renderer.drawRect(new Vector2(10, 10), new Vector2(50, 30), {
    fillStyle: '#ff0000'
});

// Outlined blue circle
renderer.drawCircle(new Vector2(100, 100), 25, {
    strokeStyle: '#0000ff',
    lineWidth: 3
});

// Semi-transparent filled shape
renderer.drawRect(new Vector2(0, 0), new Vector2(100, 100), {
    fillStyle: '#00ff00',
    alpha: 0.5
});
```

## Coordinate Transformation

### `worldToScreen(worldPosition: Vector2): Vector2`
Converts world coordinates to screen coordinates.
- Takes camera position, rotation, and zoom into account

### `screenToWorld(screenPosition: Vector2): Vector2`
Converts screen coordinates to world coordinates.
- Useful for mouse/touch input handling

**Example:**
```typescript
// Convert mouse click to world position
const mouseScreenPos = new Vector2(event.clientX, event.clientY);
const worldPos = renderer.screenToWorld(mouseScreenPos);

// Convert world object position to screen for UI overlay
const objectWorldPos = gameObject.transform.position;
const screenPos = renderer.worldToScreen(objectWorldPos);
```

## Canvas Management

### `resize(width: number, height: number): void`
Resizes the canvas and updates CSS dimensions.

**Example:**
```typescript
// Resize to fill window
const rect = canvas.getBoundingClientRect();
renderer.resize(window.innerWidth, window.innerHeight);
```

## Usage Examples

### Basic Rendering Loop
```typescript
function render() {
    renderer.clear();
    renderer.begin();
    
    // Draw background elements
    renderer.drawRect(new Vector2(0, 0), new Vector2(800, 600), {
        fillStyle: '#87CEEB'
    });
    
    // Draw game objects
    scene.getAllGameObjects().forEach(obj => {
        const spriteRenderer = obj.getComponent(SpriteRenderer);
        if (spriteRenderer) {
            spriteRenderer.render(); // Uses this renderer internally
        }
    });
    
    renderer.end();
}
```

### Camera Following
```typescript
// Get camera from renderer
const camera = renderer.getCamera();

// Follow player with smooth interpolation
function updateCamera(playerPosition) {
    const currentPos = camera.position;
    const targetPos = playerPosition.subtract(new Vector2(400, 300)); // Center on screen
    
    const lerpFactor = 3 * Time.deltaTime;
    const newPos = currentPos.lerp(targetPos, lerpFactor);
    
    camera.setPosition(newPos);
}
```

### Debug Drawing
```typescript
// Draw physics debug info
function drawDebugPhysics() {
    renderer.begin();
    
    // Draw collider bounds
    physicsObjects.forEach(obj => {
        const bounds = obj.getBounds();
        renderer.drawRect(bounds.position, bounds.size, {
            strokeStyle: '#ff00ff',
            lineWidth: 2
        });
    });
    
    renderer.end();
}
```

## Integration with SpriteRenderer

The SpriteRenderer component uses this Renderer internally:

```typescript
class SpriteRenderer extends Component {
    render() {
        const renderer = Engine.getInstance().getRenderer();
        
        renderer.drawSprite(
            this.sprite,
            this.transform.position,
            this.transform.rotation,
            this.transform.scale,
            this.pivot
        );
    }
}
```

## Common Errors

### ❌ Drawing Without begin/end
```typescript
renderer.clear();
renderer.drawRect(...); // ERROR: No camera transform applied
```

**Solution:**
```typescript
renderer.clear();
renderer.begin();
renderer.drawRect(...); // CORRECT
renderer.end();
```

### ❌ Accessing Camera Wrong Way
```typescript
// WRONG - Camera is not on Scene or Engine directly
const camera = scene.getCamera();  // ERROR!
const camera = engine.getCamera(); // ERROR!
```

**Solution:**
```typescript
// CORRECT - Camera is on Renderer
const camera = engine.getRenderer().getCamera();
```

### ❌ Forgetting to Clear
```typescript
renderer.begin();
// Draw stuff
renderer.end();
// Previous frame content remains visible
```

**Solution:**
```typescript
renderer.clear(); // Clear previous frame
renderer.begin();
// Draw stuff
renderer.end();
```

## Performance Notes

- Canvas state save/restore happens every frame
- Camera transformations are applied once per frame in `begin()`
- Sprite drawing with transformations creates temporary canvas states
- Use `drawImage()` for simple sprites, `drawSprite()` for transformed sprites
- Batch similar drawing operations together
- Avoid frequent camera changes within a frame

## Canvas Settings

The renderer automatically configures the canvas for pixel-perfect rendering:
- `imageRendering: 'pixelated'` - Sharp pixel scaling
- `imageSmoothingEnabled: false` - No anti-aliasing for pixel art