# Collider2D Component Documentation

## Overview
The `Collider2D` is an abstract base class for all 2D collision components. It provides collision detection, trigger functionality, layer-based filtering, and event handling. Specific implementations include BoxCollider2D and CircleCollider2D.

## Class Declaration
```typescript
export abstract class Collider2D extends Component
```

## Interfaces

### Bounds2D Interface
```typescript
interface Bounds2D {
    min: Vector2;     // Minimum corner (bottom-left)
    max: Vector2;     // Maximum corner (top-right)
    center: Vector2;  // Center point
    size: Vector2;    // Width and height
}
```

### RaycastHit2D Interface
```typescript
interface RaycastHit2D {
    collider: Collider2D;  // The collider that was hit
    point: Vector2;        // World position of hit
    normal: Vector2;       // Surface normal at hit point
    distance: number;      // Distance from ray origin
    fraction: number;      // Fraction along ray (0-1)
}
```

### Collision2D Interface
```typescript
interface Collision2D {
    collider: Collider2D;        // This collider
    otherCollider: Collider2D;   // Other collider
    gameObject: GameObject;      // This GameObject
    rigidbody: Rigidbody2D | null; // This rigidbody
    transform: Transform;        // This transform
    contactCount: number;        // Number of contact points
    contacts: ContactPoint2D[];  // Contact point details
    relativeVelocity: Vector2;   // Relative velocity
    impulse: Vector2;           // Collision impulse
}
```

### ContactPoint2D Interface
```typescript
interface ContactPoint2D {
    point: Vector2;         // World contact position
    normal: Vector2;        // Contact normal
    separation: number;     // Penetration depth
    normalImpulse: number;  // Normal impulse magnitude
    tangentImpulse: number; // Tangent impulse magnitude
}
```

## Properties

### Configuration

#### `isTrigger: boolean`
If true, collider acts as trigger (no physics response, only events).

#### `material: PhysicsMaterial2D`
Physics material controlling friction, bounciness, and density.

#### `offset: Vector2`
Local position offset from Transform.

**Example:**
```typescript
// Sensor collider
collider.isTrigger = true;

// Bouncy material
collider.material = new PhysicsMaterial2D(0.8, 0.9, 1.0); // friction, bounciness, density

// Offset from center
collider.offset = new Vector2(0, 10);
```

### Layer System

#### `layer: number`
Collision layer (0-31) for this collider.

#### `layerMask: number`
Bitmask defining which layers this collider can interact with.

**Example:**
```typescript
// Player on layer 1
collider.setLayer(1);

// Can only collide with layers 0 (ground) and 2 (enemies)
collider.setLayerMask((1 << 0) | (1 << 2));

// Helper method to check collision compatibility
if (colliderA.canCollideWith(colliderB)) {
    // They can collide
}
```

### State

#### `enabled: boolean`
Whether this collider participates in collision detection.

**Example:**
```typescript
// Temporarily disable collider
collider.enabled = false;

// Re-enable
collider.enabled = true;
```

## Abstract Methods

These must be implemented by concrete collider types:

#### `containsPoint(point: Vector2): boolean`
Tests if a world point is inside the collider.

#### `getClosestPoint(point: Vector2): Vector2`
Returns the closest point on the collider surface to a given point.

#### `computeBounds(): Bounds2D`
Calculates the axis-aligned bounding box.

#### `detailedOverlap(other: Collider2D): boolean`
Performs precise collision detection between colliders.

#### `raycast(origin: Vector2, direction: Vector2, distance: number): RaycastHit2D | null`
Tests ray intersection with the collider.

#### `computeSeparation(other: Collider2D): ColliderSeparation2D`
Calculates separation vector when overlapping.

## Properties (Read-only)

### World Transform Properties

#### `worldPosition: Vector2` (get)
World position including offset.

#### `worldRotation: number` (get)
World rotation from Transform.

#### `worldScale: Vector2` (get)
World scale from Transform.

#### `bounds: Bounds2D` (get)
Cached axis-aligned bounding box (auto-updates when dirty).

**Example:**
```typescript
// Get world-space bounds
const bounds = collider.bounds;
console.log('Center:', bounds.center);
console.log('Size:', bounds.size);

// Check if point is in bounding box
const point = new Vector2(100, 200);
if (point.x >= bounds.min.x && point.x <= bounds.max.x &&
    point.y >= bounds.min.y && point.y <= bounds.max.y) {
    // Point is in bounds
}
```

## Methods

### Layer Management

