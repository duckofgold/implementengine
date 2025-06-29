# Scene Class Documentation

## Overview
The `Scene` class manages collections of GameObjects and their lifecycle. It extends `EventEmitter` for event-driven architecture.

## Class Declaration
```typescript
export class Scene extends EventEmitter
```

## Constructor
```typescript
constructor(name: string = 'Scene')
```

**Parameters:**
- `name` (string, optional): Scene name, defaults to 'Scene'

## Properties

### Public Properties
- `name: string` - Scene identifier name
- `active: boolean` - Whether scene is active (defaults to `true`)

### Read-only Properties
- `isStarted: boolean` - Whether scene has been started
- `objectCount: number` - Number of GameObjects in scene

## Methods

### GameObject Management

#### `addGameObject(gameObject: GameObject): void`
Adds a GameObject to the scene.
- Automatically removes from previous scene if applicable
- Sets gameObject.scene reference
- Emits 'gameObjectAdded' event

**Example:**
```typescript
const scene = new Scene('MainScene');
const player = new GameObject('Player');
scene.addGameObject(player); // GameObject is now in scene
```

#### `removeGameObject(gameObject: GameObject): boolean`
Removes a GameObject from the scene.
- Returns `true` if removed, `false` if not found
- Sets gameObject.scene to null
- Emits 'gameObjectRemoved' event

#### `createGameObject(name?: string): GameObject`
Creates and adds a new GameObject to the scene.
- Convenience method combining `new GameObject()` and `addGameObject()`
- Returns the created GameObject

#### `destroyGameObject(gameObject: GameObject): void`
Destroys a specific GameObject if it belongs to this scene.

#### `destroyAllGameObjects(): void`
Destroys all GameObjects in the scene.

### Finding GameObjects

#### `findGameObject(name: string): GameObject | null`
Finds first GameObject with matching name.
- Returns `null` if not found
- Excludes destroyed objects

#### `findGameObjects(name: string): GameObject[]`
Finds all GameObjects with matching name.
- Returns empty array if none found
- Excludes destroyed objects

#### `findGameObjectById(id: number): GameObject | null`
Finds GameObject by unique ID.
- Returns `null` if not found

#### `findGameObjectsWithComponent<T extends Component>(componentClass: new (...args: any[]) => T): GameObject[]`
Finds all GameObjects that have a specific component type.

**Example:**
```typescript
// Find all objects with Rigidbody2D
const physicsObjects = scene.findGameObjectsWithComponent(Rigidbody2D);
```

#### `getAllGameObjects(): readonly GameObject[]`
Gets all active GameObjects in the scene.
- Returns read-only array
- Excludes destroyed objects

### Lifecycle Methods

#### `start(): void`
Starts the scene and initializes all GameObjects.
- Calls `awake()` on all GameObjects
- Calls `start()` on all active GameObjects
- Can only be called once
- Emits 'sceneStarted' event

#### `update(): void`
Updates all active GameObjects in the scene.
- Processes pending GameObject additions/removals
- Calls `update()` on all active GameObjects
- Calls `lateUpdate()` on all active GameObjects
- Only runs if scene is active

#### `unload(): void`
Unloads the scene and cleans up resources.
- Destroys all GameObjects
- Resets started state
- Emits 'sceneUnloaded' event

### Serialization

#### `serialize(): any`
Serializes scene data to JSON-compatible object.
- Includes scene name, active state
- Includes basic GameObject data (id, name, active, transform)

## Events

The Scene emits the following events:
- `'gameObjectAdded'` - When GameObject is added
- `'gameObjectRemoved'` - When GameObject is removed  
- `'sceneStarted'` - When scene starts
- `'sceneUnloaded'` - When scene unloads

## Usage Examples

### Basic Scene Setup
```typescript
// Create scene
const scene = new Scene('MainGame');

// Add GameObjects
const player = new GameObject('Player');
const enemy = new GameObject('Enemy');
scene.addGameObject(player);
scene.addGameObject(enemy);

// Start scene
scene.start();
```

### Finding Objects
```typescript
// Find specific object
const player = scene.findGameObject('Player');
if (player) {
    // Use player object
}

// Find objects with physics
const physicsObjects = scene.findGameObjectsWithComponent(Rigidbody2D);
physicsObjects.forEach(obj => {
    // Do something with physics objects
});
```

### Scene Lifecycle
```typescript
// Scene setup
const scene = new Scene('GameLevel1');
// ... add objects ...

// Start scene (call once)
scene.start();

// Update loop (called every frame)
function gameLoop() {
    scene.update();
    requestAnimationFrame(gameLoop);
}

// Cleanup
scene.unload();
```

## Common Errors

### ❌ Camera Management
```typescript
// WRONG - Scene does NOT have setCamera method
scene.setCamera(camera); // ERROR: setCamera is not a function
```

**Solution:** Camera management is handled by the Engine or Renderer, not Scene.

### ❌ Direct Array Manipulation
```typescript
// WRONG - Don't access internal arrays directly
scene.gameObjects.push(newObject); // Not recommended
```

**Solution:** Use `addGameObject()` method:
```typescript
// CORRECT
scene.addGameObject(newObject);
```

## Integration Points

- **Engine**: Sets current scene with `engine.setScene(scene)`
- **GameObject**: Objects reference their scene via `gameObject.scene`
- **Components**: Can access scene through `this.gameObject.scene`

## Performance Notes

- GameObject additions/removals are batched and processed during `update()`
- Destroyed objects are filtered out during processing
- Scene maintains references until explicit cleanup