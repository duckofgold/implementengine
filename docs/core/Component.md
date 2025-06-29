# Component Class Documentation

## Overview
The `Component` class is the abstract base class for all components in ImplementEngine. Components provide functionality to GameObjects through composition. This class cannot be instantiated directly.

## Class Declaration
```typescript
export abstract class Component
```

## Properties

### Public Properties
- `gameObject: GameObject | null` - Reference to the owning GameObject (set by GameObject.addComponent)
- `enabled: boolean` - Whether component is enabled (defaults to `true`)

### Read-only Properties
- `destroyed: boolean` - Whether component has been destroyed
- `transform: Transform | null` - Convenience access to GameObject's transform component

### Private Properties
- `_destroyed: boolean` - Internal destruction state

## Lifecycle Methods (Virtual)

All lifecycle methods are virtual and can be overridden in derived components:

### `awake(): void`
Called when component is first added to a GameObject or when GameObject is added to a started scene.
- Called once per component
- Called before start()
- Called even if component is disabled
- Override for initialization that doesn't depend on other components

### `start(): void`
Called when component becomes active and enabled in a started scene.
- Called after awake()
- Only called if component is enabled
- Override for initialization that depends on other components

### `update(): void`
Called every frame for enabled components on active GameObjects.
- Part of main game loop
- Override for per-frame logic (movement, input, etc.)

### `lateUpdate(): void`
Called every frame after all update() calls.
- Useful for camera following, UI updates
- Override for logic that needs to run after all updates

### `onDestroy(): void`
Called when component is being destroyed.
- Override for cleanup logic
- Called before component is removed from GameObject

## Component Management

### `destroy(): void`
Destroys the component.

**Behavior:**
- Sets destroyed state to true
- Calls onDestroy()
- Removes component from GameObject
- Cannot be undone

### `getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | null`
Gets another component of specified type from the same GameObject.

**Returns:**
- `T | null` - Component instance or null if not found

### `getComponents<T extends Component>(componentClass: new (...args: any[]) => T): T[]`
Gets all components of specified type from the same GameObject.

**Returns:**
- `T[]` - Array of component instances

### `addComponent<T extends Component>(componentClass: new (...args: any[]) => T, ...args: any[]): T`
Adds a component to the same GameObject.

**Throws:**
- Error if gameObject is null

## Creating Custom Components

### Basic Component Template
```typescript
import { Component } from '../core/Component';
import { Vector2 } from '../utils/Vector2';
import { Time } from '../core/Time';

export class CustomComponent extends Component {
    // Component properties
    private speed: number = 100;
    private direction: Vector2 = Vector2.right;
    
    // Constructor (optional)
    constructor(speed: number = 100) {
        super();
        this.speed = speed;
    }
    
    // Lifecycle methods
    awake(): void {
        console.log('Custom component awakened');
    }
    
    start(): void {
        console.log('Custom component started');
    }
    
    update(): void {
        // Per-frame logic
        if (this.transform) {
            const movement = this.direction.multiply(this.speed * Time.deltaTime);
            this.transform.position = this.transform.position.add(movement);
        }
    }
    
    lateUpdate(): void {
        // Post-update logic
    }
    
    onDestroy(): void {
        console.log('Custom component destroyed');
    }
    
    // Public methods
    public setDirection(direction: Vector2): void {
        this.direction = direction.normalized();
    }
    
    public setSpeed(speed: number): void {
        this.speed = Math.max(0, speed);
    }
}
```

