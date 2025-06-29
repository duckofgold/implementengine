# Transform Component Documentation

## Overview
The `Transform` component handles position, rotation, and scale for GameObjects. It supports hierarchical parent-child relationships and provides both local and world coordinate systems. Every GameObject automatically has a Transform component.

## Class Declaration
```typescript
export class Transform extends Component
```

## Constructor
```typescript
constructor(x: number = 0, y: number = 0, rotation: number = 0, scaleX: number = 1, scaleY: number = 1)
```

**Parameters:**
- `x` (number, optional): Initial X position (defaults to 0)
- `y` (number, optional): Initial Y position (defaults to 0)
- `rotation` (number, optional): Initial rotation in radians (defaults to 0)
- `scaleX` (number, optional): Initial X scale (defaults to 1)
- `scaleY` (number, optional): Initial Y scale (defaults to 1)

## Position Properties

### `position: Vector2` (get/set)
Local position relative to parent (or world position if no parent).

### `localPosition: Vector2` (get/set)
Alias for position - explicitly refers to local space.

### `worldPosition: Vector2` (get/set)
Position in world space coordinates.
- If no parent: same as local position
- If has parent: calculated from parent's world transform

**Example:**
```typescript
// Set local position
transform.position = new Vector2(100, 200);

// Set world position (automatically converts to local space)
transform.worldPosition = new Vector2(500, 300);

// Get world position (calculated from hierarchy)
const worldPos = transform.worldPosition;
```

## Rotation Properties

### `rotation: number` (get/set)
Local rotation in radians relative to parent.

### `localRotation: number` (get/set)
Alias for rotation - explicitly refers to local space.

### `worldRotation: number` (get/set)
Rotation in world space (sum of all parent rotations).

**Example:**
```typescript
// Rotate 45 degrees locally
transform.rotation = Math.PI / 4;

// Set absolute world rotation
transform.worldRotation = Math.PI / 2; // 90 degrees

// Rotate incrementally
transform.rotate(Math.PI / 6); // Add 30 degrees
```

## Scale Properties

### `scale: Vector2` (get/set)
Local scale relative to parent.

### `localScale: Vector2` (get/set)
Alias for scale - explicitly refers to local space.

### `worldScale: Vector2` (get/set) (Read-only)
Scale in world space (product of all parent scales).

**Example:**
```typescript
// Set uniform scale
transform.scale = new Vector2(2, 2); // 2x size

// Set non-uniform scale
transform.scale = new Vector2(1.5, 0.5); // Wider, shorter

// Get world scale
const worldScale = transform.worldScale;
```

## Hierarchy Properties

### `parent: Transform | null` (read-only)
Reference to parent Transform, or null if root object.

### `children: readonly Transform[]` (read-only)
Array of child Transforms.

### `setParent(parent: Transform | null): void`
Sets the parent Transform.

**Behavior:**
- Removes from current parent if exists
- Adds to new parent's children array
- Maintains world position when changing parents

**Example:**
```typescript
// Create hierarchy
const parent = parentObject.transform;
const child = childObject.transform;

// Set parent-child relationship
child.setParent(parent);

// Remove from hierarchy
child.setParent(null);

// Check relationships
console.log(parent.children.length); // Number of children
console.log(child.parent === parent); // true
```

## Transformation Methods

### `translate(x: number, y: number): void`
### `translate(translation: Vector2): void`
Moves the transform by the specified offset.

**Example:**
```typescript
// Translate by individual values
transform.translate(10, -5);

// Translate by vector
transform.translate(new Vector2(10, -5));

// Frame-rate independent movement
const speed = 100; // pixels per second
transform.translate(direction.multiply(speed * Time.deltaTime));
```

### `rotate(angle: number): void`
Rotates the transform by the specified angle in radians.

**Example:**
```typescript
// Rotate 45 degrees
transform.rotate(Math.PI / 4);

// Continuous rotation
transform.rotate(rotationSpeed * Time.deltaTime);
```

### `lookAt(target: Vector2): void`
Rotates the transform to face the target position.

**Example:**
```typescript
// Face the mouse cursor
const mouseWorld = camera.screenToWorld(Input.getMousePosition(), renderer.size);
transform.lookAt(mouseWorld);

// Face another object
const enemy = scene.findGameObject('Enemy');
if (enemy) {
    transform.lookAt(enemy.transform.worldPosition);
}
```

## Point Transformation

### `transformPoint(point: Vector2): Vector2`
Transforms a point from local space to world space.

### `inverseTransformPoint(point: Vector2): Vector2`
Transforms a point from world space to local space.

**Example:**
```typescript
// Transform local point to world
const localPoint = new Vector2(0, 10); // 10 units up in local space
const worldPoint = transform.transformPoint(localPoint);

// Transform world point to local
const mouseWorld = camera.screenToWorld(Input.getMousePosition(), renderer.size);
const localMouse = transform.inverseTransformPoint(mouseWorld);
```

## Usage Examples

