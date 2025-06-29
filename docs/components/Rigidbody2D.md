# Rigidbody2D Component Documentation

## Overview
The `Rigidbody2D` component adds physics simulation to GameObjects. It handles forces, velocity, mass, collision response, and integrates with the Physics2DWorld system. The component supports different body types (Dynamic, Kinematic, Static) and provides comprehensive physics controls.

## Class Declaration
```typescript
export class Rigidbody2D extends Component
```

## Enums

### BodyType
```typescript
export enum BodyType {
    Dynamic = 'dynamic',     // Affected by forces and collisions
    Kinematic = 'kinematic', // Moves via transform, affects dynamic bodies
    Static = 'static'        // Never moves, provides immovable collision
}
```

### ForceMode
```typescript
export enum ForceMode {
    Force = 'force',                    // Add continuous force (mass dependent)
    Impulse = 'impulse',               // Add instant impulse (mass dependent)
    Acceleration = 'acceleration',      // Add acceleration (mass independent)
    VelocityChange = 'velocityChange'   // Add velocity directly (mass independent)
}
```

## Constructor
```typescript
constructor(bodyType: BodyType = BodyType.Dynamic, mass: number = 1)
```

**Parameters:**
- `bodyType` (BodyType, optional): Type of physics body (defaults to Dynamic)
- `mass` (number, optional): Mass of the object (defaults to 1)

## Properties

### Body Configuration

#### `bodyType: BodyType`
Type of physics body that determines interaction behavior.

#### `material: PhysicsMaterial2D`
Physics material controlling friction, bounciness, and density.

**Example:**
```typescript
// Dynamic body affected by forces
rigidbody.bodyType = BodyType.Dynamic;

// Moving platform (kinematic)
rigidbody.bodyType = BodyType.Kinematic;

// Static ground
rigidbody.bodyType = BodyType.Static;
```

### Physical Properties

#### `mass: number`
Mass of the object in physics calculations.

#### `drag: number`
Linear drag coefficient (air resistance).

#### `angularDrag: number`
Angular drag coefficient (rotational resistance).

#### `gravityScale: number`
Multiplier for gravity effect (1.0 = normal gravity, 0.0 = no gravity).

**Example:**
```typescript
// Heavy object
rigidbody.mass = 10;

// High air resistance
rigidbody.drag = 2.0;

// No rotation resistance
rigidbody.angularDrag = 0;

// Floaty object
rigidbody.gravityScale = 0.1;
```

### Constraints

#### `freezeRotation: boolean`
Prevents rotation if true.

#### `freezePositionX: boolean`
Prevents movement along X-axis if true.

#### `freezePositionY: boolean`
Prevents movement along Y-axis if true.

**Example:**
```typescript
// Platform character (no rotation)
rigidbody.freezeRotation = true;

// Vertical-only movement
rigidbody.freezePositionX = true;

// Horizontal-only movement
rigidbody.freezePositionY = true;
```

### Current Physics State

#### `velocity: Vector2`
Current linear velocity (pixels per second).

#### `angularVelocity: number`
Current angular velocity (radians per second).

**Example:**
```typescript
// Check speed
const speed = rigidbody.velocity.magnitude();

// Check if moving right
if (rigidbody.velocity.x > 0) {
    console.log('Moving right');
}

// Check rotation direction
if (rigidbody.angularVelocity > 0) {
    console.log('Rotating counterclockwise');
}
```

## Methods

### Mass and Inertia

#### `setMass(mass: number): void`
Sets the mass (minimum 0.1 to avoid division by zero).

#### `getMass(): number`
Gets effective mass (returns Infinity for static bodies).

#### `getInverseMass(): number`
Gets inverse mass for physics calculations.

#### `getInverseInertia(): number`
Gets inverse rotational inertia for physics calculations.

**Example:**
```typescript
// Set mass
rigidbody.setMass(5.0);

// Get mass (handles static bodies)
const mass = rigidbody.getMass();

// Physics calculation example
const acceleration = force.multiply(rigidbody.getInverseMass());
```

### Force Application

#### `addForce(force: Vector2, mode: ForceMode = ForceMode.Force): void`
Applies force to the center of mass.

#### `addForceAtPosition(force: Vector2, position: Vector2, mode: ForceMode = ForceMode.Force): void`
Applies force at a specific world position (creates torque).

