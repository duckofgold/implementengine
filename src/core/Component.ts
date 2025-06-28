import { GameObject } from './GameObject';

export abstract class Component {
    public gameObject: GameObject | null = null;
    public enabled: boolean = true;
    private _destroyed: boolean = false;

    public get destroyed(): boolean {
        return this._destroyed;
    }

    public get transform(): import('../components/Transform').Transform | null {
        return this.gameObject?.transform || null;
    }

    public awake(): void {}

    public start(): void {}

    public update(): void {}

    public lateUpdate(): void {}

    public onDestroy(): void {}

    public destroy(): void {
        if (this._destroyed) return;
        
        this._destroyed = true;
        this.onDestroy();
        
        if (this.gameObject) {
            this.gameObject.removeComponent(this);
        }
    }

    public getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | null {
        return this.gameObject?.getComponent(componentClass) || null;
    }

    public getComponents<T extends Component>(componentClass: new (...args: any[]) => T): T[] {
        return this.gameObject?.getComponents(componentClass) || [];
    }

    public addComponent<T extends Component>(componentClass: new (...args: any[]) => T, ...args: any[]): T {
        if (!this.gameObject) {
            throw new Error('Cannot add component: GameObject is null');
        }
        return this.gameObject.addComponent(componentClass, ...args);
    }
}