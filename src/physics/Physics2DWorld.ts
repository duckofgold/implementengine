import { Vector2 } from '../utils/Vector2';
import { EventEmitter } from '../utils/EventEmitter';
import { Scene } from '../core/Scene';
import { GameObject } from '../core/GameObject';
import { CollisionInfo, CollisionPair, RaycastHit } from './CollisionInfo';
import { PhysicsMaterial2D } from './PhysicsMaterial2D';

export interface Physics2DSettings {
    gravity: Vector2;
    velocityIterations: number;
    positionIterations: number;
    timeStep: number;
    enableSpatialPartitioning: boolean;
    debugDraw: boolean;
}

export class Physics2DWorld extends EventEmitter {
    private static _instance: Physics2DWorld | null = null;
    
    // Physics settings
    public settings: Physics2DSettings;
    
    // Simulation state
    private rigidbodies: Set<any> = new Set(); // Will be Rigidbody2D components
    private colliders: Set<any> = new Set();   // Will be Collider2D components
    private collisionPairs: Map<string, CollisionPair> = new Map();
    private activeCollisions: Map<string, CollisionInfo> = new Map();
    
    // Performance tracking
    private lastUpdateTime: number = 0;
    private accumulator: number = 0;
    private frameCount: number = 0;
    
    // Spatial partitioning (simplified grid)
    private spatialGrid: Map<string, Set<any>> = new Map();
    private gridCellSize: number = 100;

    constructor(settings?: Partial<Physics2DSettings>) {
        super();
        
        this.settings = {
            gravity: new Vector2(0, 981), // 9.81 m/s² in pixels
            velocityIterations: 8,
            positionIterations: 3,
            timeStep: 1 / 60, // 60 FPS
            enableSpatialPartitioning: true,
            debugDraw: false,
            ...settings
        };
    }

    public static getInstance(): Physics2DWorld {
        if (!Physics2DWorld._instance) {
            Physics2DWorld._instance = new Physics2DWorld();
        }
        return Physics2DWorld._instance;
    }

    public static createInstance(settings?: Partial<Physics2DSettings>): Physics2DWorld {
        Physics2DWorld._instance = new Physics2DWorld(settings);
        return Physics2DWorld._instance;
    }

    // Rigidbody management
    public addRigidbody(rigidbody: any): void {
        this.rigidbodies.add(rigidbody);
        this.emit('rigidbodyAdded', rigidbody);
    }

    public removeRigidbody(rigidbody: any): void {
        this.rigidbodies.delete(rigidbody);
        this.emit('rigidbodyRemoved', rigidbody);
    }

    // Collider management
    public addCollider(collider: any): void {
        this.colliders.add(collider);
        this.updateSpatialGrid(collider);
        this.emit('colliderAdded', collider);
    }

    public removeCollider(collider: any): void {
        this.colliders.delete(collider);
        this.removeFromSpatialGrid(collider);
        this.emit('colliderRemoved', collider);
    }

    // Main physics update
    public update(deltaTime: number): void {
        const currentTime = performance.now();
        this.frameCount++;

        // Fixed timestep accumulator
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.settings.timeStep) {
            this.step(this.settings.timeStep);
            this.accumulator -= this.settings.timeStep;
        }
        
        // Interpolate remaining time for smooth visuals
        const alpha = this.accumulator / this.settings.timeStep;
        this.interpolateTransforms(alpha);
        
