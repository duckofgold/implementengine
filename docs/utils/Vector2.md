# Vector2 Class Documentation

## Overview
The `Vector2` class represents a 2D vector with x and y components. It provides mathematical operations for 2D vector arithmetic, commonly used for positions, directions, velocities, and sizes throughout ImplementEngine.

## Class Declaration
```typescript
export class Vector2
```

## Constructor
```typescript
constructor(x: number = 0, y: number = 0)
```

**Parameters:**
- `x` (number, optional): X component (defaults to 0)
- `y` (number, optional): Y component (defaults to 0)

## Properties

### Public Properties
- `x: number` - X component of the vector
- `y: number` - Y component of the vector

### Static Constants
- `static zero: Vector2` - Vector with components (0, 0)
- `static one: Vector2` - Vector with components (1, 1)
- `static up: Vector2` - Vector with components (0, -1) - Screen space up
- `static down: Vector2` - Vector with components (0, 1) - Screen space down
- `static left: Vector2` - Vector with components (-1, 0)
- `static right: Vector2` - Vector with components (1, 0)

**Example:**
```typescript
const origin = Vector2.zero;        // (0, 0)
const unit = Vector2.one;          // (1, 1)
const upward = Vector2.up;         // (0, -1)
const rightward = Vector2.right;   // (1, 0)
```

## Basic Operations

### `clone(): Vector2`
Creates a copy of the vector.

### `set(x: number, y: number): Vector2`
Sets both components and returns this vector.

**Example:**
```typescript
const vec = new Vector2();
vec.set(10, 20); // vec is now (10, 20)
```

### `add(other: Vector2): Vector2`
Returns a new vector that is the sum of this vector and another.

### `subtract(other: Vector2): Vector2`
Returns a new vector that is the difference between this vector and another.

### `multiply(scalar: number): Vector2`
Returns a new vector scaled by a scalar value.

### `divide(scalar: number): Vector2`
Returns a new vector divided by a scalar value.

**Example:**
```typescript
const a = new Vector2(10, 20);
const b = new Vector2(5, 15);

const sum = a.add(b);           // (15, 35)
const diff = a.subtract(b);     // (5, 5)
const scaled = a.multiply(2);   // (20, 40)
const divided = a.divide(2);    // (5, 10)
```

## Magnitude and Distance

### `magnitude(): number`
Returns the length/magnitude of the vector.
```typescript
const vec = new Vector2(3, 4);
const length = vec.magnitude(); // 5.0
```

### `magnitudeSquared(): number`
Returns the squared magnitude (more efficient than magnitude()).
```typescript
const vec = new Vector2(3, 4);
const lengthSquared = vec.magnitudeSquared(); // 25.0
```

### `distance(other: Vector2): number`
Returns the distance between this vector and another.

### `distanceSquared(other: Vector2): number`
Returns the squared distance (more efficient for comparisons).

**Example:**
```typescript
const a = new Vector2(0, 0);
const b = new Vector2(3, 4);

const dist = a.distance(b);        // 5.0
const distSq = a.distanceSquared(b); // 25.0

// Efficient distance comparison
if (a.distanceSquared(b) < 100) {
    console.log('Objects are close');
}
```

## Normalization

### `normalized(): Vector2`
Returns a new unit vector in the same direction (magnitude = 1).
- Returns Vector2.zero if magnitude is 0

### `normalize(): Vector2`
Normalizes this vector in-place and returns it.
- Returns this vector for chaining

**Example:**
```typescript
const vec = new Vector2(10, 0);
const unit = vec.normalized(); // (1, 0)
console.log(vec);              // Still (10, 0)

vec.normalize();               // Modifies vec
console.log(vec);              // Now (1, 0)
```

## Dot Product

### `dot(other: Vector2): number`
Returns the dot product of this vector and another.
- Useful for angle calculations and projections

**Example:**
```typescript
const a = new Vector2(1, 0);
const b = new Vector2(0, 1);
const dot = a.dot(b); // 0.0 (perpendicular vectors)

const c = new Vector2(1, 1).normalized();
const d = Vector2.right;
const dotCD = c.dot(d); // ~0.707 (45 degree angle)
```

## Interpolation

