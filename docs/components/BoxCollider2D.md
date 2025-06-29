# BoxCollider2D Component Documentation

## Overview
The `BoxCollider2D` component provides rectangular collision detection. It extends Collider2D to implement box-specific collision algorithms, supports rotation, and handles collision with other box and circle colliders. Perfect for walls, platforms, characters, and rectangular objects.

## Class Declaration
```typescript
export class BoxCollider2D extends Collider2D
```

## Constructor
```typescript
constructor(size?: Vector2)
```

**Parameters:**
- `size` (Vector2, optional): Width and height of the box (defaults to 1x1)

**Example:**
```typescript
// Default 1x1 box
const collider = new BoxCollider2D();

// Custom size box
const collider = new BoxCollider2D(new Vector2(64, 32));
```

## Properties

### Size Configuration

#### `size: Vector2`
Local size of the box (width and height) before scaling.

**Example:**
```typescript
// Set size
collider.size = new Vector2(100, 50);

// Access individual dimensions
const width = collider.size.x;
const height = collider.size.y;
```

## Methods

### Size Management

#### `setSize(width: number, height: number): void`
Sets the box dimensions and invalidates bounds cache.

#### `getSize(): Vector2`
Gets a copy of the local size.

#### `getWorldSize(): Vector2`
Gets the size after applying world scale.

**Example:**
```typescript
// Set size
collider.setSize(80, 40);

// Get local size
const localSize = collider.getSize();

// Get world size (includes scale)
const worldSize = collider.getWorldSize();
console.log('Local:', localSize, 'World:', worldSize);
```

### Collision Detection (Inherited)

#### `containsPoint(point: Vector2): boolean`
Tests if a world point is inside the box (supports rotation).

#### `getClosestPoint(point: Vector2): Vector2`
Returns the closest point on the box surface to a given point.

#### `overlaps(other: Collider2D): boolean`
Tests collision with another collider (box or circle).

**Example:**
```typescript
// Point testing
const mousePos = Input.getMousePosition();
const worldMouse = camera.screenToWorld(mousePos, renderer.size);

if (collider.containsPoint(worldMouse)) {
    console.log('Mouse is over box');
}

// Find closest point on surface
const closestPoint = collider.getClosestPoint(player.transform.position);

// Test overlap
if (playerCollider.overlaps(wallCollider)) {
    console.log('Player hit wall');
}
```

### Geometric Queries

#### `getCorners(): Vector2[]`
Returns the four corners of the box in world space (includes rotation).

**Example:**
```typescript
// Get box corners
const corners = collider.getCorners();
const [bottomLeft, bottomRight, topRight, topLeft] = corners;

// Draw box outline
for (let i = 0; i < corners.length; i++) {
    const next = corners[(i + 1) % corners.length];
    renderer.drawLine(corners[i], next, '#00FF00');
}
```

### Raycast Support

#### `raycast(origin: Vector2, direction: Vector2, distance: number): RaycastHit2D | null`
Tests ray intersection with the box.

**Example:**
```typescript
// Raycast from player to target
const origin = player.transform.position;
const target = enemy.transform.position;
const direction = target.subtract(origin).normalized();
const distance = origin.distance(target);

const hit = wallCollider.raycast(origin, direction, distance);
if (hit) {
    console.log('Wall blocks line of sight');
    console.log('Hit point:', hit.point);
    console.log('Surface normal:', hit.normal);
}
```

## Collision Behavior

### Box vs Box Collision
Uses Separating Axis Theorem (SAT) for precise collision detection:
- Supports arbitrary rotation
- Finds minimum separation distance
- Provides contact normals for physics response

### Box vs Circle Collision
Specialized algorithm for box-circle intersection:
- Finds closest point on box to circle center
- Handles edge and corner cases correctly
- Optimized for performance

## Usage Examples

### Platform Collider
```typescript
class Platform extends Component {
    private collider: BoxCollider2D;
    
    start(): void {
        this.collider = this.addComponent(BoxCollider2D);
        this.collider.setSize(200, 20); // Wide, thin platform
        this.collider.setLayer(LayerManager.GROUND);
        
        // Platform-specific material
        this.collider.material = new PhysicsMaterial2D(0.8, 0.0, 1.0); // High friction, no bounce
    }
}
```