### Basic Transform Manipulation
```typescript
class MovingObject extends Component {
    private speed: number = 100;
    private direction: Vector2 = Vector2.right;
    
    update(): void {
        // Move forward
        const movement = this.direction.multiply(this.speed * Time.deltaTime);
        this.transform.translate(movement);
        
        // Rotate slowly
        this.transform.rotate(Math.PI * Time.deltaTime); // 180 degrees per second
        
        // Scale up and down
        const scale = 1 + Math.sin(Time.time) * 0.5;
        this.transform.scale = new Vector2(scale, scale);
    }
}
```

### Follow Target
```typescript
class FollowTarget extends Component {
    private target: Transform | null = null;
    private followSpeed: number = 2.0;
    private lookAtTarget: boolean = true;
    
    public setTarget(target: Transform): void {
        this.target = target;
    }
    
    update(): void {
        if (!this.target) return;
        
        // Move towards target
        const targetPos = this.target.worldPosition;
        const currentPos = this.transform.worldPosition;
        const direction = targetPos.subtract(currentPos);
        
        if (direction.magnitude() > 0.1) {
            const movement = direction.normalized().multiply(this.followSpeed * Time.deltaTime);
            this.transform.translate(movement);
        }
        
        // Look at target
        if (this.lookAtTarget) {
            this.transform.lookAt(targetPos);
        }
    }
}
```

### Orbit Movement
```typescript
class OrbitMovement extends Component {
    private center: Vector2 = Vector2.zero;
    private radius: number = 100;
    private speed: number = 1; // radians per second
    private angle: number = 0;
    
    public setCenter(center: Vector2): void {
        this.center = center;
    }
    
    update(): void {
        this.angle += this.speed * Time.deltaTime;
        
        const x = this.center.x + Math.cos(this.angle) * this.radius;
        const y = this.center.y + Math.sin(this.angle) * this.radius;
        
        this.transform.position = new Vector2(x, y);
        
        // Face movement direction
        const tangent = new Vector2(-Math.sin(this.angle), Math.cos(this.angle));
        this.transform.rotation = tangent.angle();
    }
}
```

### Hierarchical Animation
```typescript
class HierarchicalAnimator extends Component {
    private joints: Transform[] = [];
    private angles: number[] = [];
    private speeds: number[] = [];
    
    start(): void {
        // Create a chain of joints
        let current = this.transform;
        
        for (let i = 0; i < 5; i++) {
            const joint = new GameObject(`Joint_${i}`);
            joint.transform.setParent(current);
            joint.transform.position = new Vector2(20, 0); // 20 units to the right
            
            this.joints.push(joint.transform);
            this.angles.push(0);
            this.speeds.push((i + 1) * 0.5); // Different speeds for each joint
            
            current = joint.transform;
        }
    }
    
    update(): void {
        // Animate each joint
        for (let i = 0; i < this.joints.length; i++) {
            this.angles[i] += this.speeds[i] * Time.deltaTime;
            this.joints[i].rotation = Math.sin(this.angles[i]) * 0.5; // Oscillate
        }
    }
}
```

### Local Coordinate System
```typescript
class LocalCoordinateDemo extends Component {
    start(): void {
        // Create parent object
        const parent = new GameObject('Parent');
        parent.transform.position = new Vector2(200, 200);
        parent.transform.rotation = Math.PI / 4; // 45 degrees
        parent.transform.scale = new Vector2(2, 2);
        
        // Create child object
        const child = new GameObject('Child');
        child.transform.setParent(parent.transform);
        child.transform.position = new Vector2(50, 0); // 50 units right in local space
        
        // Child's world position will be affected by parent's transform
        console.log('Child local position:', child.transform.localPosition);
        console.log('Child world position:', child.transform.worldPosition);
        
        // Moving parent affects child's world position
        parent.transform.translate(100, 0);
        console.log('Child world position after parent move:', child.transform.worldPosition);
    }
}
```

### Transform Interpolation
```typescript
class SmoothTransform extends Component {
    private targetPosition: Vector2 = Vector2.zero;
    private targetRotation: number = 0;
    private targetScale: Vector2 = Vector2.one;
    private positionSpeed: number = 5.0;
    private rotationSpeed: number = 3.0;
    private scaleSpeed: number = 2.0;
    
    public setTargetPosition(position: Vector2): void {
        this.targetPosition = position;
    }
    
    public setTargetRotation(rotation: number): void {
        this.targetRotation = rotation;
    }
    
    public setTargetScale(scale: Vector2): void {
        this.targetScale = scale;
    }
    
    update(): void {
        // Smooth position interpolation
        const currentPos = this.transform.position;
        const newPos = currentPos.lerp(this.targetPosition, this.positionSpeed * Time.deltaTime);
        this.transform.position = newPos;
        
        // Smooth rotation interpolation
        const currentRot = this.transform.rotation;
        const rotDiff = this.targetRotation - currentRot;
        const normalizedDiff = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff)); // Handle wrap-around
        const newRot = currentRot + normalizedDiff * this.rotationSpeed * Time.deltaTime;
        this.transform.rotation = newRot;
        
        // Smooth scale interpolation
        const currentScale = this.transform.scale;
        const newScale = currentScale.lerp(this.targetScale, this.scaleSpeed * Time.deltaTime);
        this.transform.scale = newScale;
    }
}
```

