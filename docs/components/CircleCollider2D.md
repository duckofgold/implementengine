# CircleCollider2D Component Documentation

## Overview
The `CircleCollider2D` component provides circular collision detection. It extends Collider2D to implement circle-specific collision algorithms and handles collision with other circle and box colliders. Perfect for balls, wheels, circular projectiles, and rounded objects.

## Class Declaration
```typescript
export class CircleCollider2D extends Collider2D
```

## Constructor
```typescript
constructor(radius?: number)
```

**Parameters:**
- `radius` (number, optional): Radius of the circle (defaults to 0.5)

**Example:**
```typescript
// Default radius 0.5
const collider = new CircleCollider2D();

// Custom radius
const collider = new CircleCollider2D(25);
```

## Properties

### Size Configuration

#### `radius: number`
Local radius of the circle before scaling.

**Example:**
```typescript
// Set radius
collider.radius = 32;

// Get radius
const localRadius = collider.radius;
```

## Methods

### Radius Management

#### `setRadius(radius: number): void`
Sets the circle radius and invalidates bounds cache (minimum 0).

#### `getRadius(): number`
Gets the local radius.

#### `getWorldRadius(): number`
Gets the radius after applying world scale (uses maximum of x/y scale).

**Example:**
```typescript
// Set radius
collider.setRadius(50);

// Get local radius
const localRadius = collider.getRadius();

// Get world radius (includes scale)
const worldRadius = collider.getWorldRadius();
console.log('Local:', localRadius, 'World:', worldRadius);
```

### Collision Detection (Inherited)

#### `containsPoint(point: Vector2): boolean`
Tests if a world point is inside the circle.

#### `getClosestPoint(point: Vector2): Vector2`
Returns the closest point on the circle surface to a given point.

#### `overlaps(other: Collider2D): boolean`
Tests collision with another collider (circle or box).

**Example:**
```typescript
// Point testing
const mousePos = Input.getMousePosition();
const worldMouse = camera.screenToWorld(mousePos, renderer.size);

if (collider.containsPoint(worldMouse)) {
    console.log('Mouse is over circle');
}

// Find closest point on surface
const closestPoint = collider.getClosestPoint(target.transform.position);

// Test overlap
if (ballCollider.overlaps(wallCollider)) {
    console.log('Ball hit wall');
}
```

### Geometric Queries

#### `getCircumferencePoint(angle: number): Vector2`
Returns a point on the circle's circumference at the specified angle (radians).

#### `getCircumferencePoints(segments: number = 16): Vector2[]`
Returns an array of points around the circle's circumference.

#### `getArea(): number`
Calculates the circle's area (π × r²).

#### `getCircumference(): number`
Calculates the circle's circumference (2π × r).

**Example:**
```typescript
// Get point at specific angle
const topPoint = collider.getCircumferencePoint(Math.PI / 2); // Top of circle
const rightPoint = collider.getCircumferencePoint(0); // Right of circle

// Get multiple points for drawing
const points = collider.getCircumferencePoints(32); // 32 segments

// Calculate properties
const area = collider.getArea();
const circumference = collider.getCircumference();
console.log(`Area: ${area}, Circumference: ${circumference}`);
```

### Raycast Support

#### `raycast(origin: Vector2, direction: Vector2, distance: number): RaycastHit2D | null`
Tests ray intersection with the circle using analytical ray-sphere intersection.

**Example:**
```typescript
// Raycast from player to target
const origin = player.transform.position;
const target = enemy.transform.position;
const direction = target.subtract(origin).normalized();
const distance = origin.distance(target);

const hit = ballCollider.raycast(origin, direction, distance);
if (hit) {
    console.log('Ball blocks line of sight');
    console.log('Hit point:', hit.point);
    console.log('Surface normal:', hit.normal);
}
```

## Collision Behavior

### Circle vs Circle Collision
Uses distance-based collision detection:
- Highly optimized using distance squared comparisons
- Provides exact contact points and penetration depth
- Perfect for bouncing balls and circular physics

### Circle vs Box Collision
Specialized algorithm for circle-box intersection:
- Finds closest point on box to circle center
- Handles edge, corner, and face collisions correctly
- Supports rotated boxes

## Usage Examples

