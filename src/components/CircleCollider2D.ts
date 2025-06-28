import { Collider2D, Bounds2D, RaycastHit2D, ColliderSeparation2D, CollisionDetection2D } from './Collider2D';
import { Vector2 } from '../utils/Vector2';
import { BoxCollider2D } from './BoxCollider2D';

export class CircleCollider2D extends Collider2D {
    public radius: number = 0.5;

    constructor(radius?: number) {
        super();
        if (radius !== undefined) {
            this.radius = Math.max(0, radius);
        }
    }

    public containsPoint(point: Vector2): boolean {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const scaledRadius = this.radius * Math.max(worldScale.x, worldScale.y);
        
        return CollisionDetection2D.pointInCircle(point, worldPos, scaledRadius);
    }

    public getClosestPoint(point: Vector2): Vector2 {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const scaledRadius = this.radius * Math.max(worldScale.x, worldScale.y);
        
        const direction = point.subtract(worldPos);
        const distance = direction.magnitude();
        
        if (distance <= scaledRadius) {
            // Point is inside circle, return the point itself
            return point.clone();
        }
        
        // Point is outside, return closest point on circle surface
        const normalizedDirection = direction.divide(distance);
        return worldPos.add(normalizedDirection.multiply(scaledRadius));
    }

    public computeBounds(): Bounds2D {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const scaledRadius = this.radius * Math.max(worldScale.x, worldScale.y);
        const diameter = scaledRadius * 2;
        
        return this.createBounds(worldPos, new Vector2(diameter, diameter));
    }

    protected detailedOverlap(other: Collider2D): boolean {
        if (other instanceof CircleCollider2D) {
            return this.circleVsCircle(other);
        } else if (other instanceof BoxCollider2D) {
            return this.circleVsBox(other);
        }
        
        // For unknown collider types, use point-in-shape test
        return other.containsPoint(this.worldPosition) || this.containsPoint(other.worldPosition);
    }

    private circleVsCircle(other: CircleCollider2D): boolean {
        const thisWorldPos = this.worldPosition;
        const thisWorldScale = this.worldScale;
        const thisScaledRadius = this.radius * Math.max(thisWorldScale.x, thisWorldScale.y);
        
        const otherWorldPos = other.worldPosition;
        const otherWorldScale = other.worldScale;
        const otherScaledRadius = other.radius * Math.max(otherWorldScale.x, otherWorldScale.y);
        
        const result = CollisionDetection2D.circleVsCircle(
            thisWorldPos, thisScaledRadius,
            otherWorldPos, otherScaledRadius
        );
        
        return result !== null;
    }

    private circleVsBox(box: BoxCollider2D): boolean {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const scaledRadius = this.radius * Math.max(worldScale.x, worldScale.y);
        
        const boxWorldPos = box.worldPosition;
        const boxWorldScale = box.worldScale;
        const boxScaledSize = new Vector2(box.size.x * boxWorldScale.x, box.size.y * boxWorldScale.y);
        
        const result = CollisionDetection2D.circleVsBox(
            worldPos, scaledRadius,
            boxWorldPos, boxScaledSize, box.worldRotation
        );
        
        return result !== null;
    }

