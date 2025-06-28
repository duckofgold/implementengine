import { Component } from '../core/Component';
import { Vector2 } from '../utils/Vector2';

export class Transform extends Component {
    private _position: Vector2;
    private _rotation: number;
    private _scale: Vector2;
    private _parent: Transform | null = null;
    private _children: Transform[] = [];

    constructor(x: number = 0, y: number = 0, rotation: number = 0, scaleX: number = 1, scaleY: number = 1) {
        super();
        this._position = new Vector2(x, y);
        this._rotation = rotation;
        this._scale = new Vector2(scaleX, scaleY);
    }

    public get position(): Vector2 {
        return this._position.clone();
    }

    public set position(value: Vector2) {
        this._position.set(value.x, value.y);
    }

    public get localPosition(): Vector2 {
        return this._position.clone();
    }

    public set localPosition(value: Vector2) {
        this._position.set(value.x, value.y);
    }

    public get worldPosition(): Vector2 {
        if (!this._parent) {
            return this._position.clone();
        }
        
        const parentWorldPos = this._parent.worldPosition;
        const rotatedPos = this._position.rotate(this._parent.worldRotation);
        const scaledPos = new Vector2(
            rotatedPos.x * this._parent.worldScale.x,
            rotatedPos.y * this._parent.worldScale.y
        );
        
        return parentWorldPos.add(scaledPos);
    }

    public set worldPosition(value: Vector2) {
        if (!this._parent) {
            this._position.set(value.x, value.y);
            return;
        }
        
        const parentWorldPos = this._parent.worldPosition;
        const localPos = value.subtract(parentWorldPos);
        const unscaledPos = new Vector2(
            localPos.x / this._parent.worldScale.x,
            localPos.y / this._parent.worldScale.y
        );
        const unrotatedPos = unscaledPos.rotate(-this._parent.worldRotation);
        
        this._position.set(unrotatedPos.x, unrotatedPos.y);
    }

    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(value: number) {
        this._rotation = value;
    }

    public get localRotation(): number {
        return this._rotation;
    }

    public set localRotation(value: number) {
        this._rotation = value;
    }

    public get worldRotation(): number {
        if (!this._parent) {
            return this._rotation;
        }
        return this._parent.worldRotation + this._rotation;
    }

    public set worldRotation(value: number) {
        if (!this._parent) {
            this._rotation = value;
            return;
        }
        this._rotation = value - this._parent.worldRotation;
    }

    public get scale(): Vector2 {
        return this._scale.clone();
    }

    public set scale(value: Vector2) {
        this._scale.set(value.x, value.y);
    }

    public get localScale(): Vector2 {
        return this._scale.clone();
    }

    public set localScale(value: Vector2) {
        this._scale.set(value.x, value.y);
    }

    public get worldScale(): Vector2 {
        if (!this._parent) {
            return this._scale.clone();
        }
        
        const parentScale = this._parent.worldScale;
        return new Vector2(
            this._scale.x * parentScale.x,
            this._scale.y * parentScale.y
        );
    }

    public get parent(): Transform | null {
        return this._parent;
    }

    public get children(): readonly Transform[] {
        return this._children;
    }

    public setParent(parent: Transform | null): void {
        if (this._parent === parent) return;
        
        if (this._parent) {
            const index = this._parent._children.indexOf(this);
            if (index !== -1) {
                this._parent._children.splice(index, 1);
            }
        }
        
        this._parent = parent;
        
        if (parent) {
            parent._children.push(this);
        }
    }

    public translate(x: number, y: number): void;
    public translate(translation: Vector2): void;
    public translate(xOrTranslation: number | Vector2, y?: number): void {
        if (typeof xOrTranslation === 'number') {
            this._position.x += xOrTranslation;
            this._position.y += y!;
        } else {
            this._position.x += xOrTranslation.x;
            this._position.y += xOrTranslation.y;
        }
    }

    public rotate(angle: number): void {
        this._rotation += angle;
    }

    public lookAt(target: Vector2): void {
        const direction = target.subtract(this.worldPosition);
        this.worldRotation = direction.angle();
    }

    public transformPoint(point: Vector2): Vector2 {
        const scaledPoint = new Vector2(point.x * this._scale.x, point.y * this._scale.y);
        const rotatedPoint = scaledPoint.rotate(this._rotation);
        return this._position.add(rotatedPoint);
    }

    public inverseTransformPoint(point: Vector2): Vector2 {
        const translatedPoint = point.subtract(this._position);
        const unrotatedPoint = translatedPoint.rotate(-this._rotation);
        return new Vector2(unrotatedPoint.x / this._scale.x, unrotatedPoint.y / this._scale.y);
    }

    public onDestroy(): void {
        this.setParent(null);
        
        const childrenCopy = [...this._children];
        childrenCopy.forEach(child => child.setParent(null));
    }
}