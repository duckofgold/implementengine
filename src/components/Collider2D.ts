import { Component } from '../core/Component';
import { Vector2 } from '../utils/Vector2';
import { Physics2DWorld } from '../physics/Physics2DWorld';
import { PhysicsMaterial2D } from '../physics/PhysicsMaterial2D';
import { Rigidbody2D } from './Rigidbody2D';

export interface Bounds2D {
    min: Vector2;
    max: Vector2;
    center: Vector2;
    size: Vector2;
}

export abstract class Collider2D extends Component {
    // Configuration
    public isTrigger: boolean = false;
    public material: PhysicsMaterial2D = PhysicsMaterial2D.Default;
    public offset: Vector2 = Vector2.zero;
    
    // Layer and filtering
    public layer: number = 0;
    public layerMask: number = 0xFFFFFFFF; // Which layers this collider can interact with
    
    // State
    public enabled: boolean = true;
    
    // Cached components
    protected rigidbody: Rigidbody2D | null = null;
    protected _bounds: Bounds2D | null = null;
    protected _boundsDirty: boolean = true;

    constructor() {
        super();
    }

    public awake(): void {
        this.rigidbody = this.getComponent(Rigidbody2D);
        
        // Register with physics world
        const physicsWorld = Physics2DWorld.getInstance();
        physicsWorld.addCollider(this);
    }

    public onDestroy(): void {
        // Unregister from physics world
        const physicsWorld = Physics2DWorld.getInstance();
        physicsWorld.removeCollider(this);
    }

    // Abstract methods that must be implemented by specific collider types
    public abstract containsPoint(point: Vector2): boolean;
    public abstract getClosestPoint(point: Vector2): Vector2;
    public abstract computeBounds(): Bounds2D;
    
    // Bounds management
    public get bounds(): Bounds2D {
        if (this._boundsDirty || !this._bounds) {
            this._bounds = this.computeBounds();
            this._boundsDirty = false;
        }
        return this._bounds;
    }

    public invalidateBounds(): void {
        this._boundsDirty = true;
    }

    // World space position
    public get worldPosition(): Vector2 {
        if (!this.transform) return Vector2.zero;
        return this.transform.worldPosition.add(this.offset);
    }

    public get worldRotation(): number {
        if (!this.transform) return 0;
        return this.transform.worldRotation;
    }

    public get worldScale(): Vector2 {
        if (!this.transform) return Vector2.one;
        return this.transform.worldScale;
    }

    // Layer management
    public setLayer(layer: number): void {
        this.layer = Math.max(0, Math.min(31, layer));
    }

    public getLayer(): number {
        return this.layer;
    }

    public setLayerMask(mask: number): void {
        this.layerMask = mask;
    }

    public getLayerMask(): number {
        return this.layerMask;
    }

    public canCollideWith(other: Collider2D): boolean {
        // Check if layers are compatible
        const thisLayerBit = 1 << this.layer;
        const otherLayerBit = 1 << other.layer;
        
        return (this.layerMask & otherLayerBit) !== 0 && 
               (other.layerMask & thisLayerBit) !== 0;
    }

    // Collision queries
    public overlaps(other: Collider2D): boolean {
        if (!this.canCollideWith(other) || !this.enabled || !other.enabled) {
            return false;
        }
        
        // First check bounds overlap for early exit
        if (!this.boundsOverlap(other)) {
            return false;
        }
        
        // Perform detailed collision detection
        return this.detailedOverlap(other);
    }

    protected boundsOverlap(other: Collider2D): boolean {
        const thisBounds = this.bounds;
        const otherBounds = other.bounds;
        
        return !(thisBounds.max.x < otherBounds.min.x ||
                thisBounds.min.x > otherBounds.max.x ||
                thisBounds.max.y < otherBounds.min.y ||
                thisBounds.min.y > otherBounds.max.y);
    }

    // This will be overridden by specific collider types for detailed collision
    protected abstract detailedOverlap(other: Collider2D): boolean;

    // Raycast support
    public abstract raycast(origin: Vector2, direction: Vector2, distance: number): RaycastHit2D | null;

    // Distance and separation
    public distance(other: Collider2D): ColliderDistance2D {
        const distance = new ColliderDistance2D();
        
        if (this.overlaps(other)) {
            distance.distance = 0;
            distance.isOverlapping = true;
            // Find separation vector
            const separation = this.computeSeparation(other);
            distance.pointA = separation.pointA;
            distance.pointB = separation.pointB;
            distance.normal = separation.normal;
        } else {
            // Find closest points
            const thisCenter = this.bounds.center;
            const otherCenter = other.bounds.center;
            
            distance.pointA = this.getClosestPoint(otherCenter);
            distance.pointB = other.getClosestPoint(thisCenter);
            distance.distance = distance.pointA.distance(distance.pointB);
            distance.normal = distance.pointB.subtract(distance.pointA).normalized();
        }
        
        return distance;
    }

