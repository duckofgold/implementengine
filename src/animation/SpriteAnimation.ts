import { Animation } from './Animation';

export interface SpriteFrame {
    x: number;
    y: number;
    width: number;
    height: number;
    duration?: number; // Optional per-frame duration override
}

export interface SpriteAnimationData {
    name: string;
    texture: HTMLImageElement | HTMLCanvasElement;
    frames: SpriteFrame[];
    fps?: number;
    loop?: boolean;
    pingPong?: boolean; // Play forward then backward
}

export class SpriteAnimation extends Animation {
    public texture: HTMLImageElement | HTMLCanvasElement;
    public frames: SpriteFrame[];
    public fps: number;
    public pingPong: boolean = false;
    
    private _currentFrameIndex: number = 0;
    private _direction: number = 1; // 1 for forward, -1 for backward (pingpong)
    private _frameDuration: number;

    constructor(data: SpriteAnimationData) {
        const totalDuration = SpriteAnimation.calculateTotalDuration(data);
        super(data.name, totalDuration);
        
        this.texture = data.texture;
        this.frames = data.frames;
        this.fps = data.fps || 12;
        this.loop = data.loop || false;
        this.pingPong = data.pingPong || false;
        this._frameDuration = 1 / this.fps;
        
        // Recalculate duration based on FPS if frame durations aren't specified
        if (!data.frames.some(frame => frame.duration !== undefined)) {
            this.duration = this.frames.length / this.fps;
        }
    }

    public get currentFrame(): SpriteFrame {
        return this.frames[this._currentFrameIndex] || this.frames[0];
    }

    public get currentFrameIndex(): number {
        return this._currentFrameIndex;
    }

    public get frameCount(): number {
        return this.frames.length;
    }

    public setFrame(index: number): void {
        this._currentFrameIndex = Math.max(0, Math.min(index, this.frames.length - 1));
    }

    public nextFrame(): void {
        if (this.pingPong) {
            this._currentFrameIndex += this._direction;
            
            if (this._currentFrameIndex >= this.frames.length - 1) {
                this._currentFrameIndex = this.frames.length - 1;
                this._direction = -1;
            } else if (this._currentFrameIndex <= 0) {
                this._currentFrameIndex = 0;
                this._direction = 1;
            }
        } else {
            this._currentFrameIndex = (this._currentFrameIndex + 1) % this.frames.length;
        }
    }

    public previousFrame(): void {
        if (this.pingPong) {
            this._currentFrameIndex -= this._direction;
            
            if (this._currentFrameIndex <= 0) {
                this._currentFrameIndex = 0;
                this._direction = 1;
            } else if (this._currentFrameIndex >= this.frames.length - 1) {
                this._currentFrameIndex = this.frames.length - 1;
                this._direction = -1;
            }
        } else {
            this._currentFrameIndex = this._currentFrameIndex > 0 ? this._currentFrameIndex - 1 : this.frames.length - 1;
        }
    }

    protected onUpdate(_normalizedTime: number): void {
        if (this.frames.length <= 1) return;

        // Calculate which frame we should be on based on time
        const totalTime = this._currentTime;
        let accumulatedTime = 0;
        let targetFrameIndex = 0;

        for (let i = 0; i < this.frames.length; i++) {
            const frame = this.frames[i];
            const frameDuration = frame.duration !== undefined ? frame.duration : this._frameDuration;
            
            if (totalTime >= accumulatedTime && totalTime < accumulatedTime + frameDuration) {
                targetFrameIndex = i;
                break;
            }
            
            accumulatedTime += frameDuration;
            
            if (i === this.frames.length - 1) {
                targetFrameIndex = i; // Last frame
            }
        }

        // Handle ping pong direction
        if (this.pingPong) {
            const cycleLength = this.frames.length * 2 - 2; // Forward + backward - overlapping frames
            const cyclePosition = Math.floor(totalTime / this.duration * cycleLength) % cycleLength;
            
            if (cyclePosition < this.frames.length) {
                targetFrameIndex = cyclePosition;
                this._direction = 1;
            } else {
                targetFrameIndex = cycleLength - cyclePosition;
                this._direction = -1;
            }
        }

        this._currentFrameIndex = Math.max(0, Math.min(targetFrameIndex, this.frames.length - 1));
    }

