import { Vector2 } from '../utils/Vector2';

export class Camera {
    public position: Vector2 = Vector2.zero;
    public rotation: number = 0;
    public zoom: number = 1;
    public viewport: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 1, height: 1 };

    constructor(position?: Vector2, zoom: number = 1) {
        if (position) {
            this.position = position.clone();
        }
        this.zoom = zoom;
    }

    public setPosition(x: number, y: number): void;
    public setPosition(position: Vector2): void;
    public setPosition(xOrPosition: number | Vector2, y?: number): void {
        if (typeof xOrPosition === 'number') {
            this.position.set(xOrPosition, y!);
        } else {
            this.position.set(xOrPosition.x, xOrPosition.y);
        }
    }

    public translate(x: number, y: number): void;
    public translate(translation: Vector2): void;
    public translate(xOrTranslation: number | Vector2, y?: number): void {
        if (typeof xOrTranslation === 'number') {
            this.position.x += xOrTranslation;
            this.position.y += y!;
        } else {
            this.position.x += xOrTranslation.x;
            this.position.y += xOrTranslation.y;
        }
    }

    public setZoom(zoom: number): void {
        this.zoom = Math.max(0.1, zoom);
    }

    public setRotation(rotation: number): void {
        this.rotation = rotation;
    }

    public rotate(angle: number): void {
        this.rotation += angle;
    }

    public setViewport(x: number, y: number, width: number, height: number): void {
        this.viewport = { x, y, width, height };
    }

    public worldToScreen(worldPosition: Vector2, screenSize: Vector2): Vector2 {
        const screenCenter = new Vector2(
            screenSize.x * (this.viewport.x + this.viewport.width * 0.5),
            screenSize.y * (this.viewport.y + this.viewport.height * 0.5)
        );

        const relativePosition = worldPosition.subtract(this.position);
        
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const rotatedPosition = new Vector2(
            relativePosition.x * cos - relativePosition.y * sin,
            relativePosition.x * sin + relativePosition.y * cos
        );

        const scaledPosition = rotatedPosition.multiply(this.zoom);
        
        return screenCenter.add(scaledPosition);
    }

    public screenToWorld(screenPosition: Vector2, screenSize: Vector2): Vector2 {
        const screenCenter = new Vector2(
            screenSize.x * (this.viewport.x + this.viewport.width * 0.5),
            screenSize.y * (this.viewport.y + this.viewport.height * 0.5)
        );

        const relativePosition = screenPosition.subtract(screenCenter);
        const unscaledPosition = relativePosition.divide(this.zoom);
        
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const unrotatedPosition = new Vector2(
            unscaledPosition.x * cos - unscaledPosition.y * sin,
            unscaledPosition.x * sin + unscaledPosition.y * cos
        );

        return this.position.add(unrotatedPosition);
    }

    public getTransformMatrix(screenSize: Vector2): number[] {
        const screenCenter = new Vector2(
            screenSize.x * (this.viewport.x + this.viewport.width * 0.5),
            screenSize.y * (this.viewport.y + this.viewport.height * 0.5)
        );

        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);

        const a = this.zoom * cos;
        const b = this.zoom * sin;
        const c = this.zoom * (-sin);
        const d = this.zoom * cos;
        const e = screenCenter.x - (this.position.x * a + this.position.y * c);
        const f = screenCenter.y - (this.position.x * b + this.position.y * d);

        return [a, b, c, d, e, f];
    }

    public getBounds(screenSize: Vector2): { min: Vector2; max: Vector2 } {
        const corners = [
            new Vector2(0, 0),
            new Vector2(screenSize.x, 0),
            new Vector2(screenSize.x, screenSize.y),
            new Vector2(0, screenSize.y)
        ];

        const worldCorners = corners.map(corner => this.screenToWorld(corner, screenSize));
        
        let minX = worldCorners[0].x;
        let minY = worldCorners[0].y;
        let maxX = worldCorners[0].x;
        let maxY = worldCorners[0].y;

        for (let i = 1; i < worldCorners.length; i++) {
            const corner = worldCorners[i];
            minX = Math.min(minX, corner.x);
            minY = Math.min(minY, corner.y);
            maxX = Math.max(maxX, corner.x);
            maxY = Math.max(maxY, corner.y);
        }

        return {
            min: new Vector2(minX, minY),
            max: new Vector2(maxX, maxY)
        };
    }

    public followTarget(target: Vector2, speed: number = 1, deltaTime: number): void {
        const difference = target.subtract(this.position);
        const movement = difference.multiply(speed * deltaTime);
        this.position = this.position.add(movement);
    }

    public shake(intensity: number, duration: number): void {
        const originalPosition = this.position.clone();
        
        const shakeOffset = new Vector2(
            (Math.random() - 0.5) * intensity,
            (Math.random() - 0.5) * intensity
        );
        
        this.position = originalPosition.add(shakeOffset);
        
        setTimeout(() => {
            this.position = originalPosition;
        }, duration * 1000);
    }

    public clone(): Camera {
        const camera = new Camera(this.position, this.zoom);
        camera.rotation = this.rotation;
        camera.viewport = { ...this.viewport };
        return camera;
    }
}