#### `addTorque(torque: number, mode: ForceMode = ForceMode.Force): void`
Applies rotational force.

**Example:**
```typescript
// Continuous upward force (like thrust)
rigidbody.addForce(new Vector2(0, -100), ForceMode.Force);

// Instant jump impulse
rigidbody.addForce(new Vector2(0, -500), ForceMode.Impulse);

// Constant acceleration (ignores mass)
rigidbody.addForce(new Vector2(0, -10), ForceMode.Acceleration);

// Direct velocity change
rigidbody.addForce(new Vector2(10, 0), ForceMode.VelocityChange);

// Apply force at specific point (creates spin)
rigidbody.addForceAtPosition(
    new Vector2(100, 0), 
    transform.position.add(new Vector2(0, 10))
);

// Add rotational force
rigidbody.addTorque(50, ForceMode.Force);
```

### Velocity Control

#### `setVelocity(velocity: Vector2): void`
Directly sets linear velocity (only for Dynamic bodies).

#### `setAngularVelocity(angularVelocity: number): void`
Directly sets angular velocity (only for Dynamic bodies).

#### `getVelocityAtPoint(point: Vector2): Vector2`
Gets velocity at a specific world position (includes rotational velocity).

**Example:**
```typescript
// Set specific velocity
rigidbody.setVelocity(new Vector2(100, -200));

// Stop rotation
rigidbody.setAngularVelocity(0);

// Get velocity at a point on the object
const pointVelocity = rigidbody.getVelocityAtPoint(
    transform.position.add(new Vector2(10, 0))
);
```

### Movement Control

#### `movePosition(position: Vector2): void`
Moves the rigidbody to a specific position (for Dynamic/Kinematic bodies).

#### `moveRotation(rotation: number): void`
Rotates the rigidbody to a specific angle (for Dynamic/Kinematic bodies).

**Example:**
```typescript
// Teleport to position
rigidbody.movePosition(new Vector2(100, 200));

// Set specific rotation
rigidbody.moveRotation(Math.PI / 4); // 45 degrees
```

### Collision Response (Internal)

#### `applyImpulse(impulse: Vector2, contactPoint?: Vector2): void`
Applies collision impulse (called by physics system).

#### `correctPosition(correction: Vector2): void`
Corrects position to resolve penetration (called by physics system).

### Ground Detection

#### `setGrounded(grounded: boolean, normal: Vector2 = Vector2.up): void`
Sets ground contact state (called by collision system).

#### `getIsGrounded(): boolean`
Checks if the object is touching ground.

#### `getGroundNormal(): Vector2`
Gets the normal vector of the ground surface.

**Example:**
```typescript
// Check if can jump
if (rigidbody.getIsGrounded()) {
    rigidbody.addForce(new Vector2(0, -jumpForce), ForceMode.Impulse);
}

// Get ground angle
const groundAngle = rigidbody.getGroundNormal().angle();
```

### Contact Tracking

#### `addContact(): void`
Increments contact count (called by collision system).

#### `removeContact(): void`
Decrements contact count (called by collision system).

#### `getContactCount(): number`
Gets number of current collision contacts.

### Sleep Management

#### `sleep(): void`
Puts the rigidbody to sleep (stops simulation).

#### `wakeUp(): void`
Wakes up the rigidbody (resumes simulation).

#### `getIsSleeping(): boolean`
Checks if the rigidbody is sleeping.

**Example:**
```typescript
// Force wake up
rigidbody.wakeUp();

// Check if active
if (!rigidbody.getIsSleeping()) {
    // Object is active in physics simulation
}
```

### Type Checking (Read-only)

#### `isKinematic: boolean` (get)
True if body type is Kinematic.

#### `isStatic: boolean` (get)
True if body type is Static.

#### `isDynamic: boolean` (get)
True if body type is Dynamic.

## Usage Examples

