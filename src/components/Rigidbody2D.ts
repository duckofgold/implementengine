import { Component } from '../core/Component';
import { Vector2 } from '../utils/Vector2';
import { Physics2DWorld } from '../physics/Physics2DWorld';
import { PhysicsMaterial2D } from '../physics/PhysicsMaterial2D';
import { Time } from '../core/Time';

export enum BodyType {
    Dynamic = 'dynamic',     // Affected by forces and collisions
    Kinematic = 'kinematic', // Moves via transform, affects dynamic bodies
    Static = 'static'        // Never moves, provides immovable collision
}

export class Rigidbody2D extends Component {
    // Body configuration
    public bodyType: BodyType = BodyType.Dynamic;
    public material: PhysicsMaterial2D = PhysicsMaterial2D.Default;
    
    // Physical properties
    public mass: number = 1;
    public drag: number = 0;
    public angularDrag: number = 0.05;
    public gravityScale: number = 1;
    
    // Constraints
    public freezeRotation: boolean = false;
    public freezePositionX: boolean = false;
    public freezePositionY: boolean = false;
    
    // Current physics state
    public velocity: Vector2 = Vector2.zero;
    public angularVelocity: number = 0;
    
    // Internal physics state
    private forces: Vector2 = Vector2.zero;
    private torque: number = 0;
    private inverseMass: number = 1;
    private inverseInertia: number = 1;
    
    // Previous frame data for interpolation
    private previousPosition: Vector2 = Vector2.zero;
    private previousRotation: number = 0;
    
    // Collision tracking
    private isGrounded: boolean = false;
    private groundNormal: Vector2 = Vector2.up;
    private contactCount: number = 0;
    
    // Sleeping/activation
    private isSleeping: boolean = false;
    private sleepTimer: number = 0;
    private readonly sleepThreshold: number = 0.5; // seconds
    private readonly sleepVelocityThreshold: number = 1; // pixels/second

    constructor(bodyType: BodyType = BodyType.Dynamic, mass: number = 1) {
        super();
        this.bodyType = bodyType;
        this.setMass(mass);
    }

    public awake(): void {
        // Register with physics world
        const physicsWorld = Physics2DWorld.getInstance();
        physicsWorld.addRigidbody(this);
        
        // Initialize previous state
        if (this.transform) {
            this.previousPosition = this.transform.position.clone();
            this.previousRotation = this.transform.rotation;
        }
    }

    public start(): void {
        this.updateMassData();
    }

    public onDestroy(): void {
        // Unregister from physics world
        const physicsWorld = Physics2DWorld.getInstance();
        physicsWorld.removeRigidbody(this);
    }

    // Mass and inertia management
    public setMass(mass: number): void {
        this.mass = Math.max(0.1, mass);
        this.updateMassData();
    }

    public getMass(): number {
        return this.bodyType === BodyType.Static ? Infinity : this.mass;
    }

    public getInverseMass(): number {
        return this.bodyType === BodyType.Static ? 0 : this.inverseMass;
    }

    public getInverseInertia(): number {
        return this.bodyType === BodyType.Static ? 0 : this.inverseInertia;
    }

    private updateMassData(): void {
        if (this.bodyType === BodyType.Static) {
            this.inverseMass = 0;
            this.inverseInertia = 0;
        } else {
            this.inverseMass = 1 / this.mass;
            // Simple inertia calculation (can be overridden by collider shapes)
            this.inverseInertia = 1 / (this.mass * 100); // Placeholder formula
        }
    }

    // Force and impulse application
    public addForce(force: Vector2, mode: ForceMode = ForceMode.Force): void {
        if (this.bodyType !== BodyType.Dynamic) return;
        
        switch (mode) {
            case ForceMode.Force:
                this.forces = this.forces.add(force);
                break;
            case ForceMode.Impulse:
                this.velocity = this.velocity.add(force.multiply(this.inverseMass));
                this.wakeUp();
                break;
            case ForceMode.Acceleration:
                this.forces = this.forces.add(force.multiply(this.mass));
                break;
            case ForceMode.VelocityChange:
                this.velocity = this.velocity.add(force);
                this.wakeUp();
                break;
        }
    }