### `lerp(other: Vector2, t: number): Vector2`
Returns linear interpolation between this vector and another.
- `t` is clamped between 0 and 1

**Example:**
```typescript
const start = new Vector2(0, 0);
const end = new Vector2(100, 100);

const quarter = start.lerp(end, 0.25);  // (25, 25)
const half = start.lerp(end, 0.5);      // (50, 50)
const full = start.lerp(end, 1.0);      // (100, 100)

// Smooth movement over time
const currentPos = player.transform.position;
const targetPos = new Vector2(500, 300);
const lerpFactor = 2.0 * Time.deltaTime;
const newPos = currentPos.lerp(targetPos, lerpFactor);
```

## Rotation

### `angle(): number`
Returns the angle of the vector in radians (from positive X-axis).

### `rotate(angle: number): Vector2`
Returns a new vector rotated by the specified angle (in radians).

**Example:**
```typescript
const vec = Vector2.right;           // (1, 0)
const angle = vec.angle();           // 0 radians

const rotated90 = vec.rotate(Math.PI / 2); // (0, 1) - rotated 90 degrees
const rotated180 = vec.rotate(Math.PI);     // (-1, 0) - rotated 180 degrees
```

## Comparison

### `equals(other: Vector2, tolerance: number = 0.0001): boolean`
Checks if two vectors are approximately equal within a tolerance.

**Example:**
```typescript
const a = new Vector2(1.0, 2.0);
const b = new Vector2(1.0001, 1.9999);

const exact = a.equals(b);           // false
const approximate = a.equals(b, 0.01); // true
```

## Utility Methods

### `toString(): string`
Returns a string representation of the vector.

**Example:**
```typescript
const vec = new Vector2(10.5, 20.7);
console.log(vec.toString()); // "Vector2(10.50, 20.70)"
```

## Static Methods

### `distance(a: Vector2, b: Vector2): number`
Static version of distance calculation.

### `lerp(a: Vector2, b: Vector2, t: number): Vector2`
Static version of linear interpolation.

### `dot(a: Vector2, b: Vector2): number`
Static version of dot product.

### `fromAngle(angle: number, magnitude: number = 1): Vector2`
Creates a vector from an angle and magnitude.

**Example:**
```typescript
// Static methods
const dist = Vector2.distance(pointA, pointB);
const midpoint = Vector2.lerp(pointA, pointB, 0.5);
const dotProduct = Vector2.dot(vectorA, vectorB);

// Create vector from angle
const rightVector = Vector2.fromAngle(0, 10);        // 10 units right
const upVector = Vector2.fromAngle(-Math.PI/2, 5);   // 5 units up
const diagonal = Vector2.fromAngle(Math.PI/4, 1);    // 45 degrees, unit length
```

## Usage Examples

### Movement and Velocity
```typescript
class MovementComponent extends Component {
    private velocity: Vector2 = Vector2.zero;
    private acceleration: Vector2 = Vector2.zero;
    private maxSpeed: number = 200;
    
    update(): void {
        // Apply input to acceleration
        const input = this.getInputVector();
        this.acceleration = input.multiply(500); // 500 units/s²
        
        // Update velocity
        const deltaV = this.acceleration.multiply(Time.deltaTime);
        this.velocity = this.velocity.add(deltaV);
        
        // Clamp to max speed
        if (this.velocity.magnitude() > this.maxSpeed) {
            this.velocity = this.velocity.normalized().multiply(this.maxSpeed);
        }
        
        // Update position
        const deltaPos = this.velocity.multiply(Time.deltaTime);
        this.transform.translate(deltaPos);
        
        // Apply drag
        this.velocity = this.velocity.multiply(0.95);
    }
    
    private getInputVector(): Vector2 {
        const input = Vector2.zero;
        if (Input.getKey('w')) input.y -= 1;
        if (Input.getKey('s')) input.y += 1;
        if (Input.getKey('a')) input.x -= 1;
        if (Input.getKey('d')) input.x += 1;
        
        return input.magnitude() > 0 ? input.normalized() : Vector2.zero;
    }
}
```