    protected onEnd(): void {
        if (this.pingPong) {
            this._currentFrameIndex = 0;
            this._direction = 1;
        } else {
            this._currentFrameIndex = this.frames.length - 1;
        }
    }

    protected onStop(): void {
        this._currentFrameIndex = 0;
        this._direction = 1;
    }

    public clone(): SpriteAnimation {
        const data: SpriteAnimationData = {
            name: this.name + '_clone',
            texture: this.texture,
            frames: [...this.frames],
            fps: this.fps,
            loop: this.loop,
            pingPong: this.pingPong
        };
        return new SpriteAnimation(data);
    }

    public reverse(): SpriteAnimation {
        const data: SpriteAnimationData = {
            name: this.name + '_reversed',
            texture: this.texture,
            frames: [...this.frames].reverse(),
            fps: this.fps,
            loop: this.loop,
            pingPong: this.pingPong
        };
        return new SpriteAnimation(data);
    }

    // Static helper methods
    public static fromSpriteSheet(
        name: string,
        texture: HTMLImageElement | HTMLCanvasElement,
        frameWidth: number,
        frameHeight: number,
        startX: number = 0,
        startY: number = 0,
        frameCount?: number,
        fps: number = 12
    ): SpriteAnimation {
        const frames: SpriteFrame[] = [];
        const maxFramesPerRow = Math.floor(texture.width / frameWidth);
        const maxFrames = frameCount || Math.floor((texture.width * texture.height) / (frameWidth * frameHeight));

        for (let i = 0; i < maxFrames; i++) {
            const row = Math.floor(i / maxFramesPerRow);
            const col = i % maxFramesPerRow;
            
            frames.push({
                x: startX + col * frameWidth,
                y: startY + row * frameHeight,
                width: frameWidth,
                height: frameHeight
            });
        }

        return new SpriteAnimation({
            name,
            texture,
            frames,
            fps
        });
    }

    public static fromFrameRange(
        name: string,
        texture: HTMLImageElement | HTMLCanvasElement,
        frameWidth: number,
        frameHeight: number,
        startFrame: number,
        endFrame: number,
        fps: number = 12
    ): SpriteAnimation {
        const frames: SpriteFrame[] = [];
        const maxFramesPerRow = Math.floor(texture.width / frameWidth);

        for (let i = startFrame; i <= endFrame; i++) {
            const row = Math.floor(i / maxFramesPerRow);
            const col = i % maxFramesPerRow;
            
            frames.push({
                x: col * frameWidth,
                y: row * frameHeight,
                width: frameWidth,
                height: frameHeight
            });
        }

        return new SpriteAnimation({
            name,
            texture,
            frames,
            fps
        });
    }

    public static fromFrameArray(
        name: string,
        texture: HTMLImageElement | HTMLCanvasElement,
        frameIndices: number[],
        frameWidth: number,
        frameHeight: number,
        fps: number = 12
    ): SpriteAnimation {
        const frames: SpriteFrame[] = [];
        const maxFramesPerRow = Math.floor(texture.width / frameWidth);

        frameIndices.forEach(index => {
            const row = Math.floor(index / maxFramesPerRow);
            const col = index % maxFramesPerRow;
            
            frames.push({
                x: col * frameWidth,
                y: row * frameHeight,
                width: frameWidth,
                height: frameHeight
            });
        });

        return new SpriteAnimation({
            name,
            texture,
            frames,
            fps
        });
    }

    private static calculateTotalDuration(data: SpriteAnimationData): number {
        if (data.frames.some(frame => frame.duration !== undefined)) {
            return data.frames.reduce((total, frame) => {
                return total + (frame.duration || 1 / (data.fps || 12));
            }, 0);
        } else {
            return data.frames.length / (data.fps || 12);
        }
    }
}