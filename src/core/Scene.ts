import { GameObject } from './GameObject';
import { EventEmitter } from '../utils/EventEmitter';
import { Component } from './Component';

export class Scene extends EventEmitter {
    public name: string;
    public active: boolean = true;
    private gameObjects: GameObject[] = [];
    private gameObjectsToAdd: GameObject[] = [];
    private gameObjectsToRemove: GameObject[] = [];
    private _isStarted: boolean = false;

    constructor(name: string = 'Scene') {
        super();
        this.name = name;
    }

    public get isStarted(): boolean {
        return this._isStarted;
    }

    public get objectCount(): number {
        return this.gameObjects.length;
    }

    public addGameObject(gameObject: GameObject): void {
        if (gameObject.scene === this) return;
        
        if (gameObject.scene) {
            gameObject.scene.removeGameObject(gameObject);
        }
        
        gameObject.scene = this;
        this.gameObjectsToAdd.push(gameObject);
        
        this.emit('gameObjectAdded', gameObject);
    }

    public removeGameObject(gameObject: GameObject): boolean {
        if (gameObject.scene !== this) return false;
        
        gameObject.scene = null;
        this.gameObjectsToRemove.push(gameObject);
        
        this.emit('gameObjectRemoved', gameObject);
        return true;
    }

    public findGameObject(name: string): GameObject | null {
        return this.gameObjects.find(obj => obj.name === name && !obj.destroyed) || null;
    }

    public findGameObjects(name: string): GameObject[] {
        return this.gameObjects.filter(obj => obj.name === name && !obj.destroyed);
    }

    public findGameObjectById(id: number): GameObject | null {
        return this.gameObjects.find(obj => obj.id === id && !obj.destroyed) || null;
    }

    public findGameObjectsWithComponent<T extends Component>(componentClass: new (...args: any[]) => T): GameObject[] {
        return this.gameObjects.filter(obj => 
            !obj.destroyed && obj.getComponent(componentClass) !== null
        );
    }

    public getAllGameObjects(): readonly GameObject[] {
        return this.gameObjects.filter(obj => !obj.destroyed);
    }

    public createGameObject(name?: string): GameObject {
        const gameObject = new GameObject(name);
        this.addGameObject(gameObject);
        return gameObject;
    }

    public destroyGameObject(gameObject: GameObject): void {
        if (gameObject.scene === this) {
            gameObject.destroy();
        }
    }

    public destroyAllGameObjects(): void {
        const objectsCopy = [...this.gameObjects];
        objectsCopy.forEach(obj => obj.destroy());
    }

    public start(): void {
        if (this._isStarted) return;
        
        this._isStarted = true;
        
        this.gameObjects.forEach(obj => {
            if (!obj.destroyed) {
                obj.awake();
            }
        });
        
        this.gameObjects.forEach(obj => {
            if (!obj.destroyed && obj.active) {
                obj.start();
            }
        });
        
        this.emit('sceneStarted');
    }

    public update(): void {
        if (!this.active) return;
        
        this.processGameObjectChanges();
        
        this.gameObjects.forEach(obj => {
            if (!obj.destroyed && obj.active) {
                obj.update();
            }
        });
        
        this.gameObjects.forEach(obj => {
            if (!obj.destroyed && obj.active) {
                obj.lateUpdate();
            }
        });
        
        this.processGameObjectChanges();
    }

    private processGameObjectChanges(): void {
        if (this.gameObjectsToAdd.length > 0) {
            this.gameObjectsToAdd.forEach(obj => {
                this.gameObjects.push(obj);
                
                if (this._isStarted && !obj.destroyed) {
                    obj.awake();
                    if (obj.active) {
                        obj.start();
                    }
                }
            });
            this.gameObjectsToAdd.length = 0;
        }
        
        if (this.gameObjectsToRemove.length > 0) {
            this.gameObjectsToRemove.forEach(obj => {
                const index = this.gameObjects.indexOf(obj);
                if (index !== -1) {
                    this.gameObjects.splice(index, 1);
                }
            });
            this.gameObjectsToRemove.length = 0;
        }
        
        this.gameObjects = this.gameObjects.filter(obj => !obj.destroyed);
    }

    public unload(): void {
        this.destroyAllGameObjects();
        this.processGameObjectChanges();
        this._isStarted = false;
        this.emit('sceneUnloaded');
    }

    public serialize(): any {
        return {
            name: this.name,
            active: this.active,
            gameObjects: this.gameObjects.map(obj => ({
                id: obj.id,
                name: obj.name,
                active: obj.active,
                transform: {
                    position: obj.transform.position,
                    rotation: obj.transform.rotation,
                    scale: obj.transform.scale
                }
            }))
        };
    }
}