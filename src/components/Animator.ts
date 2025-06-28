import { Component } from '../core/Component';
import { SpriteRenderer } from './SpriteRenderer';
import { SpriteAnimation, SpriteAnimationData } from '../animation/SpriteAnimation';
import { AnimationStateMachine, AnimationState } from '../animation/AnimationStateMachine';
import { TweenManager } from '../animation/Tween';
import { Time } from '../core/Time';
import { EventEmitter } from '../utils/EventEmitter';

export class Animator extends Component {
    private stateMachine: AnimationStateMachine;
    private spriteRenderer: SpriteRenderer | null = null;
    private animations: Map<string, SpriteAnimation> = new Map();
    private defaultAnimation: string | null = null;
    private autoPlay: boolean = true;
    private eventEmitter: EventEmitter;

    constructor() {
        super();
        this.stateMachine = new AnimationStateMachine();
        this.eventEmitter = new EventEmitter();
        this.setupStateMachineEvents();
    }

    public awake(): void {
        this.spriteRenderer = this.getComponent(SpriteRenderer);
        if (!this.spriteRenderer) {
            console.warn('Animator component requires a SpriteRenderer component');
        }
    }

    public start(): void {
        if (this.autoPlay && this.defaultAnimation) {
            this.play(this.defaultAnimation);
        }
    }

    public update(): void {
        this.stateMachine.update(Time.deltaTime);
        this.updateSpriteRenderer();
    }

    // Animation Management
    public addAnimation(animationData: SpriteAnimationData): void {
        const animation = new SpriteAnimation(animationData);
        this.animations.set(animationData.name, animation);
        
        const state: AnimationState = {
            name: animationData.name,
            animation: animation,
            loop: animationData.loop,
            onEnter: () => this.onAnimationEnter(animationData.name),
            onExit: () => this.onAnimationExit(animationData.name)
        };
        
        this.stateMachine.addState(state);
        
        // Set first animation as default
        if (!this.defaultAnimation) {
            this.defaultAnimation = animationData.name;
        }
    }

    public removeAnimation(name: string): boolean {
        const removed = this.animations.delete(name);
        this.stateMachine.removeState(name);
        
        if (this.defaultAnimation === name) {
            this.defaultAnimation = this.animations.size > 0 ? (this.animations.keys().next().value || null) : null;
        }
        
        return removed;
    }

    public hasAnimation(name: string): boolean {
        return this.animations.has(name);
    }

    public getAnimation(name: string): SpriteAnimation | null {
        return this.animations.get(name) || null;
    }

    public getAnimationNames(): string[] {
        return Array.from(this.animations.keys());
    }

    // Playback Controls
    public play(animationName?: string): void {
        if (animationName) {
            this.stateMachine.changeState(animationName);
        } else {
            this.stateMachine.play();
        }
    }

    public pause(): void {
        this.stateMachine.pause();
    }

    public resume(): void {
        this.stateMachine.resume();
    }

    public stop(): void {
        this.stateMachine.stop();
    }

    public setSpeed(speed: number): void {
        this.stateMachine.setSpeed(speed);
    }

    public setLoop(loop: boolean): void {
        this.stateMachine.setLoop(loop);
    }

    // State Machine Controls
    public addTransition(from: string, to: string, condition?: () => boolean, duration?: number): void {
        this.stateMachine.addTransition({
            from,
            to,
            condition,
            duration
        });
    }

    public addTriggerTransition(from: string, to: string, trigger: string, duration?: number): void {
        this.stateMachine.addTransition({
            from,
            to,
            trigger,
            duration
        });
    }

    public trigger(triggerName: string): void {
        this.stateMachine.trigger(triggerName);
    }

    // State Information
    public get currentAnimation(): string | null {
        return this.stateMachine.currentStateName || null;
    }

    public get isPlaying(): boolean {
        return this.stateMachine.isPlaying;
    }

    public get isInTransition(): boolean {
        return this.stateMachine.isInTransition;
    }

    public getCurrentFrame(): number {
        const currentAnimationName = this.stateMachine.currentStateName;
        if (currentAnimationName) {
            const animation = this.animations.get(currentAnimationName);
            return animation?.currentFrameIndex || 0;
        }
        return 0;
    }

    public getFrameCount(): number {
        const currentAnimationName = this.stateMachine.currentStateName;
        if (currentAnimationName) {
            const animation = this.animations.get(currentAnimationName);
            return animation?.frameCount || 0;
        }
        return 0;
    }

    public getProgress(): number {
        const currentAnimationName = this.stateMachine.currentStateName;
        if (currentAnimationName) {
            const state = this.stateMachine.getState(currentAnimationName);
            return state?.animation.progress || 0;
        }
        return 0;
    }

