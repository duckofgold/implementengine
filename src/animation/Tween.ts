import { Animation } from './Animation';
import { Easing, EasingFunction } from '../utils/Easing';
import { Vector2 } from '../utils/Vector2';

export interface TweenConfig<T> {
    target: T;
    to: Partial<T>;
    duration: number;
    easing?: EasingFunction | string;
    delay?: number;
    loop?: boolean;
    maxLoops?: number;
    autoDestroy?: boolean;
    onUpdate?: (target: T, progress: number) => void;
    onComplete?: (target: T) => void;
}

export class Tween<T extends Record<string, any>> extends Animation {
    private target: T;
    private startValues: Partial<T> = {};
    private endValues: Partial<T>;
    private properties: string[];
    private easingFunction: EasingFunction;
    private delay: number;
    private delayTimer: number = 0;
    private onUpdateCallback?: (target: T, progress: number) => void;
    private onCompleteCallback?: (target: T) => void;

    constructor(config: TweenConfig<T>) {
        super(`Tween_${Date.now()}`, config.duration);
        
        this.target = config.target;
        this.endValues = config.to;
        this.properties = Object.keys(config.to);
        this.delay = config.delay || 0;
        this.loop = config.loop || false;
        this.maxLoops = config.maxLoops || -1;
        this.autoDestroy = config.autoDestroy !== false; // Default true for tweens
        this.onUpdateCallback = config.onUpdate;
        this.onCompleteCallback = config.onComplete;

        // Set easing function
        if (typeof config.easing === 'string') {
            this.easingFunction = Easing.getEasingFunction(config.easing);
        } else {
            this.easingFunction = config.easing || Easing.easeOutQuad;
        }

        this.captureStartValues();
    }

    private captureStartValues(): void {
        for (const prop of this.properties) {
            const currentValue = this.target[prop];
            if (currentValue !== undefined) {
                (this.startValues as any)[prop] = this.cloneValue(currentValue);
            }
        }
    }

    private cloneValue(value: any): any {
        if (value instanceof Vector2) {
            return value.clone();
        }
        if (typeof value === 'object' && value !== null) {
            return { ...value };
        }
        return value;
    }

    protected onUpdate(normalizedTime: number): void {
        // Handle delay
        if (this.delay > 0 && this.delayTimer < this.delay) {
            this.delayTimer += normalizedTime * this.duration;
            return;
        }

        const easedTime = this.easingFunction(normalizedTime);

        for (const prop of this.properties) {
            const startValue = this.startValues[prop];
            const endValue = this.endValues[prop];
            
            if (startValue !== undefined && endValue !== undefined) {
                (this.target as any)[prop] = this.interpolateValue(startValue, endValue, easedTime);
            }
        }

        if (this.onUpdateCallback) {
            this.onUpdateCallback(this.target, normalizedTime);
        }
    }

    private interpolateValue(start: any, end: any, t: number): any {
        if (start instanceof Vector2 && end instanceof Vector2) {
            return Vector2.lerp(start, end, t);
        }
        
        if (typeof start === 'number' && typeof end === 'number') {
            return Easing.interpolate(start, end, t, Easing.linear);
        }
        
        if (typeof start === 'object' && typeof end === 'object' && start !== null && end !== null) {
            const result = { ...start };
            for (const key in end) {
                if (typeof start[key] === 'number' && typeof end[key] === 'number') {
                    result[key] = Easing.interpolate(start[key], end[key], t, Easing.linear);
                }
            }
            return result;
        }
        
        // For non-numeric values, just use the end value when t > 0.5
        return t > 0.5 ? end : start;
    }

    protected onEnd(): void {
        // Ensure final values are set
        for (const prop of this.properties) {
            const endValue = this.endValues[prop];
            if (endValue !== undefined) {
                (this.target as any)[prop] = this.cloneValue(endValue);
            }
        }

        if (this.onCompleteCallback) {
            this.onCompleteCallback(this.target);
        }
    }

    protected onStop(): void {
        this.delayTimer = 0;
    }

