import { Vector2 } from '../utils/Vector2';
import { EventEmitter } from '../utils/EventEmitter';

export interface KeyState {
    isDown: boolean;
    wasPressed: boolean;
    wasReleased: boolean;
}

export interface MouseState {
    position: Vector2;
    deltaPosition: Vector2;
    leftButton: KeyState;
    rightButton: KeyState;
    middleButton: KeyState;
    wheel: number;
}

export class Input extends EventEmitter {
    private static _instance: Input;
    
    private keys: Map<string, KeyState> = new Map();
    private previousKeys: Map<string, boolean> = new Map();
    private mouseState: MouseState;
    private previousMousePosition: Vector2 = Vector2.zero;
    private canvas: HTMLCanvasElement | null = null;

    private constructor() {
        super();
        
        this.mouseState = {
            position: Vector2.zero,
            deltaPosition: Vector2.zero,
            leftButton: { isDown: false, wasPressed: false, wasReleased: false },
            rightButton: { isDown: false, wasPressed: false, wasReleased: false },
            middleButton: { isDown: false, wasPressed: false, wasReleased: false },
            wheel: 0
        };
        
        this.setupEventListeners();
    }

    public static getInstance(): Input {
        if (!Input._instance) {
            Input._instance = new Input();
        }
        return Input._instance;
    }

    public static initialize(canvas: HTMLCanvasElement): void {
        const instance = Input.getInstance();
        instance.canvas = canvas;
    }

    public static getKey(key: string): boolean {
        const instance = Input.getInstance();
        const keyState = instance.keys.get(key.toLowerCase());
        return keyState ? keyState.isDown : false;
    }

    public static getKeyDown(key: string): boolean {
        const instance = Input.getInstance();
        const keyState = instance.keys.get(key.toLowerCase());
        return keyState ? keyState.wasPressed : false;
    }

    public static getKeyUp(key: string): boolean {
        const instance = Input.getInstance();
        const keyState = instance.keys.get(key.toLowerCase());
        return keyState ? keyState.wasReleased : false;
    }

    public static getMousePosition(): Vector2 {
        return Input.getInstance().mouseState.position.clone();
    }

    public static getMouseDelta(): Vector2 {
        return Input.getInstance().mouseState.deltaPosition.clone();
    }

    public static getMouseButton(button: number): boolean {
        const instance = Input.getInstance();
        switch (button) {
            case 0: return instance.mouseState.leftButton.isDown;
            case 1: return instance.mouseState.middleButton.isDown;
            case 2: return instance.mouseState.rightButton.isDown;
            default: return false;
        }
    }

    public static getMouseButtonDown(button: number): boolean {
        const instance = Input.getInstance();
        switch (button) {
            case 0: return instance.mouseState.leftButton.wasPressed;
            case 1: return instance.mouseState.middleButton.wasPressed;
            case 2: return instance.mouseState.rightButton.wasPressed;
            default: return false;
        }
    }

    public static getMouseButtonUp(button: number): boolean {
        const instance = Input.getInstance();
        switch (button) {
            case 0: return instance.mouseState.leftButton.wasReleased;
            case 1: return instance.mouseState.middleButton.wasReleased;
            case 2: return instance.mouseState.rightButton.wasReleased;
            default: return false;
        }
    }

    public static getMouseWheel(): number {
        return Input.getInstance().mouseState.wheel;
    }

    public static update(): void {
        const instance = Input.getInstance();
        
        instance.keys.forEach((keyState, key) => {
            const wasDown = instance.previousKeys.get(key) || false;
            keyState.wasPressed = keyState.isDown && !wasDown;
            keyState.wasReleased = !keyState.isDown && wasDown;
            instance.previousKeys.set(key, keyState.isDown);
        });
        
        instance.updateMouseButtonState(instance.mouseState.leftButton);
        instance.updateMouseButtonState(instance.mouseState.rightButton);
        instance.updateMouseButtonState(instance.mouseState.middleButton);
        
        instance.mouseState.deltaPosition = instance.mouseState.position.subtract(instance.previousMousePosition);
        instance.previousMousePosition = instance.mouseState.position.clone();
        instance.mouseState.wheel = 0;
    }

    private updateMouseButtonState(buttonState: KeyState): void {
        buttonState.wasPressed = false;
        buttonState.wasReleased = false;
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('wheel', this.onMouseWheel.bind(this));
        document.addEventListener('contextmenu', this.onContextMenu.bind(this));
    }

    private onKeyDown(event: KeyboardEvent): void {
        const key = event.key.toLowerCase();
        let keyState = this.keys.get(key);
        
        if (!keyState) {
            keyState = { isDown: false, wasPressed: false, wasReleased: false };
            this.keys.set(key, keyState);
        }
        
        if (!keyState.isDown) {
            keyState.wasPressed = true;
            keyState.isDown = true;
            this.emit('keyDown', { key, event });
        }
    }

    private onKeyUp(event: KeyboardEvent): void {
        const key = event.key.toLowerCase();
        let keyState = this.keys.get(key);
        
        if (!keyState) {
            keyState = { isDown: false, wasPressed: false, wasReleased: false };
            this.keys.set(key, keyState);
        }
        
        if (keyState.isDown) {
            keyState.wasReleased = true;
            keyState.isDown = false;
            this.emit('keyUp', { key, event });
        }
    }

    private onMouseMove(event: MouseEvent): void {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseState.position.set(
                event.clientX - rect.left,
                event.clientY - rect.top
            );
        } else {
            this.mouseState.position.set(event.clientX, event.clientY);
        }
        
        this.emit('mouseMove', { position: this.mouseState.position.clone(), event });
    }

    private onMouseDown(event: MouseEvent): void {
        const buttonState = this.getMouseButtonState(event.button);
        if (buttonState && !buttonState.isDown) {
            buttonState.wasPressed = true;
            buttonState.isDown = true;
            this.emit('mouseDown', { button: event.button, position: this.mouseState.position.clone(), event });
        }
    }

    private onMouseUp(event: MouseEvent): void {
        const buttonState = this.getMouseButtonState(event.button);
        if (buttonState && buttonState.isDown) {
            buttonState.wasReleased = true;
            buttonState.isDown = false;
            this.emit('mouseUp', { button: event.button, position: this.mouseState.position.clone(), event });
        }
    }

    private onMouseWheel(event: WheelEvent): void {
        this.mouseState.wheel = event.deltaY;
        this.emit('mouseWheel', { delta: event.deltaY, position: this.mouseState.position.clone(), event });
    }

    private onContextMenu(event: Event): void {
        event.preventDefault();
    }

    private getMouseButtonState(button: number): KeyState | null {
        switch (button) {
            case 0: return this.mouseState.leftButton;
            case 1: return this.mouseState.middleButton;
            case 2: return this.mouseState.rightButton;
            default: return null;
        }
    }
}