### Character Controller Collider
```typescript
class CharacterController extends Component {
    private collider: BoxCollider2D;
    private characterHeight: number = 64;
    private characterWidth: number = 32;
    
    start(): void {
        this.collider = this.addComponent(BoxCollider2D);
        this.collider.setSize(this.characterWidth, this.characterHeight);
        this.collider.setLayer(LayerManager.PLAYER);
        
        // Center collider at character feet
        this.collider.offset = new Vector2(0, this.characterHeight / 2);
        
        // No rotation for character
        const rigidbody = this.addComponent(Rigidbody2D);
        rigidbody.freezeRotation = true;
    }
}
```

### Rotated Box Obstacle
```typescript
class RotatedObstacle extends Component {
    private collider: BoxCollider2D;
    private rotationSpeed: number = Math.PI / 4; // 45 degrees per second
    
    start(): void {
        this.collider = this.addComponent(BoxCollider2D);
        this.collider.setSize(50, 100); // Tall, narrow box
        this.collider.setLayer(LayerManager.OBSTACLE);
    }
    
    update(): void {
        // Continuously rotate
        this.transform.rotation += this.rotationSpeed * Time.deltaTime;
        
        // Bounds automatically update for rotation
        const bounds = this.collider.bounds;
        console.log('Rotated bounds size:', bounds.size);
    }
}
```

### Trigger Zone
```typescript
class RectangularTrigger extends Component {
    private collider: BoxCollider2D;
    private objectsInside: Set<GameObject> = new Set();
    
    start(): void {
        this.collider = this.addComponent(BoxCollider2D);
        this.collider.setSize(100, 150); // Rectangular trigger area
        this.collider.isTrigger = true;
        this.collider.setLayer(LayerManager.TRIGGER);
        
        this.scene.on('triggerEnter2D', this.onTriggerEnter.bind(this));
        this.scene.on('triggerExit2D', this.onTriggerExit.bind(this));
    }
    
    private onTriggerEnter(event: any): void {
        if (event.trigger === this.collider) {
            this.objectsInside.add(event.otherGameObject);
            console.log(`Object entered trigger: ${event.otherGameObject.name}`);
        }
    }
    
    private onTriggerExit(event: any): void {
        if (event.trigger === this.collider) {
            this.objectsInside.delete(event.otherGameObject);
            console.log(`Object left trigger: ${event.otherGameObject.name}`);
        }
    }
    
    public getObjectsInside(): GameObject[] {
        return Array.from(this.objectsInside);
    }
}
```

### Line of Sight Checker
```typescript
class LineOfSightChecker extends Component {
    private visionCollider: BoxCollider2D;
    public sightRange: number = 200;
    public sightWidth: number = 100;
    
    start(): void {
        this.visionCollider = this.addComponent(BoxCollider2D);
        this.visionCollider.setSize(this.sightRange, this.sightWidth);
        this.visionCollider.isTrigger = true;
        this.visionCollider.setLayer(LayerManager.VISION);
        
        // Position collider in front of object
        this.visionCollider.offset = new Vector2(this.sightRange / 2, 0);
    }
    
    public canSeeTarget(target: Vector2): boolean {
        // Check if target is in vision box
        if (!this.visionCollider.containsPoint(target)) {
            return false;
        }
        
        // Raycast to check for obstacles
        const origin = this.transform.worldPosition;
        const direction = target.subtract(origin).normalized();
        const distance = origin.distance(target);
        
        // This would use physics world raycast with obstacle layer
        return this.isLineOfSightClear(origin, direction, distance);
    }
    
    private isLineOfSightClear(origin: Vector2, direction: Vector2, distance: number): boolean {
        // Implementation would use Physics2DWorld.raycast
        return true; // Placeholder
    }
}
```