### Bouncing Ball
```typescript
class BouncingBall extends Component {
    private collider: CircleCollider2D;
    private rigidbody: Rigidbody2D;
    private bounciness: number = 0.8;
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.setRadius(15);
        this.collider.setLayer(LayerManager.BALL);
        
        this.rigidbody = this.addComponent(Rigidbody2D);
        this.rigidbody.mass = 1;
        this.rigidbody.drag = 0.1;
        
        // Bouncy material
        this.collider.material = new PhysicsMaterial2D(0.2, this.bounciness, 1.0);
        
        this.scene.on('collisionEnter2D', this.onCollisionEnter.bind(this));
    }
    
    private onCollisionEnter(event: any): void {
        if (event.collision.collider === this.collider) {
            // Play bounce sound based on impact velocity
            const impactSpeed = event.collision.relativeVelocity.magnitude();
            if (impactSpeed > 50) {
                this.playBounceSound(impactSpeed / 100);
            }
        }
    }
    
    private playBounceSound(volume: number): void {
        // Play bounce sound with volume based on impact
    }
}
```

### Collectible Coin
```typescript
class Coin extends Component {
    private collider: CircleCollider2D;
    private rotationSpeed: number = 5; // radians per second
    private bobSpeed: number = 2;
    private bobAmount: number = 10;
    private startY: number;
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.setRadius(12);
        this.collider.isTrigger = true;
        this.collider.setLayer(LayerManager.PICKUP);
        
        this.startY = this.transform.position.y;
        
        this.scene.on('triggerEnter2D', this.onTriggerEnter.bind(this));
    }
    
    update(): void {
        // Rotate continuously
        this.transform.rotation += this.rotationSpeed * Time.deltaTime;
        
        // Bob up and down
        const bobOffset = Math.sin(Time.time * this.bobSpeed) * this.bobAmount;
        const currentPos = this.transform.position;
        this.transform.position = new Vector2(currentPos.x, this.startY + bobOffset);
    }
    
    private onTriggerEnter(event: any): void {
        if (event.trigger === this.collider) {
            const player = event.otherGameObject.getComponent(PlayerController);
            if (player) {
                this.collectCoin(player);
            }
        }
    }
    
    private collectCoin(player: PlayerController): void {
        // Add to score/inventory
        const score = player.getComponent(Score);
        if (score) {
            score.addPoints(100);
        }
        
        // Play collection effect
        this.playCollectionEffect();
        
        // Destroy coin
        this.gameObject.destroy();
    }
    
    private playCollectionEffect(): void {
        // Spawn particles, play sound, etc.
    }
}
```

### Circular Force Field
```typescript
class ForceField extends Component {
    private collider: CircleCollider2D;
    private fieldStrength: number = 500;
    private fieldType: 'attract' | 'repel' = 'attract';
    private affectedObjects: Set<Rigidbody2D> = new Set();
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.setRadius(100);
        this.collider.isTrigger = true;
        this.collider.setLayer(LayerManager.FORCE_FIELD);
        
        this.scene.on('triggerEnter2D', this.onTriggerEnter.bind(this));
        this.scene.on('triggerExit2D', this.onTriggerExit.bind(this));
    }
    
    update(): void {
        // Apply force to all objects in field
        this.affectedObjects.forEach(rb => {
            this.applyForce(rb);
        });
    }
    
    private onTriggerEnter(event: any): void {
        if (event.trigger === this.collider) {
            const rigidbody = event.otherGameObject.getComponent(Rigidbody2D);
            if (rigidbody) {
                this.affectedObjects.add(rigidbody);
            }
        }
    }
    
    private onTriggerExit(event: any): void {
        if (event.trigger === this.collider) {
            const rigidbody = event.otherGameObject.getComponent(Rigidbody2D);
            if (rigidbody) {
                this.affectedObjects.delete(rigidbody);
            }
        }
    }
    
    private applyForce(rigidbody: Rigidbody2D): void {
        if (!rigidbody.transform) return;
        
        const center = this.transform.worldPosition;
        const objectPos = rigidbody.transform.worldPosition;
        const direction = center.subtract(objectPos);
        const distance = direction.magnitude();
        
        if (distance > 0) {
            // Force decreases with distance (inverse square law)
            const forceMagnitude = this.fieldStrength / (distance * distance);
            let forceDirection = direction.normalized();
            
            if (this.fieldType === 'repel') {
                forceDirection = forceDirection.multiply(-1);
            }
            
            const force = forceDirection.multiply(forceMagnitude);
            rigidbody.addForce(force, ForceMode.Force);
        }
    }
}
```

