# Engine Class Documentation

## Overview
The `Engine` class is the main entry point and core controller for ImplementEngine. It manages the game loop, rendering, physics, input, and scene management. Uses singleton pattern.

## Class Declaration
```typescript
export class Engine extends EventEmitter
```

## Configuration Interface
```typescript
export interface EngineConfig {
    canvas?: HTMLCanvasElement;
    width?: number;
    height?: number;
    backgroundColor?: string;
    targetFPS?: number;
    enableVSync?: boolean;
}
```

## Static Methods

### `createInstance(config?: EngineConfig): Engine`
Creates the singleton Engine instance.
- **Throws error** if instance already exists
- **Returns** the new Engine instance

**Parameters:**
- `config` (EngineConfig, optional): Engine configuration options

**Example:**
```typescript
const engine = Engine.createInstance({
    canvas: document.getElementById('gameCanvas'),
    backgroundColor: '#2C3E50',
    targetFPS: 60
});
```

### `getInstance(): Engine`
Gets the existing singleton Engine instance.
- **Throws error** if not initialized
- **Returns** the existing Engine instance

### `isInitialized: boolean`
Static getter that returns whether Engine has been initialized.

## Public Methods

### Scene Management

#### `setScene(scene: Scene): void`
Sets the current active scene.
- Unloads previous scene if exists
- Starts new scene if engine is running
- Emits 'sceneLoaded' event

#### `getCurrentScene(): Scene | null`
Gets the currently active scene.

### Engine Lifecycle

#### `start(): void`
Starts the engine and game loop.
- Sets running state to true
- Resets Time system
- Starts current scene if not already started
- Begins animation frame loop
- Emits 'engineStarted' event

#### `pause(): void`
Pauses the engine execution.
- Stops update loop but keeps rendering
- Pauses Time system
- Emits 'enginePaused' event

#### `resume(): void`
Resumes paused engine execution.
- Restarts update loop
- Resumes Time system
- Emits 'engineResumed' event

#### `stop(): void`
Stops the engine completely.
- Cancels animation frame
- Unloads current scene
- Emits 'engineStopped' event

#### `destroy(): void`
Destroys the engine instance and cleans up resources.
- Stops engine
- Unloads scene
- Removes all event listeners
- Clears singleton instance
- Emits 'engineDestroyed' event

### System Access

#### `getCanvas(): HTMLCanvasElement`
Gets the canvas element used for rendering.

#### `getRenderer(): Renderer`
Gets the rendering system instance.
**IMPORTANT:** Use this to access camera: `engine.getRenderer().getCamera()`

#### `getPhysicsWorld(): Physics2DWorld`
Gets the physics simulation instance.

### Performance Controls

#### `setTargetFPS(fps: number): void`
Sets the target frame rate.
- Minimum value is 1
- Updates frame interval calculation

#### `getTargetFPS(): number`
Gets the current target frame rate.

#### `getCurrentFPS(): number`
Gets the actual current frame rate from Time system.

#### `resize(width: number, height: number): void`
Resizes the rendering canvas.
- Updates renderer dimensions
- Emits 'engineResized' event

## Events

The Engine emits the following events:
- `'engineStarted'` - When engine starts
- `'enginePaused'` - When engine pauses
- `'engineResumed'` - When engine resumes
- `'engineStopped'` - When engine stops
- `'engineDestroyed'` - When engine is destroyed
- `'engineUpdate'` - Every frame during update
- `'engineRender'` - Every frame during render
- `'sceneLoaded'` - When new scene is set
- `'sceneUnloaded'` - When scene is unloaded
- `'engineResized'` - When canvas is resized

## Usage Examples

### Basic Engine Setup
```typescript
// Create engine instance
const engine = Engine.createInstance({
    canvas: document.getElementById('gameCanvas'),
    backgroundColor: '#87CEEB',
    targetFPS: 60
});

// Create and set scene
const scene = new Scene('MainGame');
engine.setScene(scene);

// Start engine
engine.start();
```

### Camera Access (CORRECT WAY)
```typescript
// Get camera through renderer
const renderer = engine.getRenderer();
const camera = renderer.getCamera();

// Move camera
camera.setPosition(new Vector2(100, 200));

// WRONG WAY - Scene does NOT have setCamera
// scene.setCamera(camera); // ERROR!
```

### Engine Lifecycle Management
```typescript
// Start engine
engine.start();

// Pause during gameplay
if (gameIsPaused) {
    engine.pause();
} else {
    engine.resume();
}

// Stop when exiting
engine.stop();

// Full cleanup
engine.destroy();
```

### Event Handling
```typescript
engine.on('engineStarted', () => {
    console.log('Game started!');
});

engine.on('engineUpdate', () => {
    // Called every frame
});

engine.on('sceneLoaded', (scene) => {
    console.log('Scene loaded:', scene.name);
});
```

### Physics Integration
```typescript
const physicsWorld = engine.getPhysicsWorld();

// Modify physics settings
physicsWorld.setGravity(new Vector2(0, 981));

// Access physics objects
const dynamicBodies = physicsWorld.getDynamicBodies();
```

## Configuration Options

### Canvas Configuration
```typescript
// Use existing canvas
const engine = Engine.createInstance({
    canvas: document.getElementById('myCanvas')
});

// Create new canvas with dimensions
const engine = Engine.createInstance({
    width: 1024,
    height: 768
});
```

### Rendering Configuration
```typescript
const engine = Engine.createInstance({
    backgroundColor: '#1a1a1a',  // Hex color
    targetFPS: 144,             // High refresh rate
    enableVSync: true           // Sync with display
});
```

## Common Errors

### ❌ Multiple Instance Creation
```typescript
Engine.createInstance(); // First call - OK
Engine.createInstance(); // ERROR: Instance already exists
```

**Solution:** Use `getInstance()` for subsequent access:
```typescript
const engine = Engine.createInstance(); // First time
const sameEngine = Engine.getInstance(); // Later access
```

### ❌ Camera Access Through Scene
```typescript
// WRONG - Scene has no camera methods
scene.setCamera(camera); // ERROR!
scene.getCamera();       // ERROR!
```

**Solution:** Access camera through renderer:
```typescript
// CORRECT
const camera = engine.getRenderer().getCamera();
camera.setPosition(new Vector2(x, y));
```

### ❌ Accessing Before Initialization
```typescript
const engine = Engine.getInstance(); // ERROR: Not initialized
```

**Solution:** Create instance first:
```typescript
const engine = Engine.createInstance();
// Now can use getInstance() elsewhere
```

## Performance Notes

- Engine uses `requestAnimationFrame` for smooth animation
- Physics runs at fixed timestep regardless of FPS
- Rendering is automatically throttled to target FPS
- Scene updates are skipped when engine is paused
- Use `getCurrentFPS()` to monitor performance

## Integration Points

- **Scene**: Managed by engine, updated every frame
- **Renderer**: Created by engine, handles camera and drawing
- **Physics**: Integrated physics world updated each frame
- **Input**: Automatically initialized with canvas
- **Time**: Managed by engine for consistent timing
- **TweenManager**: Updated automatically each frame