    protected abstract computeSeparation(other: Collider2D): ColliderSeparation2D;

    // Trigger events
    protected onTriggerEnter(other: Collider2D): void {
        if (this.gameObject) {
            // Emit trigger event
            this.gameObject.scene?.emit('triggerEnter2D', {
                trigger: this,
                other: other,
                gameObject: this.gameObject,
                otherGameObject: other.gameObject
            });
        }
    }

    protected onTriggerStay(other: Collider2D): void {
        if (this.gameObject) {
            this.gameObject.scene?.emit('triggerStay2D', {
                trigger: this,
                other: other,
                gameObject: this.gameObject,
                otherGameObject: other.gameObject
            });
        }
    }

    protected onTriggerExit(other: Collider2D): void {
        if (this.gameObject) {
            this.gameObject.scene?.emit('triggerExit2D', {
                trigger: this,
                other: other,
                gameObject: this.gameObject,
                otherGameObject: other.gameObject
            });
        }
    }

    // Collision events
    protected onCollisionEnter(collision: Collision2D): void {
        if (this.gameObject) {
            this.gameObject.scene?.emit('collisionEnter2D', {
                collision,
                gameObject: this.gameObject
            });
        }
    }

    protected onCollisionStay(collision: Collision2D): void {
        if (this.gameObject) {
            this.gameObject.scene?.emit('collisionStay2D', {
                collision,
                gameObject: this.gameObject
            });
        }
    }

    protected onCollisionExit(collision: Collision2D): void {
        if (this.gameObject) {
            this.gameObject.scene?.emit('collisionExit2D', {
                collision,
                gameObject: this.gameObject
            });
        }
    }

    // Utility methods
    protected createBounds(center: Vector2, size: Vector2): Bounds2D {
        const halfSize = size.multiply(0.5);
        return {
            center: center.clone(),
            size: size.clone(),
            min: center.subtract(halfSize),
            max: center.add(halfSize)
        };
    }

    protected expandBounds(bounds: Bounds2D, expansion: number): Bounds2D {
        const expansionVector = new Vector2(expansion, expansion);
        return {
            center: bounds.center.clone(),
            size: bounds.size.add(expansionVector.multiply(2)),
            min: bounds.min.subtract(expansionVector),
            max: bounds.max.add(expansionVector)
        };
    }

    // Debug drawing (will be implemented with debug renderer)
    public drawGizmos(): void {
        // Override in specific collider types for debug visualization
    }
}

// Supporting classes and interfaces
export interface RaycastHit2D {
    collider: Collider2D;
    point: Vector2;
    normal: Vector2;
    distance: number;
    fraction: number;
}

export class ColliderDistance2D {
    public distance: number = 0;
    public isOverlapping: boolean = false;
    public pointA: Vector2 = Vector2.zero;  // Point on this collider
    public pointB: Vector2 = Vector2.zero;  // Point on other collider
    public normal: Vector2 = Vector2.zero;  // Normal from A to B
}

export interface ColliderSeparation2D {
    pointA: Vector2;
    pointB: Vector2;
    normal: Vector2;
    depth: number;
}

export interface Collision2D {
    collider: Collider2D;
    otherCollider: Collider2D;
    gameObject: import('../core/GameObject').GameObject;
    rigidbody: Rigidbody2D | null;
    transform: import('../components/Transform').Transform;
    contactCount: number;
    contacts: ContactPoint2D[];
    relativeVelocity: Vector2;
    impulse: Vector2;
}

export interface ContactPoint2D {
    point: Vector2;
    normal: Vector2;
    separation: number;
    normalImpulse: number;
    tangentImpulse: number;
}

// Collision detection algorithms
export class CollisionDetection2D {
    // Point vs collider tests
    public static pointInCircle(point: Vector2, center: Vector2, radius: number): boolean {
        return point.distanceSquared(center) <= radius * radius;
    }

    public static pointInBox(point: Vector2, center: Vector2, size: Vector2, rotation: number = 0): boolean {
        // Transform point to box local space
        const localPoint = point.subtract(center);
        
        if (rotation !== 0) {
            const cos = Math.cos(-rotation);
            const sin = Math.sin(-rotation);
            const rotatedX = localPoint.x * cos - localPoint.y * sin;
            const rotatedY = localPoint.x * sin + localPoint.y * cos;
            localPoint.set(rotatedX, rotatedY);
        }
        
        const halfSize = size.multiply(0.5);
        return Math.abs(localPoint.x) <= halfSize.x && Math.abs(localPoint.y) <= halfSize.y;
    }

