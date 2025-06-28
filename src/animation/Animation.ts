import { EventEmitter } from '../utils/EventEmitter';

export interface AnimationEvent {
    type: 'start' | 'end' | 'loop' | 'pause' | 'resume';
    animation: Animation;
    currentTime?: number;
}

export abstract class Animation extends EventEmitter {
    public name: string;
    public duration: number;
    public loop: boolean = false;
    public autoDestroy: boolean = false;
    
    protected _isPlaying: boolean = false;
    protected _isPaused: boolean = false;
    protected _currentTime: number = 0;
    protected _playbackSpeed: number = 1;
    protected _loopCount: number = 0;
    protected _maxLoops: number = -1; // -1 = infinite

    constructor(name: string, duration: number) {
        super();
        this.name = name;
        this.duration = duration;
    }

    public get isPlaying(): boolean {
        return this._isPlaying && !this._isPaused;
    }

    public get isPaused(): boolean {
        return this._isPaused;
    }

    public get currentTime(): number {
        return this._currentTime;
    }

    public get progress(): number {
        return this.duration > 0 ? this._currentTime / this.duration : 0;
    }

    public get normalizedTime(): number {
        return Math.max(0, Math.min(1, this.progress));
    }

    public get playbackSpeed(): number {
        return this._playbackSpeed;
    }

    public set playbackSpeed(speed: number) {
        this._playbackSpeed = Math.max(0, speed);
    }

    public get loopCount(): number {
        return this._loopCount;
    }

    public get maxLoops(): number {
        return this._maxLoops;
    }

    public set maxLoops(count: number) {
        this._maxLoops = count;
    }

    public play(): void {
        if (!this._isPlaying) {
            this._isPlaying = true;
            this._isPaused = false;
            this.emit('start', { type: 'start', animation: this, currentTime: this._currentTime });
        }
    }

    public pause(): void {
        if (this._isPlaying && !this._isPaused) {
            this._isPaused = true;
            this.emit('pause', { type: 'pause', animation: this, currentTime: this._currentTime });
        }
    }

    public resume(): void {
        if (this._isPaused) {
            this._isPaused = false;
            this.emit('resume', { type: 'resume', animation: this, currentTime: this._currentTime });
        }
    }

    public stop(): void {
        if (this._isPlaying) {
            this._isPlaying = false;
            this._isPaused = false;
            this._currentTime = 0;
            this._loopCount = 0;
            this.onStop();
            this.emit('end', { type: 'end', animation: this, currentTime: this._currentTime });
        }
    }

    public restart(): void {
        this.stop();
        this.play();
    }

    public setTime(time: number): void {
        this._currentTime = Math.max(0, time);
        if (this._currentTime >= this.duration) {
            this.handleEnd();
        } else {
            this.onUpdate(this.normalizedTime);
        }
    }

    public update(deltaTime: number): void {
        if (!this.isPlaying) return;

        this._currentTime += deltaTime * this._playbackSpeed;

        if (this._currentTime >= this.duration) {
            this.handleEnd();
        } else {
            this.onUpdate(this.normalizedTime);
        }
    }

    protected handleEnd(): void {
        if (this.loop && (this._maxLoops === -1 || this._loopCount < this._maxLoops)) {
            this._loopCount++;
            this._currentTime = this._currentTime - this.duration;
            this.onUpdate(this.normalizedTime);
            this.emit('loop', { type: 'loop', animation: this, currentTime: this._currentTime });
        } else {
            this._isPlaying = false;
            this._isPaused = false;
            this._currentTime = this.duration;
            this.onEnd();
            this.emit('end', { type: 'end', animation: this, currentTime: this._currentTime });
            
            if (this.autoDestroy) {
                this.destroy();
            }
        }
    }

    public destroy(): void {
        this.stop();
        this.removeAllListeners();
    }

    // Abstract methods to be implemented by subclasses
    protected abstract onUpdate(normalizedTime: number): void;
    protected abstract onEnd(): void;
    protected abstract onStop(): void;

    // Helper methods
    public clone(): Animation {
        throw new Error('Clone method must be implemented by subclasses');
    }

    public reverse(): Animation {
        throw new Error('Reverse method must be implemented by subclasses');
    }
}