### World Space UI Element
```typescript
class WorldSpaceUI extends Component {
    private worldTarget: Transform | null = null;
    private offset: Vector2 = new Vector2(0, -50); // Above target
    
    public setTarget(target: Transform): void {
        this.worldTarget = target;
    }
    
    update(): void {
        if (!this.worldTarget) return;
        
        // Position UI element in world space above target
        const targetWorldPos = this.worldTarget.worldPosition;
        this.transform.worldPosition = targetWorldPos.add(this.offset);
        
        // Always face camera (if needed)
        this.transform.rotation = 0; // Or camera.rotation if 3D
    }
}
```

### Physics Integration
```typescript
class PhysicsSync extends Component {
    private rigidbody: Rigidbody2D | null = null;
    
    awake(): void {
        this.rigidbody = this.getComponent(Rigidbody2D);
    }
    
    update(): void {
        if (!this.rigidbody) return;
        
        // Sync transform with physics body
        // (In a real implementation, physics would update transform)
        
        // Apply forces based on input
        if (Input.getKey('w')) {
            this.rigidbody.addForce(new Vector2(0, -100), ForceMode.Force);
        }
        
        // Manual position adjustment
        if (Input.getKeyDown('r')) {
            this.transform.position = Vector2.zero;
            this.rigidbody.velocity = Vector2.zero;
        }
    }
}
```

## Common Patterns

### Transform Hierarchy Setup
```typescript
// Create a complex hierarchy
const vehicle = new GameObject('Vehicle');
const body = new GameObject('Body');
const wheel1 = new GameObject('Wheel1');
const wheel2 = new GameObject('Wheel2');

// Set up hierarchy
body.transform.setParent(vehicle.transform);
wheel1.transform.setParent(body.transform);
wheel2.transform.setParent(body.transform);

// Position wheels relative to body
wheel1.transform.position = new Vector2(-30, 20);
wheel2.transform.position = new Vector2(30, 20);

// Now moving vehicle moves everything
vehicle.transform.translate(100, 0);
```

### Transform Utility Functions
```typescript
class TransformUtils {
    static distance(a: Transform, b: Transform): number {
        return a.worldPosition.distance(b.worldPosition);
    }
    
    static angle(from: Transform, to: Transform): number {
        const direction = to.worldPosition.subtract(from.worldPosition);
        return direction.angle();
    }
    
    static isWithinRange(transform: Transform, target: Vector2, range: number): boolean {
        return transform.worldPosition.distance(target) <= range;
    }
    
    static moveTowards(transform: Transform, target: Vector2, speed: number): void {
        const direction = target.subtract(transform.worldPosition);
        if (direction.magnitude() > 0) {
            const movement = direction.normalized().multiply(speed * Time.deltaTime);
            transform.translate(movement);
        }
    }
}
```

## Coordinate Space Conversions

### Local to World
```typescript
// Convert local offset to world position
const localOffset = new Vector2(10, 0); // 10 units right in local space
const worldPosition = transform.transformPoint(localOffset);
```

### World to Local
```typescript
// Convert world position to local coordinates
const worldPos = new Vector2(500, 300);
const localPos = transform.inverseTransformPoint(worldPos);
```

### Screen to World (with Camera)
```typescript
// Convert screen coordinates to world position
const screenPos = Input.getMousePosition();
const camera = Engine.getInstance().getRenderer().getCamera();
const renderer = Engine.getInstance().getRenderer();
const worldPos = camera.screenToWorld(screenPos, renderer.size);
```

## Common Errors

### ❌ Direct Property Modification
```typescript
// WRONG - Modifies clone, not original
transform.position.x = 100; // No effect!

// CORRECT - Set entire vector
transform.position = new Vector2(100, transform.position.y);

// OR use translate
transform.translate(100 - transform.position.x, 0);
```

### ❌ Circular Parent Relationships
```typescript
// WRONG - Creates circular dependency
parentTransform.setParent(childTransform); // Child becomes parent of its parent
```

### ❌ Missing Null Checks
```typescript
// WRONG - parent could be null
const parentPos = transform.parent.worldPosition; // ERROR if no parent

// CORRECT - Check for null
if (transform.parent) {
    const parentPos = transform.parent.worldPosition;
}
```

### ❌ Assuming Local = World
```typescript
// WRONG - Only true if no parent
const position = transform.position; // Might be local, not world

// CORRECT - Be explicit about coordinate space
const worldPos = transform.worldPosition;
const localPos = transform.localPosition;
```

## Performance Considerations

- World coordinate calculations are performed on-demand
- Hierarchy changes trigger immediate parent/child updates
- Deep hierarchies can be expensive for world coordinate calculations
- Cache world positions if accessed frequently in same frame
- Transform changes don't automatically trigger renderer updates

## Integration Points

- **GameObject**: Every GameObject has a Transform component
- **Renderer**: Uses world position/rotation/scale for drawing
- **Physics**: Rigidbody2D components sync with Transform
- **Animation**: Tween system can animate Transform properties
- **Camera**: Uses Transform for camera positioning and following