        this.lastUpdateTime = currentTime;
    }

    private step(deltaTime: number): void {
        // 1. Apply forces (gravity, user forces)
        this.applyForces(deltaTime);
        
        // 2. Update velocities
        this.updateVelocities(deltaTime);
        
        // 3. Collision detection
        this.detectCollisions();
        
        // 4. Collision response (velocity iterations)
        for (let i = 0; i < this.settings.velocityIterations; i++) {
            this.resolveVelocityConstraints();
        }
        
        // 5. Update positions
        this.updatePositions(deltaTime);
        
        // 6. Position correction (position iterations)
        for (let i = 0; i < this.settings.positionIterations; i++) {
            this.resolvePositionConstraints();
        }
        
        // 7. Update spatial grid
        this.updateAllSpatialGrids();
        
        // 8. Emit collision events
        this.processCollisionEvents();
    }

    private applyForces(deltaTime: number): void {
        this.rigidbodies.forEach(rigidbody => {
            if (rigidbody.bodyType === 'dynamic' && !rigidbody.isKinematic) {
                // Apply gravity
                const gravityForce = this.settings.gravity.multiply(rigidbody.mass);
                rigidbody.addForce(gravityForce);
                
                // Apply accumulated forces
                rigidbody.applyForces(deltaTime);
            }
        });
    }

    private updateVelocities(deltaTime: number): void {
        this.rigidbodies.forEach(rigidbody => {
            if (rigidbody.bodyType === 'dynamic') {
                rigidbody.updateVelocity(deltaTime);
            }
        });
    }

    private detectCollisions(): void {
        const newCollisions = new Map<string, CollisionInfo>();
        
        if (this.settings.enableSpatialPartitioning) {
            this.detectCollisionsSpatial(newCollisions);
        } else {
            this.detectCollisionsBruteForce(newCollisions);
        }
        
        // Update collision tracking
        this.updateCollisionTracking(newCollisions);
    }

    private detectCollisionsBruteForce(collisions: Map<string, CollisionInfo>): void {
        const colliderArray = Array.from(this.colliders);
        
        for (let i = 0; i < colliderArray.length; i++) {
            for (let j = i + 1; j < colliderArray.length; j++) {
                const colliderA = colliderArray[i];
                const colliderB = colliderArray[j];
                
                if (this.shouldCheckCollision(colliderA, colliderB)) {
                    const collision = this.checkCollision(colliderA, colliderB);
                    if (collision) {
                        const pairId = CollisionPair.createId(collision.gameObjectA, collision.gameObjectB);
                        collisions.set(pairId, collision);
                    }
                }
            }
        }
    }

    private detectCollisionsSpatial(collisions: Map<string, CollisionInfo>): void {
        // Simplified spatial partitioning - check only nearby cells
        const checkedPairs = new Set<string>();
        
        this.spatialGrid.forEach((cellColliders, cellKey) => {
            const collidersArray = Array.from(cellColliders);
            
            // Check within cell
            for (let i = 0; i < collidersArray.length; i++) {
                for (let j = i + 1; j < collidersArray.length; j++) {
                    const colliderA = collidersArray[i];
                    const colliderB = collidersArray[j];
                    const pairId = CollisionPair.createId(colliderA.gameObject, colliderB.gameObject);
                    
                    if (!checkedPairs.has(pairId) && this.shouldCheckCollision(colliderA, colliderB)) {
                        checkedPairs.add(pairId);
                        const collision = this.checkCollision(colliderA, colliderB);
                        if (collision) {
                            collisions.set(pairId, collision);
                        }
                    }
                }
            }
        });
    }

    private shouldCheckCollision(colliderA: any, colliderB: any): boolean {
        // Don't check collision with self
        if (colliderA === colliderB) return false;
        
        // Check if colliders can collide with each other
        if (!colliderA.canCollideWith(colliderB)) return false;
        
        // Don't check if both are static
        const rigidbodyA = colliderA.gameObject.getComponent(class Rigidbody2D {});
        const rigidbodyB = colliderB.gameObject.getComponent(class Rigidbody2D {});
        
        if (rigidbodyA?.bodyType === 'static' && rigidbodyB?.bodyType === 'static') {
            return false;
        }
        
        return true;
    }

    private checkCollision(colliderA: any, colliderB: any): CollisionInfo | null {
        if (!colliderA.overlaps(colliderB)) {
            return null;
        }
        
        // Get separation information
        const separation = colliderA.computeSeparation(colliderB);
        if (!separation || separation.depth <= 0) {
            return null;
        }
        
        // Get rigidbodies
        const rigidbodyA = colliderA.gameObject.getComponent(class Rigidbody2D {});
        const rigidbodyB = colliderB.gameObject.getComponent(class Rigidbody2D {});
        
        // Calculate relative velocity
        const velocityA = rigidbodyA?.velocity || Vector2.zero;
        const velocityB = rigidbodyB?.velocity || Vector2.zero;
        const relativeVelocity = velocityB.subtract(velocityA);
        
        // Calculate combined material properties
        const materialA = colliderA.material || PhysicsMaterial2D.Default;
        const materialB = colliderB.material || PhysicsMaterial2D.Default;
        const friction = PhysicsMaterial2D.combineFriction(materialA, materialB);
        const restitution = PhysicsMaterial2D.combineRestitution(materialA, materialB);
        
        // Create collision info
        const collision: CollisionInfo = {
            gameObjectA: colliderA.gameObject,
            gameObjectB: colliderB.gameObject,
            point: separation.pointA,
            normal: separation.normal,
            depth: separation.depth,
            relativeVelocity,
            impulse: 0, // Will be calculated during response
            friction,
            restitution,
            separation: separation.normal.multiply(separation.depth),
            timestamp: performance.now(),
            isNewCollision: false, // Will be set by tracking
            isTrigger: colliderA.isTrigger || colliderB.isTrigger
        };
        
        return collision;
    }

    private updateCollisionTracking(newCollisions: Map<string, CollisionInfo>): void {
        // Track new collisions
        newCollisions.forEach((collision, pairId) => {
            const wasColliding = this.activeCollisions.has(pairId);
            collision.isNewCollision = !wasColliding;
            this.activeCollisions.set(pairId, collision);
            
            // Update collision pair
            if (!this.collisionPairs.has(pairId)) {
                const pair = new CollisionPair(collision.gameObjectA, collision.gameObjectB);
                this.collisionPairs.set(pairId, pair);
            }
            
            const pair = this.collisionPairs.get(pairId)!;
            pair.lastCollisionTime = performance.now();
            pair.persistent = true;
        });
        
        // Remove ended collisions
        this.activeCollisions.forEach((collision, pairId) => {
            if (!newCollisions.has(pairId)) {
                this.activeCollisions.delete(pairId);
                const pair = this.collisionPairs.get(pairId);
                if (pair) {
                    pair.persistent = false;
                    // Keep pair for a short time for exit events
                    setTimeout(() => {
                        this.collisionPairs.delete(pairId);
                    }, 100);
                }
            }
        });
    }

    private resolveVelocityConstraints(): void {
        this.activeCollisions.forEach(collision => {
            if (!collision.isTrigger) {
                this.resolveCollisionVelocity(collision);
            }
        });
    }

    private resolveCollisionVelocity(collision: CollisionInfo): void {
        const rigidbodyA = collision.gameObjectA.getComponent(class Rigidbody2D {});
        const rigidbodyB = collision.gameObjectB.getComponent(class Rigidbody2D {});
        
        if (!rigidbodyA && !rigidbodyB) return;
        
        // Get masses and inverse masses
        const massA = rigidbodyA?.getMass() || Infinity;
        const massB = rigidbodyB?.getMass() || Infinity;
        const invMassA = rigidbodyA?.getInverseMass() || 0;
        const invMassB = rigidbodyB?.getInverseMass() || 0;
        
        if (invMassA + invMassB === 0) return; // Both objects are static
        
        // Calculate relative velocity along normal
        const relativeVelocity = collision.relativeVelocity;
        const velocityAlongNormal = Vector2.dot(relativeVelocity, collision.normal);
        
        // Don't resolve if velocities are separating
        if (velocityAlongNormal > 0) return;
        
        // Calculate impulse magnitude
        const e = collision.restitution;
        let impulseMagnitude = -(1 + e) * velocityAlongNormal;
        impulseMagnitude /= invMassA + invMassB;
        
        // Apply impulse
        const impulse = collision.normal.multiply(impulseMagnitude);
        
        if (rigidbodyA && rigidbodyA.bodyType === 'dynamic') {
            const velocityChangeA = impulse.multiply(-invMassA);
            rigidbodyA.velocity = rigidbodyA.velocity.add(velocityChangeA);
        }
        
        if (rigidbodyB && rigidbodyB.bodyType === 'dynamic') {
            const velocityChangeB = impulse.multiply(invMassB);
            rigidbodyB.velocity = rigidbodyB.velocity.add(velocityChangeB);
        }
        
        // Apply friction
        this.applyFrictionImpulse(collision, rigidbodyA, rigidbodyB, impulseMagnitude);
        
        // Store impulse for reference
        collision.impulse = impulseMagnitude;
    }
    
    private applyFrictionImpulse(collision: CollisionInfo, rigidbodyA: any, rigidbodyB: any, normalImpulse: number): void {
        if (!rigidbodyA && !rigidbodyB) return;
        
        const invMassA = rigidbodyA?.getInverseMass() || 0;
        const invMassB = rigidbodyB?.getInverseMass() || 0;
        
        if (invMassA + invMassB === 0) return;
        
        // Calculate relative velocity
        const velocityA = rigidbodyA?.velocity || Vector2.zero;
        const velocityB = rigidbodyB?.velocity || Vector2.zero;
        const relativeVelocity = velocityB.subtract(velocityA);
        
        // Calculate tangent vector
        const normal = collision.normal;
        const tangent = relativeVelocity.subtract(normal.multiply(Vector2.dot(relativeVelocity, normal)));
        
        if (tangent.magnitudeSquared() < 0.001) return; // No tangential velocity
        
        tangent.normalize();
        
        // Calculate friction impulse
        const velocityAlongTangent = Vector2.dot(relativeVelocity, tangent);
        let frictionImpulseMagnitude = -velocityAlongTangent / (invMassA + invMassB);
        
        // Clamp friction impulse (Coulomb friction)
        const mu = collision.friction;
        if (Math.abs(frictionImpulseMagnitude) > normalImpulse * mu) {
            frictionImpulseMagnitude = -Math.sign(frictionImpulseMagnitude) * normalImpulse * mu;
        }
        
        const frictionImpulse = tangent.multiply(frictionImpulseMagnitude);
        
        // Apply friction impulse
        if (rigidbodyA && rigidbodyA.bodyType === 'dynamic') {
            const velocityChangeA = frictionImpulse.multiply(-invMassA);
            rigidbodyA.velocity = rigidbodyA.velocity.add(velocityChangeA);
        }
        
        if (rigidbodyB && rigidbodyB.bodyType === 'dynamic') {
            const velocityChangeB = frictionImpulse.multiply(invMassB);
            rigidbodyB.velocity = rigidbodyB.velocity.add(velocityChangeB);
        }
    }

    private updatePositions(deltaTime: number): void {
        this.rigidbodies.forEach(rigidbody => {
            if (rigidbody.bodyType === 'dynamic' || rigidbody.bodyType === 'kinematic') {
                rigidbody.updatePosition(deltaTime);
            }
        });
    }

    private resolvePositionConstraints(): void {
        this.activeCollisions.forEach(collision => {
            if (!collision.isTrigger && collision.depth > 0) {
                this.resolveCollisionPosition(collision);
            }
        });
    }

    private resolveCollisionPosition(collision: CollisionInfo): void {
        const rigidbodyA = collision.gameObjectA.getComponent(class Rigidbody2D {});
        const rigidbodyB = collision.gameObjectB.getComponent(class Rigidbody2D {});
        
        if (!rigidbodyA && !rigidbodyB) return;
        
        const invMassA = rigidbodyA?.getInverseMass() || 0;
        const invMassB = rigidbodyB?.getInverseMass() || 0;
        
        if (invMassA + invMassB === 0) return; // Both objects are static
        
        // Position correction to prevent sinking
        const percent = 0.8; // Position correction percentage
        const slop = 0.01; // Allowable penetration
        const correctionMagnitude = Math.max(collision.depth - slop, 0) / (invMassA + invMassB) * percent;
        const correction = collision.normal.multiply(correctionMagnitude);
        
        if (rigidbodyA && rigidbodyA.bodyType === 'dynamic') {
            const correctionA = correction.multiply(-invMassA);
            rigidbodyA.correctPosition(correctionA);
        }
        
        if (rigidbodyB && rigidbodyB.bodyType === 'dynamic') {
            const correctionB = correction.multiply(invMassB);
            rigidbodyB.correctPosition(correctionB);
        }
    }

    private interpolateTransforms(_alpha: number): void {
        // Smooth interpolation for rendering
        // Will implement when we have transform integration
    }

    private updateAllSpatialGrids(): void {
        if (!this.settings.enableSpatialPartitioning) return;
        
        this.spatialGrid.clear();
        this.colliders.forEach(collider => {
            this.updateSpatialGrid(collider);
        });
    }

    private updateSpatialGrid(collider: any): void {
        if (!this.settings.enableSpatialPartitioning) return;
        
        // Get collider bounds
        const bounds = collider.bounds;
        if (!bounds) return;
        
        // Calculate grid cells this collider spans
        const minX = Math.floor(bounds.min.x / this.gridCellSize);
        const minY = Math.floor(bounds.min.y / this.gridCellSize);
        const maxX = Math.floor(bounds.max.x / this.gridCellSize);
        const maxY = Math.floor(bounds.max.y / this.gridCellSize);
        
        // Add to relevant cells
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const cellKey = `${x},${y}`;
                if (!this.spatialGrid.has(cellKey)) {
                    this.spatialGrid.set(cellKey, new Set());
                }
                this.spatialGrid.get(cellKey)!.add(collider);
            }
        }
    }

    private removeFromSpatialGrid(collider: any): void {
        this.spatialGrid.forEach(cellColliders => {
            cellColliders.delete(collider);
        });
    }

    private processCollisionEvents(): void {
        this.activeCollisions.forEach(collision => {
            if (collision.isNewCollision) {
                if (collision.isTrigger) {
                    this.emit('triggerEnter', collision);
                } else {
                    this.emit('collisionEnter', collision);
                }
            } else {
                if (collision.isTrigger) {
                    this.emit('triggerStay', collision);
                } else {
                    this.emit('collisionStay', collision);
                }
            }
        });
        
        // Handle collision exits (tracked in updateCollisionTracking)
    }

    // Public API methods
    public raycast(origin: Vector2, direction: Vector2, distance: number = Infinity): RaycastHit | null {
        // Will implement when we have collider shapes
        return null;
    }

    public raycastAll(origin: Vector2, direction: Vector2, distance: number = Infinity): RaycastHit[] {
        // Will implement when we have collider shapes
        return [];
    }

    public overlapPoint(point: Vector2): GameObject[] {
        // Will implement when we have collider shapes
        return [];
    }

    public overlapCircle(center: Vector2, radius: number): GameObject[] {
        // Will implement when we have collider shapes
        return [];
    }

    public overlapBox(center: Vector2, size: Vector2, angle: number = 0): GameObject[] {
        // Will implement when we have collider shapes
        return [];
    }

    // Settings and configuration
    public setGravity(gravity: Vector2): void {
        this.settings.gravity = gravity.clone();
    }

    public getGravity(): Vector2 {
        return this.settings.gravity.clone();
    }

    public setTimeStep(timeStep: number): void {
        this.settings.timeStep = Math.max(0.001, timeStep);
    }

    // Debug and statistics
    public getActiveCollisionCount(): number {
        return this.activeCollisions.size;
    }

    public getRigidbodyCount(): number {
        return this.rigidbodies.size;
    }

    public getColliderCount(): number {
        return this.colliders.size;
    }

    public getFrameCount(): number {
        return this.frameCount;
    }

    // Cleanup
    public destroy(): void {
        this.rigidbodies.clear();
        this.colliders.clear();
        this.collisionPairs.clear();
        this.activeCollisions.clear();
        this.spatialGrid.clear();
        this.removeAllListeners();
        Physics2DWorld._instance = null;
    }
}