### Circular Detector/Sensor
```typescript
class ProximityDetector extends Component {
    private collider: CircleCollider2D;
    private detectionRadius: number = 75;
    private targetTags: string[] = ['Enemy', 'Player'];
    private detectedObjects: Map<GameObject, number> = new Map();
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.setRadius(this.detectionRadius);
        this.collider.isTrigger = true;
        this.collider.setLayer(LayerManager.SENSOR);
        
        this.scene.on('triggerEnter2D', this.onTriggerEnter.bind(this));
        this.scene.on('triggerExit2D', this.onTriggerExit.bind(this));
    }
    
    update(): void {
        // Update detection times
        const currentTime = Time.time;
        this.detectedObjects.forEach((detectionTime, obj) => {
            const timeDetected = currentTime - detectionTime;
            
            // Trigger alert if object stays too long
            if (timeDetected > 3.0) {
                this.triggerAlert(obj);
            }
        });
    }
    
    private onTriggerEnter(event: any): void {
        if (event.trigger === this.collider) {
            const gameObject = event.otherGameObject;
            
            if (this.isTargetObject(gameObject)) {
                this.detectedObjects.set(gameObject, Time.time);
                console.log(`Detected: ${gameObject.name}`);
            }
        }
    }
    
    private onTriggerExit(event: any): void {
        if (event.trigger === this.collider) {
            const gameObject = event.otherGameObject;
            
            if (this.detectedObjects.has(gameObject)) {
                this.detectedObjects.delete(gameObject);
                console.log(`Lost detection: ${gameObject.name}`);
            }
        }
    }
    
    private isTargetObject(gameObject: GameObject): boolean {
        return this.targetTags.some(tag => gameObject.hasTag(tag));
    }
    
    private triggerAlert(object: GameObject): void {
        console.log(`ALERT: ${object.name} detected for extended period!`);
    }
    
    public getDetectedObjects(): GameObject[] {
        return Array.from(this.detectedObjects.keys());
    }
    
    public getClosestDetectedObject(): GameObject | null {
        let closest: GameObject | null = null;
        let closestDistance = Infinity;
        
        this.detectedObjects.forEach((_, obj) => {
            const distance = obj.transform.worldPosition.distance(this.transform.worldPosition);
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = obj;
            }
        });
        
        return closest;
    }
}
```

### Wheel Physics
```typescript
class Wheel extends Component {
    private collider: CircleCollider2D;
    private rigidbody: Rigidbody2D;
    private radius: number = 20;
    private motorTorque: number = 0;
    private brakeTorque: number = 0;
    private suspensionForce: number = 1000;
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.setRadius(this.radius);
        this.collider.setLayer(LayerManager.WHEEL);
        
        this.rigidbody = this.addComponent(Rigidbody2D);
        this.rigidbody.mass = 5;
        
        // High friction for grip
        this.collider.material = new PhysicsMaterial2D(1.5, 0.1, 1.0);
        
        this.scene.on('collisionEnter2D', this.onGroundContact.bind(this));
    }
    
    update(): void {
        this.handleInput();
        this.applyMotorForce();
        this.applyBraking();
        this.simulateSuspension();
    }
    
    private handleInput(): void {
        this.motorTorque = 0;
        this.brakeTorque = 0;
        
        if (Input.getKey('w')) {
            this.motorTorque = 500;
        }
        if (Input.getKey('s')) {
            this.motorTorque = -300; // Reverse is weaker
        }
        if (Input.getKey(' ')) {
            this.brakeTorque = 1000;
        }
    }
    
    private applyMotorForce(): void {
        if (this.motorTorque !== 0) {
            // Convert torque to linear force based on wheel radius
            const force = this.motorTorque / this.radius;
            const forward = Vector2.fromAngle(this.transform.worldRotation);
            
            this.rigidbody.addForce(forward.multiply(force), ForceMode.Force);
            
            // Add rotational component
            this.rigidbody.addTorque(this.motorTorque * 0.1, ForceMode.Force);
        }
    }
    
    private applyBraking(): void {
        if (this.brakeTorque > 0) {
            // Brake by applying force opposite to velocity
            const velocity = this.rigidbody.velocity;
            if (velocity.magnitude() > 0) {
                const brakeForce = velocity.normalized().multiply(-this.brakeTorque);
                this.rigidbody.addForce(brakeForce, ForceMode.Force);
            }
            
            // Brake rotation
            const angularVel = this.rigidbody.angularVelocity;
            this.rigidbody.addTorque(-angularVel * this.brakeTorque * 0.1, ForceMode.Force);
        }
    }
    
    private simulateSuspension(): void {
        // Simple suspension - push away from ground
        const groundHit = this.checkGround();
        if (groundHit) {
            const suspensionForce = Vector2.up.multiply(this.suspensionForce);
            this.rigidbody.addForce(suspensionForce, ForceMode.Force);
        }
    }
    
    private checkGround(): boolean {
        // Raycast downward to check for ground
        const origin = this.transform.worldPosition;
        const direction = Vector2.down;
        const distance = this.radius + 5; // Slightly below wheel
        
        // This would use physics world raycast
        return false; // Placeholder
    }
    
    private onGroundContact(event: any): void {
        if (event.collision.collider === this.collider) {
            // Handle wheel-ground interaction
            const groundTag = event.collision.otherCollider.gameObject.getTag();
            if (groundTag === 'Ground') {
                // Different friction for different surfaces
                this.adjustFrictionForSurface(groundTag);
            }
        }
    }
    
    private adjustFrictionForSurface(surfaceType: string): void {
        switch (surfaceType) {
            case 'Ice':
                this.collider.material.friction = 0.1;
                break;
            case 'Mud':
                this.collider.material.friction = 0.8;
                break;
            default: // Normal ground
                this.collider.material.friction = 1.5;
                break;
        }
    }
}
```

