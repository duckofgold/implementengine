export class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    static get zero(): Vector2 {
        return new Vector2(0, 0);
    }

    static get one(): Vector2 {
        return new Vector2(1, 1);
    }

    static get up(): Vector2 {
        return new Vector2(0, -1);
    }

    static get down(): Vector2 {
        return new Vector2(0, 1);
    }

    static get left(): Vector2 {
        return new Vector2(-1, 0);
    }

    static get right(): Vector2 {
        return new Vector2(1, 0);
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    set(x: number, y: number): Vector2 {
        this.x = x;
        this.y = y;
        return this;
    }

    add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    multiply(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Vector2 {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magnitudeSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    normalized(): Vector2 {
        const mag = this.magnitude();
        if (mag === 0) return Vector2.zero;
        return this.divide(mag);
    }

    normalize(): Vector2 {
        const mag = this.magnitude();
        if (mag === 0) return this;
        this.x /= mag;
        this.y /= mag;
        return this;
    }

    dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    distance(other: Vector2): number {
        return this.subtract(other).magnitude();
    }

    distanceSquared(other: Vector2): number {
        return this.subtract(other).magnitudeSquared();
    }

    lerp(other: Vector2, t: number): Vector2 {
        t = Math.max(0, Math.min(1, t));
        return new Vector2(
            this.x + (other.x - this.x) * t,
            this.y + (other.y - this.y) * t
        );
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle: number): Vector2 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    equals(other: Vector2, tolerance: number = 0.0001): boolean {
        return Math.abs(this.x - other.x) < tolerance && 
               Math.abs(this.y - other.y) < tolerance;
    }

    toString(): string {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    static distance(a: Vector2, b: Vector2): number {
        return a.distance(b);
    }

    static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
        return a.lerp(b, t);
    }

    static dot(a: Vector2, b: Vector2): number {
        return a.dot(b);
    }

    static fromAngle(angle: number, magnitude: number = 1): Vector2 {
        return new Vector2(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }
}