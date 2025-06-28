import { Vector2 } from '../utils/Vector2';
import { GameObject } from '../core/GameObject';

export interface CollisionInfo {
    // Objects involved in collision
    gameObjectA: GameObject;
    gameObjectB: GameObject;
    
    // Collision details
    point: Vector2;          // Contact point in world space
    normal: Vector2;         // Collision normal (from A to B)
    depth: number;           // Penetration depth
    relativeVelocity: Vector2; // Relative velocity at contact
    
    // Collision response data
    impulse: number;         // Impulse magnitude applied
    friction: number;        // Combined friction coefficient
    restitution: number;     // Combined restitution coefficient
    
    // Separation data
    separation: Vector2;     // Required separation vector
    
    // Metadata
    timestamp: number;       // When collision occurred
    isNewCollision: boolean; // First frame of collision
    isTrigger: boolean;      // Is this a trigger collision
}

export interface RaycastHit {
    gameObject: GameObject;
    point: Vector2;
    normal: Vector2;
    distance: number;
    fraction: number; // 0-1 along the ray
}

export interface OverlapInfo {
    gameObject: GameObject;
    overlap: number; // Amount of overlap
    center: Vector2; // Center of overlap area
}

// Helper class for managing collision pairs
export class CollisionPair {
    public readonly id: string;
    public readonly objectA: GameObject;
    public readonly objectB: GameObject;
    public lastCollisionTime: number = 0;
    public persistent: boolean = false;

    constructor(objectA: GameObject, objectB: GameObject) {
        // Ensure consistent ordering for collision pairs
        if (objectA.id < objectB.id) {
            this.objectA = objectA;
            this.objectB = objectB;
        } else {
            this.objectA = objectB;
            this.objectB = objectA;
        }
        
        this.id = `${this.objectA.id}_${this.objectB.id}`;
    }

    public contains(obj: GameObject): boolean {
        return this.objectA === obj || this.objectB === obj;
    }

    public getOther(obj: GameObject): GameObject | null {
        if (this.objectA === obj) return this.objectB;
        if (this.objectB === obj) return this.objectA;
        return null;
    }

    public equals(other: CollisionPair): boolean {
        return this.id === other.id;
    }

    public static createId(objectA: GameObject, objectB: GameObject): string {
        return objectA.id < objectB.id ? 
            `${objectA.id}_${objectB.id}` : 
            `${objectB.id}_${objectA.id}`;
    }
}