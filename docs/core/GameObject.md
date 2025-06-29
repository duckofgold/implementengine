# GameObject Class Documentation

## Overview
The `GameObject` class is the fundamental entity in ImplementEngine. Every object in a scene is a GameObject that can have components attached to provide functionality. Uses component-based architecture.

## Class Declaration
```typescript
export class GameObject
```

## Constructor
```typescript
constructor(name: string = 'GameObject')
```

**Parameters:**
- `name` (string, optional): GameObject name identifier, defaults to 'GameObject'

**Behavior:**
- Automatically assigns unique ID
- Creates Transform component automatically
- Increments static ID counter

## Properties

### Public Properties
- `name: string` - GameObject identifier name
- `active: boolean` - Whether GameObject is active (defaults to `true`)
- `scene: Scene | null` - Reference to containing scene (set by Scene)
- `readonly transform: Transform` - Transform component (always present)
- `readonly id: number` - Unique identifier assigned at creation

### Read-only Properties
- `destroyed: boolean` - Whether GameObject has been destroyed

### Private Properties
- `components: Component[]` - Array of attached components
- `_destroyed: boolean` - Internal destruction state
- `static nextId: number` - Static counter for unique IDs

## Component Management

### `addComponent<T extends Component>(componentClass: new (...args: any[]) => T, ...args: any[]): T`
Adds a component to the GameObject.

**Type Parameters:**
- `T extends Component` - Component type to add

**Parameters:**
- `componentClass` - Component constructor
- `...args` - Arguments to pass to component constructor

**Returns:**
- `T` - The created component instance

**Throws:**
- Error if GameObject is destroyed

**Behavior:**
- Creates new component instance
- Sets component.gameObject reference
- If scene is started, calls component.awake() and component.start()

**Example:**
```typescript
const gameObject = new GameObject('Player');

// Add components with constructor arguments
const rigidbody = gameObject.addComponent(Rigidbody2D, BodyType.Dynamic);
const collider = gameObject.addComponent(BoxCollider2D, new Vector2(50, 50));
const sprite = gameObject.addComponent(SpriteRenderer);

// Components are automatically configured
console.log(rigidbody.bodyType); // BodyType.Dynamic
console.log(collider.size);      // Vector2(50, 50)
```

### `getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | null`
Gets the first component of the specified type.

**Returns:**
- `T | null` - Component instance or null if not found

**Example:**
```typescript
const sprite = gameObject.getComponent(SpriteRenderer);
if (sprite) {
    sprite.setSprite(myImage);
}

// Null check is important
const physics = gameObject.getComponent(Rigidbody2D);
if (physics) {
    physics.velocity = new Vector2(100, 0);
}
```

### `getComponents<T extends Component>(componentClass: new (...args: any[]) => T): T[]`
Gets all components of the specified type.

**Returns:**
- `T[]` - Array of component instances (empty if none found)

**Example:**
```typescript
// Get all colliders
const colliders = gameObject.getComponents(Collider2D);
colliders.forEach(collider => {
    collider.isTrigger = true;
});
```

### `removeComponent<T extends Component>(component: T): boolean`
Removes a specific component instance.

**Returns:**
- `boolean` - True if removed, false if not found

**Example:**
```typescript
const oldCollider = gameObject.getComponent(BoxCollider2D);
if (oldCollider) {
    gameObject.removeComponent(oldCollider);
}
```

### `removeComponentOfType<T extends Component>(componentClass: new (...args: any[]) => T): boolean`
Removes the first component of the specified type.

**Returns:**
- `boolean` - True if removed, false if not found

**Example:**
```typescript
// Remove physics component
const removed = gameObject.removeComponentOfType(Rigidbody2D);
if (removed) {
    console.log('Physics component removed');
}
```

## Lifecycle Methods

### `setActive(active: boolean): void`
Sets the active state of the GameObject.

**Behavior:**
- When set to false: stops component updates
- When set to true: calls start() on enabled components if scene is started
- No effect if already in requested state

**Example:**
```typescript
// Disable enemy during pause
enemy.setActive(false);

// Re-enable when unpausing
enemy.setActive(true);
```

### `awake(): void`
Called when GameObject is first created or added to started scene.
- Calls awake() on all non-destroyed components
- Called before start()
- Called even if GameObject is inactive

### `start(): void`
Called when GameObject becomes active in a started scene.
- Calls start() on all enabled, non-destroyed components
- Only called if GameObject is active
- Called after awake()

### `update(): void`
Called every frame for active GameObjects.
- Calls update() on all enabled, non-destroyed components
- Only called if GameObject is active
- Part of main game loop

### `lateUpdate(): void`
Called every frame after all update() calls.
- Calls lateUpdate() on all enabled, non-destroyed components
- Only called if GameObject is active
- Useful for camera following, UI updates

### `destroy(): void`
Destroys the GameObject and all its components.

**Behavior:**
- Sets destroyed state to true
- Calls destroy() on all components
- Clears component array
- Removes from scene
- Cannot be undone

**Example:**
```typescript
// Destroy enemy when health reaches zero
if (enemy.health <= 0) {
    enemy.destroy();
}

// GameObject is no longer usable
console.log(enemy.destroyed); // true
```

## Utility Methods

### `clone(): GameObject`
Creates a shallow clone of the GameObject.

**Returns:**
- `GameObject` - New GameObject with copied transform values

**Behavior:**
- Creates new GameObject with "(Clone)" suffix
- Copies active state
- Copies transform position, rotation, scale
- Does NOT copy components (shallow clone)