    public addForceAtPosition(force: Vector2, position: Vector2, mode: ForceMode = ForceMode.Force): void {
        this.addForce(force, mode);
        
        if (!this.freezeRotation && this.transform) {
            const centerOfMass = this.transform.position;
            const torqueArm = position.subtract(centerOfMass);
            const torqueForce = this.crossProduct2D(torqueArm, force);
            this.addTorque(torqueForce, mode);
        }
    }

    public addTorque(torque: number, mode: ForceMode = ForceMode.Force): void {
        if (this.bodyType !== BodyType.Dynamic || this.freezeRotation) return;
        
        switch (mode) {
            case ForceMode.Force:
                this.torque += torque;
                break;
            case ForceMode.Impulse:
                this.angularVelocity += torque * this.inverseInertia;
                this.wakeUp();
                break;
            case ForceMode.Acceleration:
                this.torque += torque * this.inverseInertia;
                break;
            case ForceMode.VelocityChange:
                this.angularVelocity += torque;
                this.wakeUp();
                break;
        }
    }

    // Velocity methods
    public setVelocity(velocity: Vector2): void {
        if (this.bodyType === BodyType.Dynamic) {
            this.velocity = velocity.clone();
            this.wakeUp();
        }
    }

    public setAngularVelocity(angularVelocity: number): void {
        if (this.bodyType === BodyType.Dynamic && !this.freezeRotation) {
            this.angularVelocity = angularVelocity;
            this.wakeUp();
        }
    }

    public getVelocityAtPoint(point: Vector2): Vector2 {
        if (!this.transform) return Vector2.zero;
        
        const centerOfMass = this.transform.position;
        const radius = point.subtract(centerOfMass);
        const tangentialVelocity = new Vector2(-radius.y, radius.x).multiply(this.angularVelocity);
        
        return this.velocity.add(tangentialVelocity);
    }

    // Movement methods
    public movePosition(position: Vector2): void {
        if (this.transform && (this.bodyType === BodyType.Dynamic || this.bodyType === BodyType.Kinematic)) {
            if (!this.freezePositionX && !this.freezePositionY) {
                this.transform.position = position;
            } else {
                const newPos = this.transform.position.clone();
                if (!this.freezePositionX) newPos.x = position.x;
                if (!this.freezePositionY) newPos.y = position.y;
                this.transform.position = newPos;
            }
            this.wakeUp();
        }
    }

    public moveRotation(rotation: number): void {
        if (this.transform && !this.freezeRotation && 
            (this.bodyType === BodyType.Dynamic || this.bodyType === BodyType.Kinematic)) {
            this.transform.rotation = rotation;
            this.wakeUp();
        }
    }

    // Physics update methods (called by Physics2DWorld)
    public applyForces(deltaTime: number): void {
        if (this.bodyType !== BodyType.Dynamic || this.isSleeping) return;
        
        // Apply accumulated forces
        const acceleration = this.forces.multiply(this.inverseMass);
        this.velocity = this.velocity.add(acceleration.multiply(deltaTime));
        
        // Apply torque
        if (!this.freezeRotation) {
            const angularAcceleration = this.torque * this.inverseInertia;
            this.angularVelocity += angularAcceleration * deltaTime;
        }
        
        // Clear forces for next frame
        this.forces = Vector2.zero;
        this.torque = 0;
    }

    public updateVelocity(deltaTime: number): void {
        if (this.bodyType !== BodyType.Dynamic || this.isSleeping) return;
        
        // Apply drag
        const dragForce = this.velocity.multiply(-this.drag * this.mass);
        this.velocity = this.velocity.add(dragForce.multiply(deltaTime * this.inverseMass));
        
        // Apply angular drag
        if (!this.freezeRotation) {
            this.angularVelocity *= Math.pow(1 - this.angularDrag, deltaTime);
        }
        
        // Check for sleep conditions
        this.updateSleepState(deltaTime);
    }