#### `setLayer(layer: number): void`
Sets collision layer (clamped to 0-31).

#### `getLayer(): number`
Gets current collision layer.

#### `setLayerMask(mask: number): void`
Sets which layers this collider can interact with.

#### `getLayerMask(): number`
Gets current layer mask.

#### `canCollideWith(other: Collider2D): boolean`
Checks if this collider can interact with another based on layers.

**Example:**
```typescript
// Set up layer interaction
collider.setLayer(1);                    // Player layer
collider.setLayerMask(0b00000101);      // Can hit layers 0 and 2

// Check compatibility
const enemy = enemyObject.getComponent(Collider2D);
if (collider.canCollideWith(enemy)) {
    console.log('Player can collide with enemy');
}
```

### Collision Detection

#### `overlaps(other: Collider2D): boolean`
Tests if this collider overlaps with another.

#### `distance(other: Collider2D): ColliderDistance2D`
Calculates distance and closest points between colliders.

**Example:**
```typescript
// Test overlap
if (playerCollider.overlaps(enemyCollider)) {
    console.log('Player touching enemy!');
}

// Get distance info
const distInfo = playerCollider.distance(enemyCollider);
if (distInfo.isOverlapping) {
    console.log('Overlapping by:', distInfo.distance);
} else {
    console.log('Distance:', distInfo.distance);
    console.log('Closest points:', distInfo.pointA, distInfo.pointB);
}
```

### Bounds Management

#### `invalidateBounds(): void`
Marks bounds as dirty for recalculation.

**Example:**
```typescript
// Call when transform changes
transform.position = newPosition;
collider.invalidateBounds(); // Bounds will recalculate next access
```

## Event System

Collider2D automatically fires events through the Scene event system:

### Trigger Events

#### Trigger Enter
```typescript
scene.on('triggerEnter2D', (event) => {
    console.log('Trigger entered:', event.trigger, event.other);
});
```

#### Trigger Stay
```typescript
scene.on('triggerStay2D', (event) => {
    console.log('Trigger staying:', event.trigger, event.other);
});
```

#### Trigger Exit
```typescript
scene.on('triggerExit2D', (event) => {
    console.log('Trigger exited:', event.trigger, event.other);
});
```

### Collision Events

#### Collision Enter
```typescript
scene.on('collisionEnter2D', (event) => {
    console.log('Collision started:', event.collision);
});
```

#### Collision Stay
```typescript
scene.on('collisionStay2D', (event) => {
    console.log('Collision continuing:', event.collision);
});
```

#### Collision Exit
```typescript
scene.on('collisionExit2D', (event) => {
    console.log('Collision ended:', event.collision);
});
```

## Usage Examples

### Basic Trigger Zone
```typescript
class TriggerZone extends Component {
    private collider: Collider2D;
    private playersInside: Set<GameObject> = new Set();
    
    start(): void {
        this.collider = this.addComponent(BoxCollider2D);
        this.collider.isTrigger = true;
        this.collider.setLayer(10); // Trigger layer
        
        // Listen for trigger events
        this.scene.on('triggerEnter2D', this.onTriggerEnter.bind(this));
        this.scene.on('triggerExit2D', this.onTriggerExit.bind(this));
    }
    
    private onTriggerEnter(event: any): void {
        if (event.trigger === this.collider) {
            const player = event.otherGameObject.getComponent(PlayerController);
            if (player) {
                this.playersInside.add(event.otherGameObject);
                console.log('Player entered zone');
                this.activateZone();
            }
        }
    }
    
    private onTriggerExit(event: any): void {
        if (event.trigger === this.collider) {
            const player = event.otherGameObject.getComponent(PlayerController);
            if (player) {
                this.playersInside.delete(event.otherGameObject);
                console.log('Player left zone');
                if (this.playersInside.size === 0) {
                    this.deactivateZone();
                }
            }
        }
    }
    
    private activateZone(): void {
        console.log('Zone activated!');
    }
    
    private deactivateZone(): void {
        console.log('Zone deactivated!');
    }
}
```