### Breakable Wall
```typescript
class BreakableWall extends Component {
    private collider: BoxCollider2D;
    private hitPoints: number = 100;
    private pieces: Vector2[] = [];
    
    start(): void {
        this.collider = this.addComponent(BoxCollider2D);
        this.collider.setSize(60, 60);
        this.collider.setLayer(LayerManager.DESTRUCTIBLE);
        
        // Pre-calculate break pieces
        this.calculateBreakPieces();
        
        this.scene.on('collisionEnter2D', this.onCollisionEnter.bind(this));
    }
    
    private onCollisionEnter(event: any): void {
        if (event.collision.collider === this.collider) {
            const projectile = event.collision.otherCollider.getComponent(Projectile);
            if (projectile) {
                this.takeDamage(projectile.damage);
            }
        }
    }
    
    private takeDamage(damage: number): void {
        this.hitPoints -= damage;
        
        if (this.hitPoints <= 0) {
            this.breakWall();
        }
    }
    
    private calculateBreakPieces(): void {
        const corners = this.collider.getCorners();
        const center = this.collider.worldPosition;
        
        // Create pieces from corners
        this.pieces = corners;
        this.pieces.push(center); // Center piece
    }
    
    private breakWall(): void {
        // Create physics pieces
        this.pieces.forEach((piecePos, index) => {
            const piece = new GameObject(`WallPiece_${index}`);
            piece.transform.position = piecePos;
            
            const pieceCollider = piece.addComponent(BoxCollider2D);
            pieceCollider.setSize(10, 10); // Small pieces
            
            const pieceRigidbody = piece.addComponent(Rigidbody2D);
            pieceRigidbody.mass = 0.5;
            
            // Add random impulse
            const randomDirection = Vector2.fromAngle(Math.random() * Math.PI * 2);
            const randomForce = randomDirection.multiply(100 + Math.random() * 200);
            pieceRigidbody.addForce(randomForce, ForceMode.Impulse);
            
            this.scene.addGameObject(piece);
        });
        
        // Remove original wall
        this.gameObject.destroy();
    }
}
```

### Moving Platform with Precise Collision
```typescript
class MovingPlatform extends Component {
    private collider: BoxCollider2D;
    private rigidbody: Rigidbody2D;
    private waypoints: Vector2[] = [];
    private currentWaypoint: number = 0;
    private speed: number = 50;
    private passengers: Set<Rigidbody2D> = new Set();
    
    start(): void {
        this.collider = this.addComponent(BoxCollider2D);
        this.collider.setSize(120, 20);
        this.collider.setLayer(LayerManager.PLATFORM);
        
        this.rigidbody = this.addComponent(Rigidbody2D);
        this.rigidbody.bodyType = BodyType.Kinematic; // Moves but not affected by forces
        this.rigidbody.freezeRotation = true;
        
        // Set up waypoints
        this.waypoints = [
            new Vector2(100, 300),
            new Vector2(300, 300),
            new Vector2(300, 100),
            new Vector2(100, 100)
        ];
        
        this.scene.on('collisionEnter2D', this.onCollisionEnter.bind(this));
        this.scene.on('collisionExit2D', this.onCollisionExit.bind(this));
    }
    
    private onCollisionEnter(event: any): void {
        if (event.collision.collider === this.collider) {
            const otherRigidbody = event.collision.otherCollider.getComponent(Rigidbody2D);
            if (otherRigidbody && this.isOnTop(event.collision)) {
                this.passengers.add(otherRigidbody);
            }
        }
    }
    
    private onCollisionExit(event: any): void {
        if (event.collision.collider === this.collider) {
            const otherRigidbody = event.collision.otherCollider.getComponent(Rigidbody2D);
            if (otherRigidbody) {
                this.passengers.delete(otherRigidbody);
            }
        }
    }
    
    private isOnTop(collision: Collision2D): boolean {
        // Check if collision normal points upward (passenger is on top)
        const contact = collision.contacts[0];
        return contact && contact.normal.y < -0.5; // Normal points up
    }
    
    update(): void {
        const target = this.waypoints[this.currentWaypoint];
        const current = this.transform.position;
        const direction = target.subtract(current);
        
        if (direction.magnitude() < 5) {
            this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
        } else {
            const velocity = direction.normalized().multiply(this.speed);
            this.rigidbody.setVelocity(velocity);
            
            // Move passengers with platform
            this.movePassengers(velocity);
        }
    }
    
    private movePassengers(platformVelocity: Vector2): void {
        this.passengers.forEach(passenger => {
            if (passenger.bodyType === BodyType.Dynamic) {
                // Add platform velocity to passenger
                const passengerVel = passenger.velocity;
                passenger.setVelocity(passengerVel.add(platformVelocity.multiply(Time.deltaTime)));
            }
        });
    }
}
```

