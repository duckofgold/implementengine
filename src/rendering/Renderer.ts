import { Vector2 } from '../utils/Vector2';
import { Camera } from './Camera';

export interface RenderOptions {
    fillStyle?: string | CanvasGradient | CanvasPattern;
    strokeStyle?: string | CanvasGradient | CanvasPattern;
    lineWidth?: number;
    alpha?: number;
}

export class Renderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private camera: Camera;
    private backgroundColor: string = '#2C3E50';

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        
        if (!context) {
            throw new Error('Failed to get 2D rendering context');
        }
        
        this.context = context;
        this.camera = new Camera();
        this.setupCanvas();
    }

    public get width(): number {
        return this.canvas.width;
    }

    public get height(): number {
        return this.canvas.height;
    }

    public get size(): Vector2 {
        return new Vector2(this.canvas.width, this.canvas.height);
    }

    public getCamera(): Camera {
        return this.camera;
    }

    public setCamera(camera: Camera): void {
        this.camera = camera;
    }

    public setBackgroundColor(color: string): void {
        this.backgroundColor = color;
    }

    public clear(): void {
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
    }

    public begin(): void {
        this.context.save();
        this.applyCamera();
    }

    public end(): void {
        this.context.restore();
    }

    public drawRect(position: Vector2, size: Vector2, options: RenderOptions = {}): void {
        this.applyRenderOptions(options);
        
        if (options.fillStyle) {
            this.context.fillRect(position.x, position.y, size.x, size.y);
        }
        
        if (options.strokeStyle) {
            this.context.strokeRect(position.x, position.y, size.x, size.y);
        }
    }

    public drawCircle(center: Vector2, radius: number, options: RenderOptions = {}): void {
        this.applyRenderOptions(options);
        
        this.context.beginPath();
        this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
        
        if (options.fillStyle) {
            this.context.fill();
        }
        
        if (options.strokeStyle) {
            this.context.stroke();
        }
    }

    public drawLine(start: Vector2, end: Vector2, options: RenderOptions = {}): void {
        this.applyRenderOptions(options);
        
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
    }

    public drawText(text: string, position: Vector2, options: RenderOptions & { 
        font?: string; 
        textAlign?: CanvasTextAlign; 
        textBaseline?: CanvasTextBaseline; 
    } = {}): void {
        this.applyRenderOptions(options);
        
        if (options.font) {
            this.context.font = options.font;
        }
        
        if (options.textAlign) {
            this.context.textAlign = options.textAlign;
        }
        
        if (options.textBaseline) {
            this.context.textBaseline = options.textBaseline;
        }
        
        if (options.fillStyle) {
            this.context.fillText(text, position.x, position.y);
        }
        
        if (options.strokeStyle) {
            this.context.strokeText(text, position.x, position.y);
        }
    }

    public drawImage(
        image: HTMLImageElement | HTMLCanvasElement, 
        position: Vector2, 
        size?: Vector2,
        sourceRect?: { x: number, y: number, width: number, height: number },
        options: RenderOptions = {}
    ): void {
        this.applyRenderOptions(options);
        
        if (sourceRect && size) {
            this.context.drawImage(
                image,
                sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
                position.x, position.y, size.x, size.y
            );
        } else if (size) {
            this.context.drawImage(image, position.x, position.y, size.x, size.y);
        } else {
            this.context.drawImage(image, position.x, position.y);
        }
    }

    public drawSprite(
        image: HTMLImageElement | HTMLCanvasElement,
        position: Vector2,
        rotation: number = 0,
        scale: Vector2 = Vector2.one,
        pivot: Vector2 = new Vector2(0.5, 0.5),
        sourceRect?: { x: number, y: number, width: number, height: number },
        options: RenderOptions = {}
    ): void {
        this.context.save();
        this.applyRenderOptions(options);
        
        const width = sourceRect ? sourceRect.width : image.width;
        const height = sourceRect ? sourceRect.height : image.height;
        
        const pivotX = width * pivot.x;
        const pivotY = height * pivot.y;
        
        this.context.translate(position.x, position.y);
        this.context.rotate(rotation);
        this.context.scale(scale.x, scale.y);
        
        if (sourceRect) {
            this.context.drawImage(
                image,
                sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
                -pivotX, -pivotY, width, height
            );
        } else {
            this.context.drawImage(image, -pivotX, -pivotY);
        }
        
        this.context.restore();
    }

    public worldToScreen(worldPosition: Vector2): Vector2 {
        return this.camera.worldToScreen(worldPosition, this.size);
    }

    public screenToWorld(screenPosition: Vector2): Vector2 {
        return this.camera.screenToWorld(screenPosition, this.size);
    }

    public resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    private setupCanvas(): void {
        this.canvas.style.imageRendering = 'pixelated';
        this.context.imageSmoothingEnabled = false;
    }

    private applyCamera(): void {
        const transform = this.camera.getTransformMatrix(this.size);
        this.context.setTransform(
            transform[0], transform[1], transform[2], 
            transform[3], transform[4], transform[5]
        );
    }

    private applyRenderOptions(options: RenderOptions): void {
        if (options.fillStyle) {
            this.context.fillStyle = options.fillStyle;
        }
        
        if (options.strokeStyle) {
            this.context.strokeStyle = options.strokeStyle;
        }
        
        if (options.lineWidth !== undefined) {
            this.context.lineWidth = options.lineWidth;
        }
        
        if (options.alpha !== undefined) {
            this.context.globalAlpha = options.alpha;
        }
    }
}