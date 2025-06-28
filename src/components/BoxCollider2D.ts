import { Collider2D, Bounds2D, RaycastHit2D, ColliderSeparation2D, CollisionDetection2D } from './Collider2D';
import { Vector2 } from '../utils/Vector2';
import { CircleCollider2D } from './CircleCollider2D';

export class BoxCollider2D extends Collider2D {
    public size: Vector2 = new Vector2(1, 1);

    constructor(size?: Vector2) {
        super();
        if (size) {
            this.size = size.clone();
        }
    }

    public containsPoint(point: Vector2): boolean {
        const worldPos = this.worldPosition;
        const worldRot = this.worldRotation;
        const worldScale = this.worldScale;
        const scaledSize = new Vector2(this.size.x * worldScale.x, this.size.y * worldScale.y);
        
        return CollisionDetection2D.pointInBox(point, worldPos, scaledSize, worldRot);
    }

    public getClosestPoint(point: Vector2): Vector2 {
        const worldPos = this.worldPosition;
        const worldRot = this.worldRotation;
        const worldScale = this.worldScale;
        const scaledSize = new Vector2(this.size.x * worldScale.x, this.size.y * worldScale.y);
        const halfSize = scaledSize.multiply(0.5);

        // Transform point to box local space
        let localPoint = point.subtract(worldPos);
        
        if (worldRot !== 0) {
            const cos = Math.cos(-worldRot);
            const sin = Math.sin(-worldRot);
            const rotatedX = localPoint.x * cos - localPoint.y * sin;
            const rotatedY = localPoint.x * sin + localPoint.y * cos;
            localPoint = new Vector2(rotatedX, rotatedY);
        }

        // Clamp to box bounds
        const closest = new Vector2(
            Math.max(-halfSize.x, Math.min(halfSize.x, localPoint.x)),
            Math.max(-halfSize.y, Math.min(halfSize.y, localPoint.y))
        );

        // Transform back to world space
        if (worldRot !== 0) {
            const cos = Math.cos(worldRot);
            const sin = Math.sin(worldRot);
            const rotatedX = closest.x * cos - closest.y * sin;
            const rotatedY = closest.x * sin + closest.y * cos;
            closest.set(rotatedX, rotatedY);
        }

        return worldPos.add(closest);
    }

    public computeBounds(): Bounds2D {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const scaledSize = new Vector2(this.size.x * worldScale.x, this.size.y * worldScale.y);
        
        // For rotated boxes, compute AABB that encompasses the rotated box
        if (this.worldRotation !== 0) {
            const halfSize = scaledSize.multiply(0.5);
            const cos = Math.abs(Math.cos(this.worldRotation));
            const sin = Math.abs(Math.sin(this.worldRotation));
            
            const rotatedWidth = halfSize.x * cos + halfSize.y * sin;
            const rotatedHeight = halfSize.x * sin + halfSize.y * cos;
            
            const expandedSize = new Vector2(rotatedWidth * 2, rotatedHeight * 2);
            return this.createBounds(worldPos, expandedSize);
        }
        
        return this.createBounds(worldPos, scaledSize);
    }

    protected detailedOverlap(other: Collider2D): boolean {
        if (other instanceof BoxCollider2D) {
            return this.boxVsBox(other);
        } else if (other instanceof CircleCollider2D) {
            return this.boxVsCircle(other);
        }
        
        // For unknown collider types, use point-in-shape test
        return other.containsPoint(this.worldPosition) || this.containsPoint(other.worldPosition);
    }

    private boxVsBox(other: BoxCollider2D): boolean {
        const thisWorldPos = this.worldPosition;
        const thisWorldScale = this.worldScale;
        const thisScaledSize = new Vector2(this.size.x * thisWorldScale.x, this.size.y * thisWorldScale.y);
        
        const otherWorldPos = other.worldPosition;
        const otherWorldScale = other.worldScale;
        const otherScaledSize = new Vector2(other.size.x * otherWorldScale.x, other.size.y * otherWorldScale.y);
        
        const result = CollisionDetection2D.boxVsBox(
            thisWorldPos, thisScaledSize, this.worldRotation,
            otherWorldPos, otherScaledSize, other.worldRotation
        );
        
        return result !== null;
    }