### Area Detection with Corner Queries
```typescript
class AreaDetector extends Component {
    private collider: BoxCollider2D;
    
    start(): void {
        this.collider = this.addComponent(BoxCollider2D);
        this.collider.setSize(80, 80);
        this.collider.isTrigger = true;
    }
    
    update(): void {
        // Check if all corners are in water (example)
        const corners = this.collider.getCorners();
        const allInWater = corners.every(corner => this.isPointInWater(corner));
        
        if (allInWater) {
            console.log('Completely submerged');
        } else {
            const partiallyInWater = corners.some(corner => this.isPointInWater(corner));
            if (partiallyInWater) {
                console.log('Partially submerged');
            }
        }
    }
    
    private isPointInWater(point: Vector2): boolean {
        // Check if point is below water level
        return point.y > 400; // Water at y=400
    }
    
    public getSubmergedArea(): number {
        const corners = this.collider.getCorners();
        const waterLevel = 400;
        
        // Calculate submerged area using polygon clipping
        // Simplified version - just check how many corners are underwater
        const submergedCorners = corners.filter(corner => corner.y > waterLevel).length;
        const totalArea = this.collider.getWorldSize().x * this.collider.getWorldSize().y;
        
        return (submergedCorners / 4) * totalArea;
    }
}
```

## Advanced Collision Scenarios

### Multi-Box Compound Collider
```typescript
class CompoundBoxCollider extends Component {
    private colliders: BoxCollider2D[] = [];
    
    start(): void {
        // Create L-shaped collider from multiple boxes
        this.createBox(new Vector2(0, 0), new Vector2(60, 20));   // Horizontal part
        this.createBox(new Vector2(-20, -30), new Vector2(20, 40)); // Vertical part
    }
    
    private createBox(offset: Vector2, size: Vector2): BoxCollider2D {
        const box = this.addComponent(BoxCollider2D);
        box.setSize(size.x, size.y);
        box.offset = offset;
        box.setLayer(LayerManager.OBSTACLE);
        this.colliders.push(box);
        return box;
    }
    
    public testPointInAnyBox(point: Vector2): boolean {
        return this.colliders.some(box => box.containsPoint(point));
    }
}
```

### Rotated Box Ray Intersection
```typescript
class LaserBeam extends Component {
    private origin: Vector2;
    private direction: Vector2;
    private maxDistance: number = 500;
    
    public fireAt(target: Vector2): void {
        this.origin = this.transform.worldPosition;
        this.direction = target.subtract(this.origin).normalized();
        
        // Test against all box colliders in scene
        const allBoxes = this.scene.findAllComponents(BoxCollider2D);
        let closestHit: RaycastHit2D | null = null;
        
        allBoxes.forEach(box => {
            const hit = box.raycast(this.origin, this.direction, this.maxDistance);
            if (hit && (!closestHit || hit.distance < closestHit.distance)) {
                closestHit = hit;
            }
        });
        
        if (closestHit) {
            console.log('Laser hit box at:', closestHit.point);
            this.createImpactEffect(closestHit.point);
        }
    }
    
    private createImpactEffect(position: Vector2): void {
        // Create particle effect, spark, etc.
    }
}
```

## Performance Considerations

- Box collision detection is more expensive than circle collision
- Rotated box collision is more expensive than axis-aligned boxes
- Bounds checking provides early rejection for most non-colliding cases
- Corner calculation is cached when transform doesn't change
- Use axis-aligned boxes when possible for better performance

## Common Errors

### ❌ Forgetting to Invalidate Bounds
```typescript
// WRONG - Bounds won't update
collider.size.x = 100; // Direct modification

// CORRECT - Use setter method
collider.setSize(100, collider.size.y);
```

### ❌ Assuming Local vs World Size
```typescript
// WRONG - Not accounting for scale
const size = collider.size; // Local size only

// CORRECT - Use world size when needed
const worldSize = collider.getWorldSize(); // Includes scale
```

### ❌ Incorrect Offset Usage
```typescript
// WRONG - Offset from center, not bottom
collider.offset = new Vector2(0, 0); // Box center at transform

// CORRECT - For character at feet
collider.offset = new Vector2(0, collider.size.y / 2); // Box bottom at transform
```

### ❌ Rotation Performance Issues
```typescript
// WRONG - Unnecessary rotation checks every frame
update() {
    const corners = collider.getCorners(); // Expensive if rotating
}

// BETTER - Cache or check if rotation changed
private lastRotation = 0;
private cachedCorners: Vector2[];

update() {
    if (this.transform.rotation !== this.lastRotation) {
        this.cachedCorners = collider.getCorners();
        this.lastRotation = this.transform.rotation;
    }
}
```

## Integration Points

- **Collider2D**: Inherits collision detection framework
- **Rigidbody2D**: Provides physics simulation for dynamic boxes
- **Transform**: Position, rotation, and scale affect collision shape
- **Physics2DWorld**: Manages broad-phase and narrow-phase collision
- **CollisionDetection2D**: Provides box-specific collision algorithms