### Circular Area Effect
```typescript
class ExplosionBlast extends Component {
    private collider: CircleCollider2D;
    private maxRadius: number = 100;
    private expansionSpeed: number = 200; // pixels per second
    private damage: number = 50;
    private force: number = 1000;
    private damagedObjects: Set<GameObject> = new Set();
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.setRadius(1); // Start small
        this.collider.isTrigger = true;
        this.collider.setLayer(LayerManager.EXPLOSION);
        
        this.scene.on('triggerEnter2D', this.onTriggerEnter.bind(this));
    }
    
    update(): void {
        // Expand explosion radius
        const currentRadius = this.collider.getRadius();
        const newRadius = currentRadius + this.expansionSpeed * Time.deltaTime;
        
        this.collider.setRadius(newRadius);
        
        // Remove explosion when max radius reached
        if (newRadius >= this.maxRadius) {
            this.gameObject.destroy();
        }
    }
    
    private onTriggerEnter(event: any): void {
        if (event.trigger === this.collider) {
            const target = event.otherGameObject;
            
            // Only damage each object once
            if (!this.damagedObjects.has(target)) {
                this.damagedObjects.add(target);
                this.applyExplosionEffect(target);
            }
        }
    }
    
    private applyExplosionEffect(target: GameObject): void {
        const center = this.transform.worldPosition;
        const targetPos = target.transform.worldPosition;
        const distance = center.distance(targetPos);
        
        // Calculate falloff based on distance
        const falloff = 1 - (distance / this.maxRadius);
        const effectiveForce = this.force * falloff;
        const effectiveDamage = this.damage * falloff;
        
        // Apply damage
        const health = target.getComponent(Health);
        if (health) {
            health.takeDamage(effectiveDamage);
        }
        
        // Apply knockback force
        const rigidbody = target.getComponent(Rigidbody2D);
        if (rigidbody) {
            const direction = targetPos.subtract(center).normalized();
            const knockback = direction.multiply(effectiveForce);
            rigidbody.addForce(knockback, ForceMode.Impulse);
        }
    }
}
```

### Circular Path Following
```typescript
class CircularPathFollower extends Component {
    private collider: CircleCollider2D;
    private pathCenter: Vector2;
    private pathRadius: number = 150;
    private speed: number = 100; // pixels per second
    private currentAngle: number = 0;
    private clockwise: boolean = true;
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.setRadius(10);
        this.collider.setLayer(LayerManager.ENEMY);
        
        // Set initial path center
        this.pathCenter = this.transform.worldPosition.clone();
    }
    
    update(): void {
        // Calculate angular speed
        const circumference = 2 * Math.PI * this.pathRadius;
        const angularSpeed = (this.speed / circumference) * 2 * Math.PI;
        
        // Update angle
        if (this.clockwise) {
            this.currentAngle += angularSpeed * Time.deltaTime;
        } else {
            this.currentAngle -= angularSpeed * Time.deltaTime;
        }
        
        // Calculate new position
        const x = this.pathCenter.x + Math.cos(this.currentAngle) * this.pathRadius;
        const y = this.pathCenter.y + Math.sin(this.currentAngle) * this.pathRadius;
        
        this.transform.position = new Vector2(x, y);
        
        // Face movement direction
        const tangentAngle = this.currentAngle + (this.clockwise ? Math.PI / 2 : -Math.PI / 2);
        this.transform.rotation = tangentAngle;
    }
    
    public setPath(center: Vector2, radius: number): void {
        this.pathCenter = center;
        this.pathRadius = radius;
        
        // Calculate starting angle based on current position
        const delta = this.transform.worldPosition.subtract(center);
        this.currentAngle = Math.atan2(delta.y, delta.x);
    }
    
    public reverseDirection(): void {
        this.clockwise = !this.clockwise;
    }
}
```

