import { Scene } from './Scene';
import { Time } from './Time';
import { Input } from './Input';
import { Renderer } from '../rendering/Renderer';
import { EventEmitter } from '../utils/EventEmitter';
import { SpriteRenderer } from '../components/SpriteRenderer';
import { TweenManager } from '../animation/Tween';

export interface EngineConfig {
    canvas?: HTMLCanvasElement;
    width?: number;
    height?: number;
    backgroundColor?: string;
    targetFPS?: number;
    enableVSync?: boolean;
}

export class Engine extends EventEmitter {
    private static _instance: Engine | null = null;
    
    private canvas: HTMLCanvasElement;
    private renderer: Renderer;
    private currentScene: Scene | null = null;
    private isRunning: boolean = false;
    private isPaused: boolean = false;
    private targetFPS: number = 60;
    private frameInterval: number;
    private lastFrameTime: number = 0;
    private animationFrameId: number | null = null;

    private constructor(config: EngineConfig = {}) {
        super();
        
        this.canvas = config.canvas || this.createCanvas(config.width || 800, config.height || 600);
        this.renderer = new Renderer(this.canvas);
        this.targetFPS = config.targetFPS || 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        if (config.backgroundColor) {
            this.renderer.setBackgroundColor(config.backgroundColor);
        }
        
        this.setupEngine();
    }

    public static createInstance(config: EngineConfig = {}): Engine {
        if (Engine._instance) {
            throw new Error('Engine instance already exists. Use Engine.getInstance() instead.');
        }
        
        Engine._instance = new Engine(config);
        return Engine._instance;
    }

    public static getInstance(): Engine {
        if (!Engine._instance) {
            throw new Error('Engine not initialized. Call Engine.createInstance() first.');
        }
        return Engine._instance;
    }

    public static get isInitialized(): boolean {
        return Engine._instance !== null;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getRenderer(): Renderer {
        return this.renderer;
    }

    public getCurrentScene(): Scene | null {
        return this.currentScene;
    }

    public setScene(scene: Scene): void {
        if (this.currentScene) {
            this.currentScene.unload();
            this.emit('sceneUnloaded', this.currentScene);
        }
        
        this.currentScene = scene;
        
        if (this.isRunning) {
            scene.start();
        }
        
        this.emit('sceneLoaded', scene);
    }

    public start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        Time.reset();
        
        if (this.currentScene && !this.currentScene.isStarted) {
            this.currentScene.start();
        }
        
        this.lastFrameTime = performance.now();
        this.gameLoop();
        
        this.emit('engineStarted');
    }

    public pause(): void {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        Time.pause();
        this.emit('enginePaused');
    }

    public resume(): void {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        Time.resume();
        this.lastFrameTime = performance.now();
        this.emit('engineResumed');
    }

    public stop(): void {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        if (this.currentScene) {
            this.currentScene.unload();
        }
        
        this.emit('engineStopped');
    }

    public setTargetFPS(fps: number): void {
        this.targetFPS = Math.max(1, fps);
        this.frameInterval = 1000 / this.targetFPS;
    }

    public getTargetFPS(): number {
        return this.targetFPS;
    }

    public getCurrentFPS(): number {
        return Time.fps;
    }

    public resize(width: number, height: number): void {
        this.renderer.resize(width, height);
        this.emit('engineResized', { width, height });
    }

    public destroy(): void {
        this.stop();
        
        if (this.currentScene) {
            this.currentScene.unload();
        }
        
        this.removeAllListeners();
        Engine._instance = null;
        
        this.emit('engineDestroyed');
    }

    private setupEngine(): void {
        Input.initialize(this.canvas);
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
        
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
    }

    private createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(canvas);
            });
        } else {
            document.body.appendChild(canvas);
        }
        
        return canvas;
    }

    private gameLoop(): void {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime >= this.frameInterval) {
            this.update();
            this.render();
            this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    private update(): void {
        if (this.isPaused) return;
        
        Time.update();
        Input.update();
        TweenManager.getInstance().update(Time.deltaTime);
        
        if (this.currentScene) {
            this.currentScene.update();
        }
        
        this.emit('engineUpdate');
    }

    private render(): void {
        this.renderer.clear();
        this.renderer.begin();
        
        if (this.currentScene) {
            this.renderScene(this.currentScene);
        }
        
        this.renderer.end();
        this.emit('engineRender');
    }

    private renderScene(scene: Scene): void {
        const gameObjects = scene.getAllGameObjects();
        
        const renderableObjects: Array<{ gameObject: any; spriteRenderer: any; sortingOrder: number }> = [];
        
        gameObjects.forEach(gameObject => {
            if (gameObject.active) {
                const spriteRenderer = gameObject.getComponent(SpriteRenderer);
                if (spriteRenderer && spriteRenderer.visible) {
                    renderableObjects.push({
                        gameObject,
                        spriteRenderer,
                        sortingOrder: spriteRenderer.sortingOrder || 0
                    });
                }
            }
        });
        
        renderableObjects.sort((a, b) => a.sortingOrder - b.sortingOrder);
        
        renderableObjects.forEach(({ spriteRenderer }) => {
            spriteRenderer.render();
        });
    }

    private onWindowResize(): void {
        if (this.canvas.style.width === '100%' || this.canvas.style.height === '100%') {
            const rect = this.canvas.getBoundingClientRect();
            this.resize(rect.width, rect.height);
        }
    }

    private onBeforeUnload(): void {
        this.stop();
    }

    private onVisibilityChange(): void {
        if (document.hidden) {
            if (this.isRunning && !this.isPaused) {
                this.pause();
            }
        } else {
            if (this.isRunning && this.isPaused) {
                this.resume();
            }
        }
    }
}