**Example:**
```typescript
const original = new GameObject('Bullet');
const copy = original.clone();

console.log(copy.name);     // "Bullet (Clone)"
console.log(copy.id);       // Different from original
console.log(copy.transform.position); // Same as original
```

### `toString(): string`
Returns string representation of GameObject.

**Returns:**
- `string` - Format: "GameObject(name, id: number)"

## Usage Examples

### Basic GameObject Creation
```typescript
// Create empty GameObject
const empty = new GameObject();

// Create named GameObject
const player = new GameObject('Player');

// Add to scene
scene.addGameObject(player);
```

### Component Pattern Usage
```typescript
// Create player with multiple components
const player = new GameObject('Player');

// Add physics
const rigidbody = player.addComponent(Rigidbody2D, BodyType.Dynamic);
rigidbody.mass = 1.0;

// Add collision
const collider = player.addComponent(BoxCollider2D, new Vector2(32, 48));

// Add rendering
const sprite = player.addComponent(SpriteRenderer);
sprite.setSprite(playerImage);

// Add custom behavior
class PlayerController extends Component {
    update() {
        // Handle input
        if (Input.getKey('a')) {
            this.transform.position.x -= 100 * Time.deltaTime;
        }
    }
}
player.addComponent(PlayerController);
```

### Component Interaction
```typescript
// Components can access other components
class HealthComponent extends Component {
    constructor() {
        super();
        this.health = 100;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        if (this.health <= 0) {
            // Access other components
            const sprite = this.getComponent(SpriteRenderer);
            if (sprite) {
                sprite.visible = false;
            }
            
            // Destroy GameObject
            this.gameObject.destroy();
        }
    }
}
```

### Scene Integration
```typescript
// GameObject lifecycle in scene
const scene = new Scene('GameLevel');
const gameObject = new GameObject('TestObject');

// Add to scene
scene.addGameObject(gameObject);

// Start scene (calls awake and start on GameObject)
scene.start();

// Update loop (calls update and lateUpdate)
function gameLoop() {
    scene.update(); // Calls update on all GameObjects
}

// Cleanup
gameObject.destroy(); // Removes from scene automatically
```

### Factory Pattern
```typescript
class GameObjectFactory {
    static createPlayer(position) {
        const player = new GameObject('Player');
        player.transform.position = position;
        
        player.addComponent(Rigidbody2D, BodyType.Dynamic);
        player.addComponent(BoxCollider2D, new Vector2(32, 48));
        player.addComponent(SpriteRenderer);
        player.addComponent(PlayerController);
        
        return player;
    }
    
    static createEnemy(position, enemyType) {
        const enemy = new GameObject(`Enemy_${enemyType}`);
        enemy.transform.position = position;
        
        enemy.addComponent(Rigidbody2D, BodyType.Dynamic);
        enemy.addComponent(CircleCollider2D, 16);
        enemy.addComponent(SpriteRenderer);
        enemy.addComponent(EnemyAI, enemyType);
        
        return enemy;
    }
}

// Usage
const player = GameObjectFactory.createPlayer(new Vector2(100, 100));
const enemy = GameObjectFactory.createEnemy(new Vector2(300, 100), 'goblin');
```

## Common Patterns

### Enable/Disable Pattern
```typescript
// Temporarily disable GameObject
gameObject.setActive(false); // Stops updates
// ... later ...
gameObject.setActive(true);  // Resumes updates

// vs Component-level disable
const component = gameObject.getComponent(SomeComponent);
component.enabled = false; // Disables specific component
```

### Safe Component Access
```typescript
// Always null-check components
const rigidbody = gameObject.getComponent(Rigidbody2D);
if (rigidbody) {
    rigidbody.addForce(new Vector2(100, 0));
}

// Or use optional chaining (if available)
gameObject.getComponent(SpriteRenderer)?.setVisible(false);
```

### Component Communication
```typescript
class DamageReceiver extends Component {
    takeDamage(amount) {
        // Notify other components
        const health = this.getComponent(HealthComponent);
        health?.reduceHealth(amount);
        
        const effects = this.getComponent(EffectsComponent);
        effects?.playDamageEffect();
    }
}
```

## Common Errors

### ❌ Using Destroyed GameObject
```typescript
gameObject.destroy();
gameObject.addComponent(SpriteRenderer); // ERROR: Cannot add component to destroyed GameObject
```

### ❌ Null Component Access
```typescript
const sprite = gameObject.getComponent(SpriteRenderer); // null
sprite.setVisible(false); // ERROR: Cannot read property of null
```

**Solution:**
```typescript
const sprite = gameObject.getComponent(SpriteRenderer);
if (sprite) {
    sprite.setVisible(false); // Safe
}
```

### ❌ Transform Not Available
```typescript
// Transform is ALWAYS available (created in constructor)
const transform = gameObject.getComponent(Transform); // Always returns Transform
// But you can access it directly:
gameObject.transform.position = new Vector2(100, 200); // Preferred
```

## Performance Notes

- GameObject creation is lightweight
- Component arrays are optimized for iteration
- Destroyed components are filtered during updates
- Transform is cached for direct access
- ID assignment is O(1) with static counter

## Integration Points

- **Scene**: Manages GameObject lifecycle and updates
- **Components**: Attached to GameObjects for functionality
- **Transform**: Always present, provides position/rotation/scale
- **Rendering**: SpriteRenderer components are automatically rendered
- **Physics**: Rigidbody2D and Collider2D components integrate with physics system