    // Convenience Methods
    public playOnce(animationName: string, onComplete?: () => void): void {
        const animation = this.animations.get(animationName);
        if (animation) {
            const originalLoop = animation.loop;
            animation.loop = false;
            
            if (onComplete) {
                animation.once('end', onComplete);
            }
            
            animation.once('end', () => {
                animation.loop = originalLoop;
            });
            
            this.play(animationName);
        }
    }

    public crossfade(animationName: string, duration: number = 0.3): void {
        const currentState = this.stateMachine.currentStateName;
        if (currentState && currentState !== animationName) {
            this.addTransition(currentState, animationName, undefined, duration);
            this.play(animationName);
        } else {
            this.play(animationName);
        }
    }

    public setDefaultAnimation(animationName: string): void {
        if (this.hasAnimation(animationName)) {
            this.defaultAnimation = animationName;
        }
    }

    public setAutoPlay(autoPlay: boolean): void {
        this.autoPlay = autoPlay;
    }

    // Helper Methods for creating animations
    public createSpriteSheetAnimation(
        name: string,
        texture: HTMLImageElement | HTMLCanvasElement,
        frameWidth: number,
        frameHeight: number,
        frameCount: number,
        fps: number = 12,
        loop: boolean = true
    ): void {
        const animation = SpriteAnimation.fromSpriteSheet(
            name,
            texture,
            frameWidth,
            frameHeight,
            0,
            0,
            frameCount,
            fps
        );
        
        const animationData: SpriteAnimationData = {
            name,
            texture,
            frames: animation.frames,
            fps,
            loop
        };
        
        this.addAnimation(animationData);
    }

    public createFrameRangeAnimation(
        name: string,
        texture: HTMLImageElement | HTMLCanvasElement,
        frameWidth: number,
        frameHeight: number,
        startFrame: number,
        endFrame: number,
        fps: number = 12,
        loop: boolean = true
    ): void {
        const animation = SpriteAnimation.fromFrameRange(
            name,
            texture,
            frameWidth,
            frameHeight,
            startFrame,
            endFrame,
            fps
        );
        
        const animationData: SpriteAnimationData = {
            name,
            texture,
            frames: animation.frames,
            fps,
            loop
        };
        
        this.addAnimation(animationData);
    }

    public createCustomFrameAnimation(
        name: string,
        texture: HTMLImageElement | HTMLCanvasElement,
        frameIndices: number[],
        frameWidth: number,
        frameHeight: number,
        fps: number = 12,
        loop: boolean = true
    ): void {
        const animation = SpriteAnimation.fromFrameArray(
            name,
            texture,
            frameIndices,
            frameWidth,
            frameHeight,
            fps
        );
        
        const animationData: SpriteAnimationData = {
            name,
            texture,
            frames: animation.frames,
            fps,
            loop
        };
        
        this.addAnimation(animationData);
    }

    // Internal Methods
    private updateSpriteRenderer(): void {
        if (!this.spriteRenderer) return;
        
        const currentAnimationName = this.stateMachine.currentStateName;
        if (currentAnimationName) {
            const animation = this.animations.get(currentAnimationName);
            if (animation) {
                // Update sprite renderer with current frame
                this.spriteRenderer.setSprite(animation.texture);
                const frame = animation.currentFrame;
                this.spriteRenderer.setSourceRect(frame.x, frame.y, frame.width, frame.height);
            }
        }
    }

    // Event methods
    public on(event: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    public off(event: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.off(event, listener);
    }

    public once(event: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.once(event, listener);
    }

    private emit(event: string, data?: any): void {
        this.eventEmitter.emit(event, data);
    }

    private setupStateMachineEvents(): void {
        this.stateMachine.on('stateChanged', (event) => {
            this.emit('animationChanged', event);
        });
        
        this.stateMachine.on('transitionStarted', (event) => {
            this.emit('transitionStarted', event);
        });
        
        this.stateMachine.on('transitionCompleted', (event) => {
            this.emit('transitionCompleted', event);
        });
    }

    private onAnimationEnter(animationName: string): void {
        this.emit('animationEnter', { animationName });
    }

    private onAnimationExit(animationName: string): void {
        this.emit('animationExit', { animationName });
    }

    public onDestroy(): void {
        this.stateMachine.destroy();
        this.animations.clear();
        this.eventEmitter.removeAllListeners();
    }

    // Static helper for global tween management
    public static updateTweens(deltaTime: number): void {
        TweenManager.getInstance().update(deltaTime);
    }

    public static killAllTweens(): void {
        TweenManager.getInstance().killAllTweens();
    }

    public static getTweenCount(): number {
        return TweenManager.getInstance().getTweenCount();
    }
}