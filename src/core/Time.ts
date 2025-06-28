export class Time {
    private static _instance: Time;
    private _deltaTime: number = 0;
    private _time: number = 0;
    private _timeScale: number = 1;
    private _isPaused: boolean = false;
    private _lastFrameTime: number = 0;
    private _frameCount: number = 0;
    private _fps: number = 0;
    private _fpsUpdateTime: number = 0;
    private _fpsFrameCount: number = 0;

    private constructor() {
        this._lastFrameTime = performance.now();
    }

    public static getInstance(): Time {
        if (!Time._instance) {
            Time._instance = new Time();
        }
        return Time._instance;
    }

    public static get deltaTime(): number {
        return Time.getInstance()._deltaTime;
    }

    public static get time(): number {
        return Time.getInstance()._time;
    }

    public static get timeScale(): number {
        return Time.getInstance()._timeScale;
    }

    public static set timeScale(value: number) {
        Time.getInstance()._timeScale = Math.max(0, value);
    }

    public static get isPaused(): boolean {
        return Time.getInstance()._isPaused;
    }

    public static get frameCount(): number {
        return Time.getInstance()._frameCount;
    }

    public static get fps(): number {
        return Time.getInstance()._fps;
    }

    public static pause(): void {
        Time.getInstance()._isPaused = true;
    }

    public static resume(): void {
        Time.getInstance()._isPaused = false;
    }

    public static update(): void {
        const instance = Time.getInstance();
        const currentTime = performance.now();
        const rawDelta = (currentTime - instance._lastFrameTime) / 1000;
        
        instance._lastFrameTime = currentTime;
        instance._frameCount++;

        if (instance._isPaused) {
            instance._deltaTime = 0;
            return;
        }

        instance._deltaTime = Math.min(rawDelta * instance._timeScale, 0.1);
        instance._time += instance._deltaTime;

        instance.updateFPS(currentTime, rawDelta);
    }

    private updateFPS(_currentTime: number, rawDelta: number): void {
        this._fpsFrameCount++;
        this._fpsUpdateTime += rawDelta;

        if (this._fpsUpdateTime >= 1.0) {
            this._fps = Math.round(this._fpsFrameCount / this._fpsUpdateTime);
            this._fpsUpdateTime = 0;
            this._fpsFrameCount = 0;
        }
    }

    public static reset(): void {
        const instance = Time.getInstance();
        instance._deltaTime = 0;
        instance._time = 0;
        instance._frameCount = 0;
        instance._fps = 0;
        instance._fpsUpdateTime = 0;
        instance._fpsFrameCount = 0;
        instance._lastFrameTime = performance.now();
    }
}