    protected computeSeparation(other: Collider2D): ColliderSeparation2D {
        if (other instanceof CircleCollider2D) {
            const thisWorldPos = this.worldPosition;
            const thisWorldScale = this.worldScale;
            const thisScaledRadius = this.radius * Math.max(thisWorldScale.x, thisWorldScale.y);
            
            const otherWorldPos = other.worldPosition;
            const otherWorldScale = other.worldScale;
            const otherScaledRadius = other.radius * Math.max(otherWorldScale.x, otherWorldScale.y);
            
            const result = CollisionDetection2D.circleVsCircle(
                thisWorldPos, thisScaledRadius,
                otherWorldPos, otherScaledRadius
            );
            
            return result || {
                pointA: thisWorldPos,
                pointB: otherWorldPos,
                normal: Vector2.right,
                depth: 0
            };
        } else if (other instanceof BoxCollider2D) {
            const worldPos = this.worldPosition;
            const worldScale = this.worldScale;
            const scaledRadius = this.radius * Math.max(worldScale.x, worldScale.y);
            
            const boxWorldPos = other.worldPosition;
            const boxWorldScale = other.worldScale;
            const boxScaledSize = new Vector2(other.size.x * boxWorldScale.x, other.size.y * boxWorldScale.y);
            
            const result = CollisionDetection2D.circleVsBox(
                worldPos, scaledRadius,
                boxWorldPos, boxScaledSize, other.worldRotation
            );
            
            return result || {
                pointA: worldPos,
                pointB: boxWorldPos,
                normal: Vector2.right,
                depth: 0
            };
        }
        
        // Fallback
        return {
            pointA: this.worldPosition,
            pointB: other.worldPosition,
            normal: Vector2.right,
            depth: 0
        };
    }

    public raycast(origin: Vector2, direction: Vector2, distance: number): RaycastHit2D | null {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const scaledRadius = this.radius * Math.max(worldScale.x, worldScale.y);
        
        const normalizedDirection = direction.normalized();
        const toCircle = worldPos.subtract(origin);
        
        // Project toCircle onto ray direction
        const projection = Vector2.dot(toCircle, normalizedDirection);
        
        // Find closest point on ray to circle center
        const closestPointOnRay = origin.add(normalizedDirection.multiply(projection));
        const distanceToCenter = worldPos.distance(closestPointOnRay);
        
        // Check if ray intersects circle
        if (distanceToCenter > scaledRadius) {
            return null; // Ray misses circle
        }
        
        // Calculate intersection points
        const halfChord = Math.sqrt(scaledRadius * scaledRadius - distanceToCenter * distanceToCenter);
        const t1 = projection - halfChord;
        const t2 = projection + halfChord;
        
        // Choose the closest intersection that's within distance and in front of ray
        let hitDistance = -1;
        if (t1 >= 0 && t1 <= distance) {
            hitDistance = t1;
        } else if (t2 >= 0 && t2 <= distance) {
            hitDistance = t2;
        }
        
        if (hitDistance < 0) {
            return null; // No valid intersection
        }
        
        const hitPoint = origin.add(normalizedDirection.multiply(hitDistance));
        const normal = hitPoint.subtract(worldPos).normalized();
        
        return {
            collider: this,
            point: hitPoint,
            normal: normal,
            distance: hitDistance,
            fraction: hitDistance / distance
        };
    }

    // Utility methods
    public setRadius(radius: number): void {
        this.radius = Math.max(0, radius);
        this.invalidateBounds();
    }

    public getRadius(): number {
        return this.radius;
    }

    public getWorldRadius(): number {
        const worldScale = this.worldScale;
        return this.radius * Math.max(worldScale.x, worldScale.y);
    }

    // Get points on the circle circumference
    public getCircumferencePoint(angle: number): Vector2 {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const scaledRadius = this.radius * Math.max(worldScale.x, worldScale.y);
        
        const x = Math.cos(angle) * scaledRadius;
        const y = Math.sin(angle) * scaledRadius;
        
        return worldPos.add(new Vector2(x, y));
    }

    public getCircumferencePoints(segments: number = 16): Vector2[] {
        const points: Vector2[] = [];
        const angleStep = (Math.PI * 2) / segments;
        
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep;
            points.push(this.getCircumferencePoint(angle));
        }
        
        return points;
    }

    // Area and circumference calculations
    public getArea(): number {
        const worldRadius = this.getWorldRadius();
        return Math.PI * worldRadius * worldRadius;
    }

    public getCircumference(): number {
        const worldRadius = this.getWorldRadius();
        return 2 * Math.PI * worldRadius;
    }

    public drawGizmos(): void {
        // Debug visualization will be implemented with debug renderer
        // For now, this is a placeholder
    }
}