### Basic Player Controller
```typescript
class PlayerController extends Component {
    private rigidbody: Rigidbody2D;
    private moveSpeed: number = 300;
    private jumpForce: number = 500;
    
    start(): void {
        this.rigidbody = this.addComponent(Rigidbody2D);
        this.rigidbody.freezeRotation = true; // Prevent spinning
        this.rigidbody.drag = 1; // Air resistance
    }
    
    update(): void {
        this.handleMovement();
        this.handleJumping();
    }
    
    private handleMovement(): void {
        let moveDirection = 0;
        
        if (Input.getKey('a') || Input.getKey('ArrowLeft')) {
            moveDirection = -1;
        }
        if (Input.getKey('d') || Input.getKey('ArrowRight')) {
            moveDirection = 1;
        }
        
        // Apply movement force
        const force = new Vector2(moveDirection * this.moveSpeed, 0);
        this.rigidbody.addForce(force, ForceMode.Force);
        
        // Limit horizontal speed
        const velocity = this.rigidbody.velocity;
        if (Math.abs(velocity.x) > this.moveSpeed) {
            const clampedX = Math.sign(velocity.x) * this.moveSpeed;
            this.rigidbody.setVelocity(new Vector2(clampedX, velocity.y));
        }
    }
    
    private handleJumping(): void {
        if (Input.getKeyDown(' ') && this.rigidbody.getIsGrounded()) {
            this.rigidbody.addForce(new Vector2(0, -this.jumpForce), ForceMode.Impulse);
        }
    }
}
```

### Moving Platform
```typescript
class MovingPlatform extends Component {
    private rigidbody: Rigidbody2D;
    private waypoints: Vector2[] = [];
    private currentWaypoint: number = 0;
    private speed: number = 100;
    
    start(): void {
        this.rigidbody = this.addComponent(Rigidbody2D);
        this.rigidbody.bodyType = BodyType.Kinematic; // Not affected by gravity/forces
        this.rigidbody.freezeRotation = true;
        
        // Set up waypoints
        this.waypoints = [
            new Vector2(100, 300),
            new Vector2(300, 300),
            new Vector2(300, 100),
            new Vector2(100, 100)
        ];
    }
    
    update(): void {
        if (this.waypoints.length === 0) return;
        
        const target = this.waypoints[this.currentWaypoint];
        const current = this.transform.position;
        const direction = target.subtract(current);
        
        if (direction.magnitude() < 5) {
            // Reached waypoint, move to next
            this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
        } else {
            // Move towards waypoint
            const velocity = direction.normalized().multiply(this.speed);
            this.rigidbody.setVelocity(velocity);
        }
    }
}
```

### Car Physics
```typescript
class CarPhysics extends Component {
    private rigidbody: Rigidbody2D;
    private engineForce: number = 1000;
    private maxSpeed: number = 500;
    private turnForce: number = 300;
    private brakeForce: number = 2000;
    
    start(): void {
        this.rigidbody = this.addComponent(Rigidbody2D);
        this.rigidbody.mass = 2; // Heavier than default
        this.rigidbody.drag = 1; // Natural deceleration
        this.rigidbody.angularDrag = 5; // Resist spinning
    }
    
    update(): void {
        this.handleAcceleration();
        this.handleSteering();
        this.handleBraking();
        this.limitSpeed();
    }
    
    private handleAcceleration(): void {
        let acceleration = 0;
        
        if (Input.getKey('w')) acceleration = 1;
        if (Input.getKey('s')) acceleration = -0.5; // Reverse is slower
        
        if (acceleration !== 0) {
            const forward = Vector2.fromAngle(this.transform.rotation);
            const force = forward.multiply(acceleration * this.engineForce);
            this.rigidbody.addForce(force, ForceMode.Force);
        }
    }
    
    private handleSteering(): void {
        let steering = 0;
        
        if (Input.getKey('a')) steering = -1;
        if (Input.getKey('d')) steering = 1;
        
        if (steering !== 0) {
            // Only steer when moving
            const speed = this.rigidbody.velocity.magnitude();
            if (speed > 10) {
                const torque = steering * this.turnForce * (speed / this.maxSpeed);
                this.rigidbody.addTorque(torque, ForceMode.Force);
            }
        }
    }
    
    private handleBraking(): void {
        if (Input.getKey(' ')) {
            const brakeDirection = this.rigidbody.velocity.normalized().multiply(-1);
            const brakeForceVector = brakeDirection.multiply(this.brakeForce);
            this.rigidbody.addForce(brakeForceVector, ForceMode.Force);
        }
    }
    
    private limitSpeed(): void {
        const velocity = this.rigidbody.velocity;
        if (velocity.magnitude() > this.maxSpeed) {
            const limitedVelocity = velocity.normalized().multiply(this.maxSpeed);
            this.rigidbody.setVelocity(limitedVelocity);
        }
    }
}
```