### Damage Collision System
```typescript
class DamageDealer extends Component {
    private collider: Collider2D;
    public damage: number = 10;
    public damageInterval: number = 1.0; // seconds
    private lastDamageTime: Map<GameObject, number> = new Map();
    
    start(): void {
        this.collider = this.getComponent(Collider2D);
        this.scene.on('collisionEnter2D', this.onCollisionEnter.bind(this));
        this.scene.on('collisionStay2D', this.onCollisionStay.bind(this));
    }
    
    private onCollisionEnter(event: any): void {
        if (event.collision.collider === this.collider) {
            this.tryDealDamage(event.collision.otherCollider.gameObject);
        }
    }
    
    private onCollisionStay(event: any): void {
        if (event.collision.collider === this.collider) {
            this.tryDealDamage(event.collision.otherCollider.gameObject);
        }
    }
    
    private tryDealDamage(target: GameObject): void {
        const health = target.getComponent(Health);
        if (!health) return;
        
        const currentTime = Time.time;
        const lastDamage = this.lastDamageTime.get(target) || 0;
        
        if (currentTime - lastDamage >= this.damageInterval) {
            health.takeDamage(this.damage);
            this.lastDamageTime.set(target, currentTime);
            console.log(`Dealt ${this.damage} damage to ${target.name}`);
        }
    }
}
```

### Pickup System
```typescript
class Pickup extends Component {
    private collider: Collider2D;
    public pickupType: string = 'coin';
    public value: number = 10;
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.isTrigger = true;
        this.collider.setLayer(15); // Pickup layer
        
        this.scene.on('triggerEnter2D', this.onTriggerEnter.bind(this));
    }
    
    private onTriggerEnter(event: any): void {
        if (event.trigger === this.collider) {
            const player = event.otherGameObject.getComponent(PlayerController);
            if (player) {
                this.collectPickup(player);
            }
        }
    }
    
    private collectPickup(player: PlayerController): void {
        console.log(`Collected ${this.pickupType} worth ${this.value}`);
        
        // Add to player inventory or score
        const inventory = player.getComponent(Inventory);
        if (inventory) {
            inventory.addItem(this.pickupType, this.value);
        }
        
        // Play pickup effect
        this.playPickupEffect();
        
        // Destroy pickup
        this.gameObject.destroy();
    }
    
    private playPickupEffect(): void {
        // Spawn particle effect, play sound, etc.
    }
}
```

### Layer-Based Collision Filtering
```typescript
class LayerManager {
    // Layer definitions
    public static readonly PLAYER = 0;
    public static readonly GROUND = 1;
    public static readonly ENEMY = 2;
    public static readonly PICKUP = 3;
    public static readonly PROJECTILE = 4;
    
    // Layer masks (what each layer can collide with)
    public static readonly PLAYER_MASK = (1 << LayerManager.GROUND) | (1 << LayerManager.ENEMY);
    public static readonly ENEMY_MASK = (1 << LayerManager.GROUND) | (1 << LayerManager.PLAYER) | (1 << LayerManager.PROJECTILE);
    public static readonly PROJECTILE_MASK = (1 << LayerManager.GROUND) | (1 << LayerManager.ENEMY);
    
    public static setupPlayerCollider(collider: Collider2D): void {
        collider.setLayer(LayerManager.PLAYER);
        collider.setLayerMask(LayerManager.PLAYER_MASK);
    }
    
    public static setupEnemyCollider(collider: Collider2D): void {
        collider.setLayer(LayerManager.ENEMY);
        collider.setLayerMask(LayerManager.ENEMY_MASK);
    }
    
    public static setupProjectileCollider(collider: Collider2D): void {
        collider.setLayer(LayerManager.PROJECTILE);
        collider.setLayerMask(LayerManager.PROJECTILE_MASK);
    }
}
```

### Raycast-Based Line of Sight
```typescript
class LineOfSight extends Component {
    private collider: Collider2D;
    public sightRange: number = 200;
    public sightAngle: number = Math.PI / 3; // 60 degrees
    
    start(): void {
        this.collider = this.getComponent(Collider2D);
    }
    
    public canSeeTarget(target: Vector2): boolean {
        const origin = this.transform.worldPosition;
        const direction = target.subtract(origin);
        const distance = direction.magnitude();
        
        if (distance > this.sightRange) {
            return false; // Too far
        }
        
        // Check if target is within sight angle
        const forward = Vector2.fromAngle(this.transform.worldRotation);
        const angle = Math.acos(direction.normalized().dot(forward));
        
        if (angle > this.sightAngle / 2) {
            return false; // Outside sight cone
        }
        
        // Raycast to check for obstacles
        const hit = this.performRaycast(origin, direction.normalized(), distance);
        return hit === null; // Can see if no obstacles
    }
    
    private performRaycast(origin: Vector2, direction: Vector2, distance: number): RaycastHit2D | null {
        // This would use the physics world's raycast system
        const physicsWorld = Physics2DWorld.getInstance();
        return physicsWorld.raycast(origin, direction, distance, this.collider.getLayerMask());
    }
    
    public getVisibleTargets(targets: GameObject[]): GameObject[] {
        return targets.filter(target => {
            const targetPos = target.transform.worldPosition;
            return this.canSeeTarget(targetPos);
        });
    }
}
```

