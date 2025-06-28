import { Component } from './Component';
import { Transform } from '../components/Transform';
import { Scene } from './Scene';

export class GameObject {
    public name: string;
    public active: boolean = true;
    public scene: Scene | null = null;
    public readonly transform: Transform;

    private components: Component[] = [];
    private _destroyed: boolean = false;
    private static nextId: number = 1;
    public readonly id: number;

    constructor(name: string = 'GameObject') {
        this.id = GameObject.nextId++;
        this.name = name;
        this.transform = this.addComponent(Transform);
    }

    public get destroyed(): boolean {
        return this._destroyed;
    }

    public addComponent<T extends Component>(componentClass: new (...args: any[]) => T, ...args: any[]): T {
        if (this._destroyed) {
            throw new Error('Cannot add component to destroyed GameObject');
        }

        const component = new componentClass(...args);
        component.gameObject = this;
        this.components.push(component);

        if (this.scene?.isStarted) {
            component.awake();
            if (this.active && component.enabled) {
                component.start();
            }
        }

        return component;
    }

    public getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | null {
        for (const component of this.components) {
            if (component instanceof componentClass && !component.destroyed) {
                return component;
            }
        }
        return null;
    }

    public getComponents<T extends Component>(componentClass: new (...args: any[]) => T): T[] {
        const result: T[] = [];
        for (const component of this.components) {
            if (component instanceof componentClass && !component.destroyed) {
                result.push(component);
            }
        }
        return result;
    }

    public removeComponent<T extends Component>(component: T): boolean {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.gameObject = null;
            return true;
        }
        return false;
    }

    public removeComponentOfType<T extends Component>(componentClass: new (...args: any[]) => T): boolean {
        const component = this.getComponent(componentClass);
        if (component) {
            component.destroy();
            return true;
        }
        return false;
    }

    public setActive(active: boolean): void {
        if (this.active === active) return;
        
        this.active = active;
        
        if (this.scene?.isStarted) {
            if (active) {
                this.components.forEach(component => {
                    if (component.enabled && !component.destroyed) {
                        component.start();
                    }
                });
            }
        }
    }

    public awake(): void {
        if (this._destroyed) return;
        
        this.components.forEach(component => {
            if (!component.destroyed) {
                component.awake();
            }
        });
    }

    public start(): void {
        if (this._destroyed || !this.active) return;
        
        this.components.forEach(component => {
            if (component.enabled && !component.destroyed) {
                component.start();
            }
        });
    }

    public update(): void {
        if (this._destroyed || !this.active) return;
        
        this.components.forEach(component => {
            if (component.enabled && !component.destroyed) {
                component.update();
            }
        });
    }

    public lateUpdate(): void {
        if (this._destroyed || !this.active) return;
        
        this.components.forEach(component => {
            if (component.enabled && !component.destroyed) {
                component.lateUpdate();
            }
        });
    }

    public destroy(): void {
        if (this._destroyed) return;
        
        this._destroyed = true;
        
        const componentsCopy = [...this.components];
        componentsCopy.forEach(component => {
            if (!component.destroyed) {
                component.destroy();
            }
        });
        
        this.components.length = 0;
        
        if (this.scene) {
            this.scene.removeGameObject(this);
        }
    }

    public clone(): GameObject {
        const cloned = new GameObject(this.name + ' (Clone)');
        cloned.active = this.active;
        
        cloned.transform.position = this.transform.position;
        cloned.transform.rotation = this.transform.rotation;
        cloned.transform.scale = this.transform.scale;
        
        return cloned;
    }

    public toString(): string {
        return `GameObject(${this.name}, id: ${this.id})`;
    }
}