### Projectile Physics
```typescript
class Projectile extends Component {
    private rigidbody: Rigidbody2D;
    private lifetime: number = 5; // seconds
    private bounces: number = 3;
    private bounceDamping: number = 0.7;
    
    start(): void {
        this.rigidbody = this.addComponent(Rigidbody2D);
        this.rigidbody.mass = 0.5; // Light projectile
        this.rigidbody.drag = 0.1; // Slight air resistance
        this.rigidbody.gravityScale = 1; // Affected by gravity
        
        // Destroy after lifetime
        setTimeout(() => this.gameObject.destroy(), this.lifetime * 1000);
    }
    
    public launch(direction: Vector2, speed: number): void {
        const velocity = direction.normalized().multiply(speed);
        this.rigidbody.setVelocity(velocity);
    }
    
    onCollisionEnter(collision: CollisionInfo): void {
        if (this.bounces > 0) {
            // Bounce off surface
            const velocity = this.rigidbody.velocity;
            const normal = collision.normal;
            
            // Reflect velocity
            const reflectedVelocity = velocity.subtract(
                normal.multiply(2 * velocity.dot(normal))
            );
            
            // Apply damping
            const dampedVelocity = reflectedVelocity.multiply(this.bounceDamping);
            this.rigidbody.setVelocity(dampedVelocity);
            
            this.bounces--;
        } else {
            // No more bounces, stick to surface
            this.rigidbody.setVelocity(Vector2.zero);
            this.rigidbody.bodyType = BodyType.Static;
        }
    }
}
```

### Explosion Effect
```typescript
class ExplosionForce extends Component {
    public static explode(center: Vector2, force: number, radius: number): void {
        const physicsWorld = Physics2DWorld.getInstance();
        const rigidbodies = physicsWorld.getAllRigidbodies();
        
        rigidbodies.forEach(rb => {
            if (!rb.transform) return;
            
            const distance = rb.transform.position.distance(center);
            if (distance <= radius && distance > 0) {
                // Calculate explosion force
                const direction = rb.transform.position.subtract(center).normalized();
                const falloff = 1 - (distance / radius); // Linear falloff
                const explosionForce = direction.multiply(force * falloff);
                
                // Apply impulse
                rb.addForce(explosionForce, ForceMode.Impulse);
                
                // Add some random spin
                const randomTorque = (Math.random() - 0.5) * force * 0.1;
                rb.addTorque(randomTorque, ForceMode.Impulse);
            }
        });
    }
}
```

### Wind Effect
```typescript
class WindZone extends Component {
    private windForce: Vector2 = new Vector2(50, 0);
    private affectedRigidbodies: Set<Rigidbody2D> = new Set();
    
    start(): void {
        // Set up trigger collider to detect objects in wind zone
        const collider = this.addComponent(BoxCollider2D);
        collider.isTrigger = true;
        collider.size = new Vector2(200, 100);
    }
    
    update(): void {
        // Apply wind force to all affected rigidbodies
        this.affectedRigidbodies.forEach(rb => {
            if (rb && rb.enabled && rb.bodyType === BodyType.Dynamic) {
                // Wind force is affected by object's mass
                const massBasedForce = this.windForce.multiply(rb.mass);
                rb.addForce(massBasedForce, ForceMode.Force);
            }
        });
    }
    
    onTriggerEnter(collider: Collider2D): void {
        const rigidbody = collider.getComponent(Rigidbody2D);
        if (rigidbody) {
            this.affectedRigidbodies.add(rigidbody);
        }
    }
    
    onTriggerExit(collider: Collider2D): void {
        const rigidbody = collider.getComponent(Rigidbody2D);
        if (rigidbody) {
            this.affectedRigidbodies.delete(rigidbody);
        }
    }
}
```

