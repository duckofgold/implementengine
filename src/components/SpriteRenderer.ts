import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { Vector2 } from '../utils/Vector2';
import { RenderOptions } from '../rendering/Renderer';

export class SpriteRenderer extends Component {
    public sprite: HTMLImageElement | HTMLCanvasElement | null = null;
    public color: string = '#FFFFFF';
    public alpha: number = 1;
    public flipX: boolean = false;
    public flipY: boolean = false;
    public visible: boolean = true;
    public layer: number = 0;
    public pivot: Vector2 = new Vector2(0.5, 0.5);
    public size: Vector2 | null = null;
    public sourceRect: { x: number; y: number; width: number; height: number } | null = null;

    private _sortingOrder: number = 0;

    constructor(sprite?: HTMLImageElement | HTMLCanvasElement | string) {
        super();
        
        if (typeof sprite === 'string') {
            this.loadSprite(sprite);
        } else if (sprite) {
            this.sprite = sprite;
        }
    }

    public get sortingOrder(): number {
        return this._sortingOrder;
    }

    public set sortingOrder(value: number) {
        this._sortingOrder = value;
    }

    public get bounds(): { min: Vector2; max: Vector2 } | null {
        if (!this.sprite || !this.transform) {
            return null;
        }

        const width = this.size?.x || this.sprite.width;
        const height = this.size?.y || this.sprite.height;
        
        const worldPos = this.transform.worldPosition;
        const worldScale = this.transform.worldScale;
        
        const scaledWidth = width * worldScale.x;
        const scaledHeight = height * worldScale.y;
        
        const pivotOffsetX = scaledWidth * this.pivot.x;
        const pivotOffsetY = scaledHeight * this.pivot.y;
        
        const min = new Vector2(
            worldPos.x - pivotOffsetX,
            worldPos.y - pivotOffsetY
        );
        
        const max = new Vector2(
            min.x + scaledWidth,
            min.y + scaledHeight
        );

        return { min, max };
    }

    public async loadSprite(spriteName: string): Promise<void> {
        try {
            const { AssetLoader } = await import('../utils/AssetLoader');
            const loadedSprite = AssetLoader.getAsset<HTMLImageElement>(spriteName);
            
            if (loadedSprite) {
                this.sprite = loadedSprite;
            } else {
                console.warn(`Sprite "${spriteName}" not found in AssetLoader. Make sure to load it first.`);
            }
        } catch (error) {
            console.error(`Failed to load sprite "${spriteName}":`, error);
        }
    }

    public setSprite(sprite: HTMLImageElement | HTMLCanvasElement | null): void {
        this.sprite = sprite;
    }

    public setColor(color: string): void {
        this.color = color;
    }

    public setAlpha(alpha: number): void {
        this.alpha = Math.max(0, Math.min(1, alpha));
    }

    public setFlip(flipX: boolean, flipY: boolean): void {
        this.flipX = flipX;
        this.flipY = flipY;
    }

    public setSize(width: number, height: number): void {
        this.size = new Vector2(width, height);
    }

    public setSizeToSprite(): void {
        this.size = null;
    }

    public setSourceRect(x: number, y: number, width: number, height: number): void {
        this.sourceRect = { x, y, width, height };
    }

    public clearSourceRect(): void {
        this.sourceRect = null;
    }

    public setPivot(x: number, y: number): void {
        this.pivot.set(x, y);
    }

    public render(): void {
        if (!this.visible || !this.sprite || !this.transform || !this.enabled) {
            return;
        }

        try {
            const engine = Engine.getInstance();
            const renderer = engine.getRenderer();
            
            const worldPos = this.transform.worldPosition;
            const worldRot = this.transform.worldRotation;
            const worldScale = this.transform.worldScale;
            
            const scale = new Vector2(
                worldScale.x * (this.flipX ? -1 : 1),
                worldScale.y * (this.flipY ? -1 : 1)
            );
            
            const renderOptions: RenderOptions = {
                alpha: this.alpha
            };
            
            if (this.color !== '#FFFFFF') {
                renderOptions.fillStyle = this.color;
            }

            renderer.drawSprite(
                this.sprite,
                worldPos,
                worldRot,
                scale,
                this.pivot,
                this.sourceRect || undefined,
                renderOptions
            );
        } catch (error) {
            console.error('Error rendering sprite:', error);
        }
    }

    public isVisibleInCamera(): boolean {
        if (!this.visible || !this.sprite || !this.transform) {
            return false;
        }

        try {
            const engine = Engine.getInstance();
            const renderer = engine.getRenderer();
            const camera = renderer.getCamera();
            const cameraBounds = camera.getBounds(renderer.size);
            const spriteBounds = this.bounds;

            if (!spriteBounds) {
                return false;
            }

            return !(
                spriteBounds.max.x < cameraBounds.min.x ||
                spriteBounds.min.x > cameraBounds.max.x ||
                spriteBounds.max.y < cameraBounds.min.y ||
                spriteBounds.min.y > cameraBounds.max.y
            );
        } catch (error) {
            return true;
        }
    }

    public getPixelPerfectPosition(): Vector2 {
        if (!this.transform) {
            return Vector2.zero;
        }

        const worldPos = this.transform.worldPosition;
        return new Vector2(
            Math.floor(worldPos.x),
            Math.floor(worldPos.y)
        );
    }

    public clone(): SpriteRenderer {
        const cloned = new SpriteRenderer();
        cloned.sprite = this.sprite;
        cloned.color = this.color;
        cloned.alpha = this.alpha;
        cloned.flipX = this.flipX;
        cloned.flipY = this.flipY;
        cloned.visible = this.visible;
        cloned.layer = this.layer;
        cloned.pivot = this.pivot.clone();
        cloned.size = this.size?.clone() || null;
        cloned.sortingOrder = this.sortingOrder;
        cloned.sourceRect = this.sourceRect ? { ...this.sourceRect } : null;
        return cloned;
    }
}