    private boxVsCircle(circle: CircleCollider2D): boolean {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const scaledSize = new Vector2(this.size.x * worldScale.x, this.size.y * worldScale.y);
        
        const circleWorldPos = circle.worldPosition;
        const circleWorldScale = circle.worldScale;
        const scaledRadius = circle.radius * Math.max(circleWorldScale.x, circleWorldScale.y);
        
        const result = CollisionDetection2D.circleVsBox(
            circleWorldPos, scaledRadius,
            worldPos, scaledSize, this.worldRotation
        );
        
        return result !== null;
    }

    protected computeSeparation(other: Collider2D): ColliderSeparation2D {
        if (other instanceof BoxCollider2D) {
            const thisWorldPos = this.worldPosition;
            const thisWorldScale = this.worldScale;
            const thisScaledSize = new Vector2(this.size.x * thisWorldScale.x, this.size.y * thisWorldScale.y);
            
            const otherWorldPos = other.worldPosition;
            const otherWorldScale = other.worldScale;
            const otherScaledSize = new Vector2(other.size.x * otherWorldScale.x, other.size.y * otherWorldScale.y);
            
            const result = CollisionDetection2D.boxVsBox(
                thisWorldPos, thisScaledSize, this.worldRotation,
                otherWorldPos, otherScaledSize, other.worldRotation
            );
            
            return result || {
                pointA: thisWorldPos,
                pointB: otherWorldPos,
                normal: Vector2.right,
                depth: 0
            };
        } else if (other instanceof CircleCollider2D) {
            const worldPos = this.worldPosition;
            const worldScale = this.worldScale;
            const scaledSize = new Vector2(this.size.x * worldScale.x, this.size.y * worldScale.y);
            
            const circleWorldPos = other.worldPosition;
            const circleWorldScale = other.worldScale;
            const scaledRadius = other.radius * Math.max(circleWorldScale.x, circleWorldScale.y);
            
            const result = CollisionDetection2D.circleVsBox(
                circleWorldPos, scaledRadius,
                worldPos, scaledSize, this.worldRotation
            );
            
            if (result) {
                // Flip normal for box perspective
                return {
                    pointA: result.pointB,
                    pointB: result.pointA,
                    normal: result.normal.multiply(-1),
                    depth: result.depth
                };
            }
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
        const scaledSize = new Vector2(this.size.x * worldScale.x, this.size.y * worldScale.y);
        const halfSize = scaledSize.multiply(0.5);
        
        // Transform ray to box local space
        let localOrigin = origin.subtract(worldPos);
        let localDirection = direction.normalized();
        
        if (this.worldRotation !== 0) {
            const cos = Math.cos(-this.worldRotation);
            const sin = Math.sin(-this.worldRotation);
            
            const rotatedOriginX = localOrigin.x * cos - localOrigin.y * sin;
            const rotatedOriginY = localOrigin.x * sin + localOrigin.y * cos;
            localOrigin = new Vector2(rotatedOriginX, rotatedOriginY);
            
            const rotatedDirX = localDirection.x * cos - localDirection.y * sin;
            const rotatedDirY = localDirection.x * sin + localDirection.y * cos;
            localDirection = new Vector2(rotatedDirX, rotatedDirY);
        }
        
        // AABB raycast in local space
        const invDir = new Vector2(
            localDirection.x !== 0 ? 1 / localDirection.x : Infinity,
            localDirection.y !== 0 ? 1 / localDirection.y : Infinity
        );
        
        const t1 = (-halfSize.x - localOrigin.x) * invDir.x;
        const t2 = (halfSize.x - localOrigin.x) * invDir.x;
        const t3 = (-halfSize.y - localOrigin.y) * invDir.y;
        const t4 = (halfSize.y - localOrigin.y) * invDir.y;
        
        const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
        const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
        
        if (tmax < 0 || tmin > tmax || tmin > distance) {
            return null; // No intersection
        }
        
        const hitDistance = tmin >= 0 ? tmin : tmax;
        if (hitDistance > distance) return null;
        
        const localHitPoint = localOrigin.add(localDirection.multiply(hitDistance));
        
        // Compute normal
        let normal = Vector2.zero;
        const epsilon = 0.001;
        
        if (Math.abs(localHitPoint.x - halfSize.x) < epsilon) {
            normal = Vector2.right;
        } else if (Math.abs(localHitPoint.x + halfSize.x) < epsilon) {
            normal = Vector2.left;
        } else if (Math.abs(localHitPoint.y - halfSize.y) < epsilon) {
            normal = Vector2.down;
        } else if (Math.abs(localHitPoint.y + halfSize.y) < epsilon) {
            normal = Vector2.up;
        }
        
        // Transform normal back to world space
        if (this.worldRotation !== 0) {
            const cos = Math.cos(this.worldRotation);
            const sin = Math.sin(this.worldRotation);
            const rotatedNormalX = normal.x * cos - normal.y * sin;
            const rotatedNormalY = normal.x * sin + normal.y * cos;
            normal = new Vector2(rotatedNormalX, rotatedNormalY);
        }
        
        // Transform hit point back to world space
        let worldHitPoint = localHitPoint;
        if (this.worldRotation !== 0) {
            const cos = Math.cos(this.worldRotation);
            const sin = Math.sin(this.worldRotation);
            const rotatedX = worldHitPoint.x * cos - worldHitPoint.y * sin;
            const rotatedY = worldHitPoint.x * sin + worldHitPoint.y * cos;
            worldHitPoint = new Vector2(rotatedX, rotatedY);
        }
        worldHitPoint = worldHitPoint.add(worldPos);
        
        return {
            collider: this,
            point: worldHitPoint,
            normal: normal,
            distance: hitDistance,
            fraction: hitDistance / distance
        };
    }

    // Utility methods
    public setSize(width: number, height: number): void {
        this.size.set(width, height);
        this.invalidateBounds();
    }

    public getSize(): Vector2 {
        return this.size.clone();
    }

    public getWorldSize(): Vector2 {
        const worldScale = this.worldScale;
        return new Vector2(this.size.x * worldScale.x, this.size.y * worldScale.y);
    }

    // Get the four corners of the box in world space
    public getCorners(): Vector2[] {
        const worldPos = this.worldPosition;
        const worldScale = this.worldScale;
        const worldRot = this.worldRotation;
        const scaledSize = new Vector2(this.size.x * worldScale.x, this.size.y * worldScale.y);
        const halfSize = scaledSize.multiply(0.5);
        
        const corners = [
            new Vector2(-halfSize.x, -halfSize.y), // Bottom-left
            new Vector2(halfSize.x, -halfSize.y),  // Bottom-right
            new Vector2(halfSize.x, halfSize.y),   // Top-right
            new Vector2(-halfSize.x, halfSize.y)   // Top-left
        ];
        
        // Apply rotation and translation
        return corners.map(corner => {
            if (worldRot !== 0) {
                const cos = Math.cos(worldRot);
                const sin = Math.sin(worldRot);
                const rotatedX = corner.x * cos - corner.y * sin;
                const rotatedY = corner.x * sin + corner.y * cos;
                corner = new Vector2(rotatedX, rotatedY);
            }
            return worldPos.add(corner);
        });
    }

    public drawGizmos(): void {
        // Debug visualization will be implemented with debug renderer
        // For now, this is a placeholder
    }
}