### Seeking Behavior
```typescript
class SeekingComponent extends Component {
    private target: Vector2 = Vector2.zero;
    private speed: number = 100;
    private arrivalRadius: number = 50;
    
    public setTarget(target: Vector2): void {
        this.target = target;
    }
    
    update(): void {
        const currentPos = this.transform.position;
        const direction = this.target.subtract(currentPos);
        const distance = direction.magnitude();
        
        if (distance < 1) return; // Arrived
        
        // Slow down when approaching target
        let speed = this.speed;
        if (distance < this.arrivalRadius) {
            speed = this.speed * (distance / this.arrivalRadius);
        }
        
        const velocity = direction.normalized().multiply(speed);
        const movement = velocity.multiply(Time.deltaTime);
        this.transform.translate(movement);
        
        // Face movement direction
        if (velocity.magnitude() > 0) {
            this.transform.rotation = velocity.angle();
        }
    }
}
```

### Bouncing Ball Physics
```typescript
class BouncingBall extends Component {
    private velocity: Vector2 = new Vector2(200, -300);
    private gravity: Vector2 = new Vector2(0, 981);
    private bounciness: number = 0.8;
    private bounds: { min: Vector2, max: Vector2 };
    
    constructor() {
        super();
        this.bounds = {
            min: Vector2.zero,
            max: new Vector2(800, 600)
        };
    }
    
    update(): void {
        // Apply gravity
        this.velocity = this.velocity.add(this.gravity.multiply(Time.deltaTime));
        
        // Update position
        const movement = this.velocity.multiply(Time.deltaTime);
        this.transform.translate(movement);
        
        // Bounce off boundaries
        const pos = this.transform.position;
        
        if (pos.x < this.bounds.min.x || pos.x > this.bounds.max.x) {
            this.velocity.x *= -this.bounciness;
            // Clamp position to bounds
            const clampedX = Math.max(this.bounds.min.x, Math.min(this.bounds.max.x, pos.x));
            this.transform.position = new Vector2(clampedX, pos.y);
        }
        
        if (pos.y < this.bounds.min.y || pos.y > this.bounds.max.y) {
            this.velocity.y *= -this.bounciness;
            const clampedY = Math.max(this.bounds.min.y, Math.min(this.bounds.max.y, pos.y));
            this.transform.position = new Vector2(pos.x, clampedY);
        }
    }
}
```

### Circle Collision Detection
```typescript
class CircleCollision {
    public static checkCollision(centerA: Vector2, radiusA: number, centerB: Vector2, radiusB: number): boolean {
        const distance = centerA.distance(centerB);
        return distance < (radiusA + radiusB);
    }
    
    public static resolveCollision(posA: Vector2, velA: Vector2, massA: number,
                                  posB: Vector2, velB: Vector2, massB: number): { velA: Vector2, velB: Vector2 } {
        
        const direction = posB.subtract(posA).normalized();
        const relativeVelocity = velA.subtract(velB);
        const speed = relativeVelocity.dot(direction);
        
        if (speed > 0) return { velA, velB }; // Objects separating
        
        // Calculate collision response
        const totalMass = massA + massB;
        const newVelA = velA.subtract(direction.multiply(2 * massB * speed / totalMass));
        const newVelB = velB.add(direction.multiply(2 * massA * speed / totalMass));
        
        return { velA: newVelA, velB: newVelB };
    }
}
```

### Smooth Camera Following
```typescript
class SmoothCameraFollow extends Component {
    private target: Transform | null = null;
    private offset: Vector2 = new Vector2(0, -100);
    private smoothTime: number = 2.0;
    private lookAheadDistance: number = 100;
    
    public setTarget(target: Transform): void {
        this.target = target;
    }
    
    update(): void {
        if (!this.target) return;
        
        const camera = Engine.getInstance().getRenderer().getCamera();
        const targetPos = this.target.worldPosition;
        
        // Add look-ahead based on target velocity
        let lookAhead = Vector2.zero;
        const rigidbody = this.target.gameObject?.getComponent(Rigidbody2D);
        if (rigidbody) {
            const velocity = rigidbody.velocity;
            if (velocity.magnitude() > 0) {
                lookAhead = velocity.normalized().multiply(this.lookAheadDistance);
            }
        }
        
        const desiredPos = targetPos.add(this.offset).add(lookAhead);
        const currentPos = camera.position;
        
        // Smooth interpolation
        const lerpFactor = this.smoothTime * Time.deltaTime;
        const newPos = currentPos.lerp(desiredPos, lerpFactor);
        
        camera.setPosition(newPos);
    }
}
```