    public updatePosition(deltaTime: number): void {
        if (this.bodyType === BodyType.Static || this.isSleeping || !this.transform) return;
        
        // Store previous state for interpolation
        this.previousPosition = this.transform.position.clone();
        this.previousRotation = this.transform.rotation;
        
        // Update position
        if (!this.freezePositionX || !this.freezePositionY) {
            const deltaPosition = this.velocity.multiply(deltaTime);
            const newPosition = this.transform.position.clone();
            
            if (!this.freezePositionX) newPosition.x += deltaPosition.x;
            if (!this.freezePositionY) newPosition.y += deltaPosition.y;
            
            this.transform.position = newPosition;
        }
        
        // Update rotation
        if (!this.freezeRotation) {
            this.transform.rotation += this.angularVelocity * deltaTime;
        }
    }

    // Collision response methods
    public applyImpulse(impulse: Vector2, contactPoint?: Vector2): void {
        if (this.bodyType !== BodyType.Dynamic) return;
        
        this.velocity = this.velocity.add(impulse.multiply(this.inverseMass));
        
        if (contactPoint && !this.freezeRotation && this.transform) {
            const centerOfMass = this.transform.position;
            const radius = contactPoint.subtract(centerOfMass);
            const angularImpulse = this.crossProduct2D(radius, impulse);
            this.angularVelocity += angularImpulse * this.inverseInertia;
        }
        
        this.wakeUp();
    }

    public correctPosition(correction: Vector2): void {
        if (this.bodyType === BodyType.Static || !this.transform) return;
        
        const correctionAmount = correction.multiply(this.inverseMass);
        
        if (!this.freezePositionX || !this.freezePositionY) {
            const newPosition = this.transform.position.clone();
            if (!this.freezePositionX) newPosition.x += correctionAmount.x;
            if (!this.freezePositionY) newPosition.y += correctionAmount.y;
            this.transform.position = newPosition;
        }
    }

    // Ground detection
    public setGrounded(grounded: boolean, normal: Vector2 = Vector2.up): void {
        this.isGrounded = grounded;
        this.groundNormal = normal.normalized();
    }

    public getIsGrounded(): boolean {
        return this.isGrounded;
    }

    public getGroundNormal(): Vector2 {
        return this.groundNormal.clone();
    }

    // Contact tracking
    public addContact(): void {
        this.contactCount++;
    }

    public removeContact(): void {
        this.contactCount = Math.max(0, this.contactCount - 1);
    }

    public getContactCount(): number {
        return this.contactCount;
    }

    // Sleep management
    public sleep(): void {
        this.isSleeping = true;
        this.velocity = Vector2.zero;
        this.angularVelocity = 0;
        this.forces = Vector2.zero;
        this.torque = 0;
    }

    public wakeUp(): void {
        this.isSleeping = false;
        this.sleepTimer = 0;
    }

    public getIsSleeping(): boolean {
        return this.isSleeping;
    }

    private updateSleepState(deltaTime: number): void {
        if (this.bodyType !== BodyType.Dynamic) return;
        
        const velocityMagnitude = this.velocity.magnitude();
        const angularVelocityMagnitude = Math.abs(this.angularVelocity);
        
        if (velocityMagnitude < this.sleepVelocityThreshold && 
            angularVelocityMagnitude < this.sleepVelocityThreshold) {
            this.sleepTimer += deltaTime;
            
            if (this.sleepTimer >= this.sleepThreshold) {
                this.sleep();
            }
        } else {
            this.sleepTimer = 0;
        }
    }

    // Utility methods
    private crossProduct2D(a: Vector2, b: Vector2): number {
        return a.x * b.y - a.y * b.x;
    }

    // Public getters for physics world
    public get transform() {
        return super.transform;
    }

    public get isKinematic(): boolean {
        return this.bodyType === BodyType.Kinematic;
    }

    public get isStatic(): boolean {
        return this.bodyType === BodyType.Static;
    }

    public get isDynamic(): boolean {
        return this.bodyType === BodyType.Dynamic;
    }
}

export enum ForceMode {
    Force = 'force',                    // Add continuous force (mass dependent)
    Impulse = 'impulse',               // Add instant impulse (mass dependent)
    Acceleration = 'acceleration',      // Add acceleration (mass independent)
    VelocityChange = 'velocityChange'   // Add velocity directly (mass independent)
}