    // Circle vs Circle
    public static circleVsCircle(
        centerA: Vector2, radiusA: number,
        centerB: Vector2, radiusB: number
    ): ColliderSeparation2D | null {
        const delta = centerB.subtract(centerA);
        const distance = delta.magnitude();
        const totalRadius = radiusA + radiusB;
        
        if (distance >= totalRadius) {
            return null; // No collision
        }
        
        const depth = totalRadius - distance;
        const normal = distance > 0 ? delta.divide(distance) : Vector2.right;
        
        return {
            pointA: centerA.add(normal.multiply(radiusA)),
            pointB: centerB.subtract(normal.multiply(radiusB)),
            normal,
            depth
        };
    }

    // Box vs Box (Oriented Bounding Box)
    public static boxVsBox(
        centerA: Vector2, sizeA: Vector2, rotationA: number,
        centerB: Vector2, sizeB: Vector2, rotationB: number
    ): ColliderSeparation2D | null {
        // Simplified SAT (Separating Axis Theorem) implementation
        // This is a complex algorithm - simplified version for basic collision
        
        // For now, use AABB vs AABB if no rotation
        if (rotationA === 0 && rotationB === 0) {
            return this.aabbVsAabb(centerA, sizeA, centerB, sizeB);
        }
        
        // TODO: Implement full OBB vs OBB collision detection
        return null;
    }

    // AABB vs AABB
    public static aabbVsAabb(
        centerA: Vector2, sizeA: Vector2,
        centerB: Vector2, sizeB: Vector2
    ): ColliderSeparation2D | null {
        const delta = centerB.subtract(centerA);
        const totalSize = sizeA.add(sizeB).multiply(0.5);
        
        const overlapX = totalSize.x - Math.abs(delta.x);
        const overlapY = totalSize.y - Math.abs(delta.y);
        
        if (overlapX <= 0 || overlapY <= 0) {
            return null; // No collision
        }
        
        // Choose axis with minimum penetration
        if (overlapX < overlapY) {
            const normal = new Vector2(delta.x > 0 ? 1 : -1, 0);
            return {
                pointA: centerA.add(new Vector2(normal.x * sizeA.x * 0.5, 0)),
                pointB: centerB.subtract(new Vector2(normal.x * sizeB.x * 0.5, 0)),
                normal,
                depth: overlapX
            };
        } else {
            const normal = new Vector2(0, delta.y > 0 ? 1 : -1);
            return {
                pointA: centerA.add(new Vector2(0, normal.y * sizeA.y * 0.5)),
                pointB: centerB.subtract(new Vector2(0, normal.y * sizeB.y * 0.5)),
                normal,
                depth: overlapY
            };
        }
    }

    // Circle vs Box
    public static circleVsBox(
        circleCenter: Vector2, radius: number,
        boxCenter: Vector2, boxSize: Vector2, boxRotation: number = 0
    ): ColliderSeparation2D | null {
        // Transform circle center to box local space
        let localCircleCenter = circleCenter.subtract(boxCenter);
        
        if (boxRotation !== 0) {
            const cos = Math.cos(-boxRotation);
            const sin = Math.sin(-boxRotation);
            const rotatedX = localCircleCenter.x * cos - localCircleCenter.y * sin;
            const rotatedY = localCircleCenter.x * sin + localCircleCenter.y * cos;
            localCircleCenter = new Vector2(rotatedX, rotatedY);
        }
        
        const halfSize = boxSize.multiply(0.5);
        
        // Find closest point on box to circle center
        const closest = new Vector2(
            Math.max(-halfSize.x, Math.min(halfSize.x, localCircleCenter.x)),
            Math.max(-halfSize.y, Math.min(halfSize.y, localCircleCenter.y))
        );
        
        const delta = localCircleCenter.subtract(closest);
        const distance = delta.magnitude();
        
        if (distance >= radius) {
            return null; // No collision
        }
        
        const depth = radius - distance;
        let normal = distance > 0 ? delta.divide(distance) : Vector2.up;
        
        // Transform normal back to world space
        if (boxRotation !== 0) {
            const cos = Math.cos(boxRotation);
            const sin = Math.sin(boxRotation);
            const rotatedX = normal.x * cos - normal.y * sin;
            const rotatedY = normal.x * sin + normal.y * cos;
            normal = new Vector2(rotatedX, rotatedY);
        }
        
        return {
            pointA: circleCenter.subtract(normal.multiply(radius)),
            pointB: boxCenter.add(closest),
            normal,
            depth
        };
    }
}