    public clone(): Tween<T> {
        const config: TweenConfig<T> = {
            target: this.target,
            to: this.endValues,
            duration: this.duration,
            easing: this.easingFunction,
            delay: this.delay,
            loop: this.loop,
            maxLoops: this.maxLoops,
            autoDestroy: this.autoDestroy,
            onUpdate: this.onUpdateCallback,
            onComplete: this.onCompleteCallback
        };
        return new Tween(config);
    }

    public reverse(): Tween<T> {
        const config: TweenConfig<T> = {
            target: this.target,
            to: this.startValues as Partial<T>,
            duration: this.duration,
            easing: this.easingFunction,
            delay: this.delay,
            loop: this.loop,
            maxLoops: this.maxLoops,
            autoDestroy: this.autoDestroy,
            onUpdate: this.onUpdateCallback,
            onComplete: this.onCompleteCallback
        };
        return new Tween(config);
    }

    // Static factory methods for common tween types
    public static to<T extends Record<string, any>>(target: T, to: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T> {
        return new Tween({
            target,
            to,
            duration,
            easing
        });
    }

    public static from<T extends Record<string, any>>(target: T, from: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T> {
        // Set initial values and tween back to current values
        const currentValues: Partial<T> = {};
        for (const prop in from) {
            currentValues[prop] = target[prop];
            (target as any)[prop] = from[prop];
        }

        return new Tween({
            target,
            to: currentValues,
            duration,
            easing
        });
    }

    public static fromTo<T extends Record<string, any>>(target: T, from: Partial<T>, to: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T> {
        // Set initial values
        for (const prop in from) {
            (target as any)[prop] = from[prop];
        }

        return new Tween({
            target,
            to,
            duration,
            easing
        });
    }
}

// Tween Manager for handling multiple tweens
export class TweenManager {
    private static _instance: TweenManager;
    private tweens: Set<Tween<any>> = new Set();

    private constructor() {}

    public static getInstance(): TweenManager {
        if (!TweenManager._instance) {
            TweenManager._instance = new TweenManager();
        }
        return TweenManager._instance;
    }

    public add<T extends Record<string, any>>(tween: Tween<T>): Tween<T> {
        this.tweens.add(tween);
        
        tween.on('end', () => {
            this.tweens.delete(tween);
        });

        return tween;
    }

    public remove<T extends Record<string, any>>(tween: Tween<T>): boolean {
        if (this.tweens.has(tween)) {
            tween.stop();
            this.tweens.delete(tween);
            return true;
        }
        return false;
    }

    public killTweensOf<T extends Record<string, any>>(target: T): void {
        const tweensToRemove: Tween<T>[] = [];
        
        this.tweens.forEach(tween => {
            if ((tween as any).target === target) {
                tweensToRemove.push(tween as Tween<T>);
            }
        });

        tweensToRemove.forEach(tween => this.remove(tween));
    }

    public killAllTweens(): void {
        this.tweens.forEach(tween => tween.stop());
        this.tweens.clear();
    }

    public update(deltaTime: number): void {
        this.tweens.forEach(tween => {
            tween.update(deltaTime);
        });
    }

    public getTweenCount(): number {
        return this.tweens.size;
    }

    // Convenience static methods
    public static to<T extends Record<string, any>>(target: T, to: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T> {
        const tween = Tween.to(target, to, duration, easing);
        TweenManager.getInstance().add(tween);
        tween.play();
        return tween;
    }

    public static from<T extends Record<string, any>>(target: T, from: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T> {
        const tween = Tween.from(target, from, duration, easing);
        TweenManager.getInstance().add(tween);
        tween.play();
        return tween;
    }

    public static fromTo<T extends Record<string, any>>(target: T, from: Partial<T>, to: Partial<T>, duration: number, easing?: EasingFunction | string): Tween<T> {
        const tween = Tween.fromTo(target, from, to, duration, easing);
        TweenManager.getInstance().add(tween);
        tween.play();
        return tween;
    }
}