### Component with Dependencies
```typescript
import { Component } from '../core/Component';
import { Rigidbody2D } from './Rigidbody2D';
import { SpriteRenderer } from './SpriteRenderer';

export class HealthComponent extends Component {
    private maxHealth: number = 100;
    private currentHealth: number = 100;
    private rigidbody: Rigidbody2D | null = null;
    private sprite: SpriteRenderer | null = null;
    
    awake(): void {
        // Get required components
        this.rigidbody = this.getComponent(Rigidbody2D);
        this.sprite = this.getComponent(SpriteRenderer);
        
        if (!this.rigidbody) {
            console.warn('HealthComponent requires Rigidbody2D');
        }
    }
    
    start(): void {
        // Initialize with full health
        this.currentHealth = this.maxHealth;
        this.updateVisuals();
    }
    
    public takeDamage(amount: number): void {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.updateVisuals();
        
        if (this.currentHealth <= 0) {
            this.die();
        }
    }
    
    public heal(amount: number): void {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.updateVisuals();
    }
    
    private updateVisuals(): void {
        if (this.sprite) {
            const healthPercent = this.currentHealth / this.maxHealth;
            // Fade sprite based on health
            this.sprite.alpha = Math.max(0.3, healthPercent);
        }
    }
    
    private die(): void {
        console.log('GameObject died');
        this.gameObject?.destroy();
    }
    
    public getHealthPercent(): number {
        return this.currentHealth / this.maxHealth;
    }
}
```

### Input Component
```typescript
import { Component } from '../core/Component';
import { Input } from '../core/Input';
import { Rigidbody2D, ForceMode } from './Rigidbody2D';
import { Vector2 } from '../utils/Vector2';

export class PlayerController extends Component {
    private moveSpeed: number = 300;
    private jumpForce: number = 500;
    private rigidbody: Rigidbody2D | null = null;
    private isGrounded: boolean = false;
    
    awake(): void {
        this.rigidbody = this.getComponent(Rigidbody2D);
    }
    
    update(): void {
        this.handleMovement();
        this.handleJumping();
    }
    
    private handleMovement(): void {
        if (!this.rigidbody) return;
        
        let moveInput = 0;
        if (Input.getKey('a') || Input.getKey('ArrowLeft')) moveInput = -1;
        if (Input.getKey('d') || Input.getKey('ArrowRight')) moveInput = 1;
        
        if (moveInput !== 0) {
            const force = new Vector2(moveInput * this.moveSpeed, 0);
            this.rigidbody.addForce(force, ForceMode.Force);
        }
    }
    
    private handleJumping(): void {
        if (!this.rigidbody) return;
        
        if (Input.getKeyDown(' ') && this.isGrounded) {
            const jumpForce = new Vector2(0, -this.jumpForce);
            this.rigidbody.addForce(jumpForce, ForceMode.Impulse);
            this.isGrounded = false;
        }
    }
    
    public setGrounded(grounded: boolean): void {
        this.isGrounded = grounded;
    }
}
```

## Component Communication Patterns

### Event-Based Communication
```typescript
import { Component } from '../core/Component';
import { EventEmitter } from '../utils/EventEmitter';

export class DamageDealer extends Component {
    private damage: number = 10;
    
    public dealDamage(target: GameObject): void {
        const health = target.getComponent(HealthComponent);
        if (health) {
            health.takeDamage(this.damage);
            
            // Emit event
            this.emit('damageDealt', { target, damage: this.damage });
        }
    }
}

export class EffectsComponent extends Component {
    start(): void {
        // Listen for damage events
        const damageDealer = this.getComponent(DamageDealer);
        if (damageDealer) {
            damageDealer.on('damageDealt', this.onDamageDealt.bind(this));
        }
    }
    
    private onDamageDealt(data: { target: GameObject, damage: number }): void {
        console.log(`Dealt ${data.damage} damage to ${data.target.name}`);
        // Play damage effect
    }
}
```

### Component Interfaces
```typescript
// Define interfaces for component contracts
interface IDamageable {
    takeDamage(amount: number): void;
    getCurrentHealth(): number;
}

interface IMovable {
    move(direction: Vector2): void;
    setSpeed(speed: number): void;
}

export class AdvancedHealthComponent extends Component implements IDamageable {
    private health: number = 100;
    
    takeDamage(amount: number): void {
        this.health -= amount;
    }
    
    getCurrentHealth(): number {
        return this.health;
    }
}

export class WeaponComponent extends Component {
    public attack(target: GameObject): void {
        // Look for damageable interface
        const components = target.getComponents(Component);
        const damageable = components.find(c => 'takeDamage' in c) as IDamageable;
        
        if (damageable) {
            damageable.takeDamage(25);
        }
    }
}
```