### Circle-Based Particle System
```typescript
class CircleParticle extends Component {
    private collider: CircleCollider2D;
    private velocity: Vector2;
    private lifetime: number;
    private maxLifetime: number;
    private startRadius: number;
    private endRadius: number;
    
    constructor(velocity: Vector2, lifetime: number) {
        super();
        this.velocity = velocity;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.startRadius = 2 + Math.random() * 8;
        this.endRadius = this.startRadius * 0.1;
    }
    
    start(): void {
        this.collider = this.addComponent(CircleCollider2D);
        this.collider.setRadius(this.startRadius);
        this.collider.isTrigger = true;
        this.collider.setLayer(LayerManager.PARTICLE);
    }
    
    update(): void {
        // Move particle
        const movement = this.velocity.multiply(Time.deltaTime);
        this.transform.translate(movement);
        
        // Apply gravity
        this.velocity = this.velocity.add(new Vector2(0, 100).multiply(Time.deltaTime));
        
        // Shrink over time
        const lifePercent = this.lifetime / this.maxLifetime;
        const currentRadius = this.startRadius * lifePercent + this.endRadius * (1 - lifePercent);
        this.collider.setRadius(currentRadius);
        
        // Update lifetime
        this.lifetime -= Time.deltaTime;
        
        if (this.lifetime <= 0) {
            this.gameObject.destroy();
        }
    }
}

class CircleParticleSystem extends Component {
    public emitPosition: Vector2 = Vector2.zero;
    public emitRate: number = 10; // particles per second
    public minVelocity: Vector2 = new Vector2(-50, -100);
    public maxVelocity: Vector2 = new Vector2(50, -200);
    public particleLifetime: number = 2.0;
    
    private emitTimer: number = 0;
    
    update(): void {
        this.emitTimer += Time.deltaTime;
        
        const emitInterval = 1.0 / this.emitRate;
        while (this.emitTimer >= emitInterval) {
            this.emitTimer -= emitInterval;
            this.emitParticle();
        }
    }
    
    private emitParticle(): void {
        const particle = new GameObject('Particle');
        particle.transform.position = this.transform.worldPosition.add(this.emitPosition);
        
        // Random velocity
        const velocity = new Vector2(
            this.minVelocity.x + Math.random() * (this.maxVelocity.x - this.minVelocity.x),
            this.minVelocity.y + Math.random() * (this.maxVelocity.y - this.minVelocity.y)
        );
        
        const particleComponent = particle.addComponent(CircleParticle, velocity, this.particleLifetime);
        this.scene.addGameObject(particle);
    }
}
```

## Performance Considerations

- Circle collision detection is highly optimized (distance-based)
- Uses maximum of x/y scale for uniform scaling behavior
- Point-in-circle tests use distance squared to avoid square root
- Circumference point calculation is more expensive for many segments
- Area and circumference calculations are lightweight

## Common Errors

### ❌ Negative Radius
```typescript
// WRONG - Negative radius
collider.radius = -10; // Will be clamped to 0

// CORRECT - Use positive radius
collider.setRadius(10);
```

### ❌ Non-Uniform Scaling Issues
```typescript
// WRONG - Non-uniform scaling can distort circles
transform.scale = new Vector2(2, 1); // Creates ellipse, not circle

// CORRECT - Use uniform scaling for true circles
transform.scale = new Vector2(2, 2);
```

### ❌ Forgetting World Radius vs Local Radius
```typescript
// WRONG - Using local radius for world calculations
const area = Math.PI * collider.radius * collider.radius; // Ignores scale

// CORRECT - Use world radius
const worldRadius = collider.getWorldRadius();
const area = Math.PI * worldRadius * worldRadius;
```

### ❌ Performance Issues with Circumference Points
```typescript
// WRONG - Calculating too many points every frame
update() {
    const points = collider.getCircumferencePoints(100); // Expensive!
}

// BETTER - Cache or use fewer points
private cachedPoints: Vector2[];
start() {
    this.cachedPoints = collider.getCircumferencePoints(16);
}
```

## Integration Points

- **Collider2D**: Inherits collision detection framework
- **Rigidbody2D**: Provides physics simulation for dynamic circles
- **Transform**: Position and scale affect collision shape (rotation ignored)
- **Physics2DWorld**: Manages broad-phase and narrow-phase collision
- **CollisionDetection2D**: Provides circle-specific collision algorithms