### Advanced Joint System
```typescript
class SpringJoint extends Component {
    private rigidbody: Rigidbody2D;
    private targetRigidbody: Rigidbody2D | null = null;
    private springConstant: number = 1000;
    private damping: number = 10;
    private restLength: number = 100;
    private localAnchor: Vector2 = Vector2.zero;
    private targetAnchor: Vector2 = Vector2.zero;
    
    start(): void {
        this.rigidbody = this.getComponent(Rigidbody2D);
    }
    
    public connectTo(target: Rigidbody2D, anchor: Vector2 = Vector2.zero): void {
        this.targetRigidbody = target;
        this.targetAnchor = anchor;
    }
    
    update(): void {
        if (!this.rigidbody || !this.targetRigidbody || !this.transform) return;
        
        // Calculate world positions of anchors
        const worldAnchor = this.transform.position.add(this.localAnchor);
        const targetWorldAnchor = this.targetRigidbody.transform!.position.add(this.targetAnchor);
        
        // Calculate spring force
        const direction = targetWorldAnchor.subtract(worldAnchor);
        const distance = direction.magnitude();
        const displacement = distance - this.restLength;
        
        if (Math.abs(displacement) > 0.1) {
            // Spring force: F = -k * displacement
            const springForce = direction.normalized().multiply(this.springConstant * displacement);
            
            // Damping force: F = -d * velocity
            const relativeVelocity = this.rigidbody.velocity.subtract(this.targetRigidbody.velocity);
            const dampingForce = relativeVelocity.multiply(-this.damping);
            
            // Total force
            const totalForce = springForce.add(dampingForce);
            
            // Apply forces
            this.rigidbody.addForce(totalForce, ForceMode.Force);
            this.targetRigidbody.addForce(totalForce.multiply(-1), ForceMode.Force);
        }
    }
}
```

## Force Mode Examples

### Force vs Impulse
```typescript
// Continuous thrust (like rocket engine)
rigidbody.addForce(new Vector2(0, -100), ForceMode.Force);

// One-time jump (instant velocity change)
rigidbody.addForce(new Vector2(0, -500), ForceMode.Impulse);

// Gravity-like acceleration (independent of mass)
rigidbody.addForce(new Vector2(0, 981), ForceMode.Acceleration);

// Direct velocity modification
rigidbody.addForce(new Vector2(10, 0), ForceMode.VelocityChange);
```

### Mass Effects
```typescript
// Heavy object
const heavyRB = new Rigidbody2D(BodyType.Dynamic, 10);

// Light object  
const lightRB = new Rigidbody2D(BodyType.Dynamic, 1);

// Same force applied
const force = new Vector2(100, 0);
heavyRB.addForce(force, ForceMode.Force); // Slower acceleration
lightRB.addForce(force, ForceMode.Force); // Faster acceleration

// Same impulse applied
heavyRB.addForce(force, ForceMode.Impulse); // Less velocity change
lightRB.addForce(force, ForceMode.Impulse); // More velocity change

// Same acceleration (mass independent)
heavyRB.addForce(force, ForceMode.Acceleration); // Same acceleration
lightRB.addForce(force, ForceMode.Acceleration); // Same acceleration
```

## Performance Considerations

- Sleeping rigidbodies are automatically excluded from physics calculations
- Static bodies have infinite mass and zero inverse mass for performance
- Use kinematic bodies for moving platforms instead of constant force application
- Freeze unnecessary axes of movement/rotation to reduce calculations
- High drag values can cause stability issues at low frame rates

## Common Errors

### ❌ Modifying Position Directly
```typescript
// WRONG - Bypasses physics system
transform.position = newPosition;

// CORRECT - Use physics methods
rigidbody.movePosition(newPosition);
// OR
rigidbody.addForce(force, ForceMode.Impulse);
```

### ❌ Applying Forces to Non-Dynamic Bodies
```typescript
// WRONG - Static/Kinematic bodies ignore forces
staticRigidbody.addForce(force); // No effect

// CORRECT - Check body type
if (rigidbody.isDynamic) {
    rigidbody.addForce(force);
}
```

### ❌ Division by Zero with Mass
```typescript
// WRONG - Can cause NaN values
rigidbody.mass = 0; // Will be clamped to 0.1

// CORRECT - Use minimum mass
rigidbody.setMass(0.1);
```

### ❌ Forgetting Constraints
```typescript
// Character spinning uncontrollably
rigidbody.freezeRotation = false; // WRONG for platformer

// CORRECT - Prevent unwanted rotation
rigidbody.freezeRotation = true;
```

## Integration Points

- **Transform**: Position and rotation are synced with physics simulation
- **Collider2D**: Requires collider for collision detection and response
- **Physics2DWorld**: Automatically registered for physics updates
- **PhysicsMaterial2D**: Controls surface properties (friction, bounciness)
- **CollisionInfo**: Receives collision events and data