### Area Effect System
```typescript
class AreaEffect extends Component {
    private collider: Collider2D;
    public effectRadius: number = 100;
    public effectStrength: number = 1.0;
    public affectedObjects: Set<GameObject> = new Set();
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.isTrigger = true;
        
        // Set up collider size
        const circleCollider = this.collider as CircleCollider2D;
        circleCollider.radius = this.effectRadius;
        
        this.scene.on('triggerEnter2D', this.onTriggerEnter.bind(this));
        this.scene.on('triggerExit2D', this.onTriggerExit.bind(this));
    }
    
    update(): void {
        // Apply effect to all objects in range
        this.affectedObjects.forEach(obj => {
            this.applyEffect(obj);
        });
    }
    
    private onTriggerEnter(event: any): void {
        if (event.trigger === this.collider) {
            this.affectedObjects.add(event.otherGameObject);
        }
    }
    
    private onTriggerExit(event: any): void {
        if (event.trigger === this.collider) {
            this.affectedObjects.delete(event.otherGameObject);
        }
    }
    
    private applyEffect(target: GameObject): void {
        // Calculate distance-based effect strength
        const distance = target.transform.worldPosition.distance(this.transform.worldPosition);
        const falloff = 1 - (distance / this.effectRadius);
        const strength = this.effectStrength * falloff;
        
        // Apply effect (e.g., healing, damage, speed boost)
        const health = target.getComponent(Health);
        if (health) {
            health.heal(strength * Time.deltaTime);
        }
    }
}
```

## CollisionDetection2D Utility Class

The Collider2D system includes static collision detection algorithms:

### Point Tests
```typescript
// Test if point is in circle
const inCircle = CollisionDetection2D.pointInCircle(point, center, radius);

// Test if point is in box
const inBox = CollisionDetection2D.pointInBox(point, center, size, rotation);
```

### Shape vs Shape
```typescript
// Circle vs Circle
const circleCollision = CollisionDetection2D.circleVsCircle(
    centerA, radiusA, centerB, radiusB
);

// Box vs Box (AABB)
const boxCollision = CollisionDetection2D.aabbVsAabb(
    centerA, sizeA, centerB, sizeB
);

// Circle vs Box
const mixedCollision = CollisionDetection2D.circleVsBox(
    circleCenter, radius, boxCenter, boxSize, boxRotation
);
```

## Performance Considerations

- Bounds checking provides early rejection for expensive collision tests
- Layer masking reduces collision pair count significantly
- Trigger colliders skip physics response calculations
- Spatial partitioning in Physics2DWorld optimizes broad-phase detection
- Cache bounds when possible, invalidate only when transform changes

## Common Errors

### ❌ Forgetting Layer Setup
```typescript
// WRONG - Default layer 0 collides with everything
const collider = addComponent(BoxCollider2D);

// CORRECT - Set up appropriate layers
const collider = addComponent(BoxCollider2D);
LayerManager.setupPlayerCollider(collider);
```

### ❌ Missing Event Listeners
```typescript
// WRONG - Creating trigger but not listening for events
collider.isTrigger = true; // No way to know when triggered

// CORRECT - Set up event handlers
collider.isTrigger = true;
scene.on('triggerEnter2D', this.handleTrigger.bind(this));
```

### ❌ Modifying Bounds Directly
```typescript
// WRONG - Bounds are read-only
collider.bounds.min = new Vector2(0, 0); // No effect

// CORRECT - Modify underlying properties
collider.offset = new Vector2(10, 10);
collider.invalidateBounds();
```

### ❌ Layer Mask Confusion
```typescript
// WRONG - Layer vs Layer Mask confusion
collider.setLayerMask(1); // Only layer 0, not layer 1

// CORRECT - Use bit shifting for layer masks
collider.setLayerMask(1 << 1); // Layer 1
collider.setLayerMask((1 << 0) | (1 << 2)); // Layers 0 and 2
```

## Integration Points

- **Physics2DWorld**: Manages collision detection and response
- **Rigidbody2D**: Provides physics simulation and collision response
- **Transform**: Position, rotation, and scale affect collision shape
- **Scene**: Event system for collision and trigger callbacks
- **PhysicsMaterial2D**: Surface properties for collision response