### Vector Field Navigation
```typescript
class VectorField {
    private width: number;
    private height: number;
    private cellSize: number;
    private field: Vector2[][];
    
    constructor(width: number, height: number, cellSize: number) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.field = [];
        
        this.generateField();
    }
    
    private generateField(): void {
        const cols = Math.ceil(this.width / this.cellSize);
        const rows = Math.ceil(this.height / this.cellSize);
        
        for (let x = 0; x < cols; x++) {
            this.field[x] = [];
            for (let y = 0; y < rows; y++) {
                // Generate spiral field
                const centerX = this.width / 2;
                const centerY = this.height / 2;
                const worldX = x * this.cellSize + this.cellSize / 2;
                const worldY = y * this.cellSize + this.cellSize / 2;
                
                const direction = new Vector2(worldX - centerX, worldY - centerY);
                const angle = direction.angle() + Math.PI / 2; // Perpendicular for spiral
                
                this.field[x][y] = Vector2.fromAngle(angle);
            }
        }
    }
    
    public getVector(position: Vector2): Vector2 {
        const x = Math.floor(position.x / this.cellSize);
        const y = Math.floor(position.y / this.cellSize);
        
        if (x >= 0 && x < this.field.length && y >= 0 && y < this.field[0].length) {
            return this.field[x][y];
        }
        
        return Vector2.zero;
    }
}

class FieldFollower extends Component {
    private field: VectorField;
    private speed: number = 100;
    
    constructor(field: VectorField) {
        super();
        this.field = field;
    }
    
    update(): void {
        const position = this.transform.position;
        const fieldVector = this.field.getVector(position);
        
        const velocity = fieldVector.multiply(this.speed);
        const movement = velocity.multiply(Time.deltaTime);
        
        this.transform.translate(movement);
        
        // Face movement direction
        if (velocity.magnitude() > 0) {
            this.transform.rotation = velocity.angle();
        }
    }
}
```

## Common Mathematical Operations

### Angle Between Vectors
```typescript
function angleBetween(a: Vector2, b: Vector2): number {
    const dot = a.normalized().dot(b.normalized());
    return Math.acos(Math.max(-1, Math.min(1, dot))); // Clamp for floating point errors
}
```

### Vector Projection
```typescript
function project(vector: Vector2, onto: Vector2): Vector2 {
    const ontoNormalized = onto.normalized();
    const projectionLength = vector.dot(ontoNormalized);
    return ontoNormalized.multiply(projectionLength);
}
```

### Reflect Vector
```typescript
function reflect(vector: Vector2, normal: Vector2): Vector2 {
    const normalizedNormal = normal.normalized();
    return vector.subtract(normalizedNormal.multiply(2 * vector.dot(normalizedNormal)));
}
```

## Performance Considerations

- Vector operations create new Vector2 instances (immutable style)
- Use `magnitudeSquared()` instead of `magnitude()` for distance comparisons
- Cache frequently accessed vectors instead of recalculating
- Use `normalize()` (in-place) instead of `normalized()` when you don't need the original
- Static constants (Vector2.zero, etc.) return new instances each time

## Common Errors

### ❌ Modifying Static Constants
```typescript
Vector2.zero.x = 10; // WRONG - Modifies shared instance
```

### ❌ Expecting Mutation
```typescript
const vec = new Vector2(10, 20);
vec.add(new Vector2(5, 5)); // WRONG - Returns new vector, doesn't modify vec
console.log(vec); // Still (10, 20)

// CORRECT
const result = vec.add(new Vector2(5, 5));
// OR
vec = vec.add(new Vector2(5, 5));
```

### ❌ Division by Zero
```typescript
const vec = Vector2.zero;
const normalized = vec.normalized(); // Returns Vector2.zero safely

const divided = vec.divide(0); // Returns (NaN, NaN) - check for zero first
```

## Integration Points

- **Transform**: Uses Vector2 for position and scale
- **Physics**: Velocity, acceleration, and forces are Vector2
- **Input**: Mouse position and movement deltas
- **Camera**: Position and coordinate transformations
- **Rendering**: Screen coordinates and world positions