## Usage Examples

### Component Lifecycle
```typescript
// Component creation and lifecycle
const gameObject = new GameObject('TestObject');

class TestComponent extends Component {
    awake(): void {
        console.log('1. Awake called');
    }
    
    start(): void {
        console.log('2. Start called');
    }
    
    update(): void {
        console.log('3. Update called every frame');
    }
    
    lateUpdate(): void {
        console.log('4. LateUpdate called every frame');
    }
    
    onDestroy(): void {
        console.log('5. OnDestroy called');
    }
}

// Add component - triggers awake() if scene is started
const component = gameObject.addComponent(TestComponent);

// Enable/disable component
component.enabled = false; // Stops update/lateUpdate calls
component.enabled = true;  // Resumes update/lateUpdate calls

// Destroy component - triggers onDestroy()
component.destroy();
```

### Accessing Other Components
```typescript
export class ComponentInteraction extends Component {
    start(): void {
        // Get single component
        const sprite = this.getComponent(SpriteRenderer);
        if (sprite) {
            sprite.setVisible(true);
        }
        
        // Get multiple components
        const colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            collider.isTrigger = true;
        });
        
        // Add component from within component
        if (!this.getComponent(Rigidbody2D)) {
            this.addComponent(Rigidbody2D, BodyType.Dynamic);
        }
    }
}
```

### Transform Access
```typescript
export class TransformUser extends Component {
    update(): void {
        // Direct transform access (preferred)
        if (this.transform) {
            this.transform.position.x += 100 * Time.deltaTime;
        }
        
        // Alternative (same result)
        const transform = this.getComponent(Transform);
        if (transform) {
            transform.position.x += 100 * Time.deltaTime;
        }
    }
}
```

## Common Errors

### ❌ Not Checking for Null
```typescript
export class BadComponent extends Component {
    update(): void {
        this.transform.position.x += 1; // ERROR: transform could be null
    }
}
```

**Solution:**
```typescript
export class GoodComponent extends Component {
    update(): void {
        if (this.transform) {
            this.transform.position.x += 1; // Safe
        }
    }
}
```

### ❌ Calling Methods on Destroyed Component
```typescript
const component = gameObject.getComponent(MyComponent);
component.destroy();
component.someMethod(); // ERROR: Component is destroyed
```

### ❌ Missing Component Dependencies
```typescript
export class DependentComponent extends Component {
    start(): void {
        const required = this.getComponent(RequiredComponent);
        required.doSomething(); // ERROR: required could be null
    }
}
```

**Solution:**
```typescript
export class SafeDependentComponent extends Component {
    start(): void {
        const required = this.getComponent(RequiredComponent);
        if (!required) {
            console.error('SafeDependentComponent requires RequiredComponent');
            return;
        }
        required.doSomething(); // Safe
    }
}
```

## Performance Considerations

- Components are iterated every frame for active GameObjects
- Use enabled property to temporarily disable expensive components
- Cache component references in awake() or start() instead of calling getComponent() repeatedly
- Avoid heavy computation in update() - consider using coroutines or frame-skipping
- Clean up resources in onDestroy()

## Best Practices

1. **Single Responsibility**: Each component should have one clear purpose
2. **Dependency Injection**: Pass dependencies through constructor when possible
3. **Null Checking**: Always check for null when accessing other components
4. **Resource Cleanup**: Override onDestroy() for cleanup
5. **Enable/Disable**: Use enabled property for temporary state changes
6. **Documentation**: Document component dependencies and usage

## Integration Points

- **GameObject**: Owns and manages component lifecycle
- **Scene**: Calls lifecycle methods through GameObject
- **Transform**: Always accessible through this.transform
- **Engine**: Drives the update loop that calls component methods