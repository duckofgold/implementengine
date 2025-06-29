# Input Class Documentation

## Overview
The `Input` class handles keyboard and mouse input for ImplementEngine. It provides static methods for checking key states, mouse position, and button states. Uses singleton pattern and integrates with the engine's update loop.

## Class Declaration
```typescript
export class Input extends EventEmitter
```

## Interfaces

### KeyState Interface
```typescript
interface KeyState {
    isDown: boolean;      // Currently pressed
    wasPressed: boolean;  // Pressed this frame
    wasReleased: boolean; // Released this frame
}
```

### MouseState Interface
```typescript
interface MouseState {
    position: Vector2;        // Current mouse position
    deltaPosition: Vector2;   // Movement since last frame
    leftButton: KeyState;     // Left mouse button state
    rightButton: KeyState;    // Right mouse button state
    middleButton: KeyState;   // Middle mouse button state
    wheel: number;           // Scroll wheel delta
}
```

## Static Methods

### Initialization

#### `initialize(canvas: HTMLCanvasElement): void`
Initializes input system with canvas for mouse coordinate calculation.
- Called automatically by Engine
- **Internal method - do not call manually**

### Keyboard Input

#### `getKey(key: string): boolean`
Checks if a key is currently being held down.

**Parameters:**
- `key` (string): Key to check (case-insensitive)

**Returns:**
- `boolean` - True if key is currently pressed

**Example:**
```typescript
// Check if space is held
if (Input.getKey(' ')) {
    console.log('Space is being held');
}

// Check movement keys
if (Input.getKey('w') || Input.getKey('ArrowUp')) {
    player.moveUp();
}
```

#### `getKeyDown(key: string): boolean`
Checks if a key was pressed this frame (one-time trigger).

**Returns:**
- `boolean` - True only on the frame the key was pressed

**Example:**
```typescript
// Jump only when space is first pressed
if (Input.getKeyDown(' ')) {
    player.jump();
}

// Fire weapon on key press
if (Input.getKeyDown('f')) {
    weapon.fire();
}
```

#### `getKeyUp(key: string): boolean`
Checks if a key was released this frame.

**Returns:**
- `boolean` - True only on the frame the key was released

**Example:**
```typescript
// Stop charging when key is released
if (Input.getKeyUp(' ')) {
    weapon.stopCharging();
}
```

### Mouse Input

#### `getMousePosition(): Vector2`
Gets current mouse position relative to canvas.

**Returns:**
- `Vector2` - Current mouse position in canvas coordinates

#### `getMouseDelta(): Vector2`
Gets mouse movement since last frame.

**Returns:**
- `Vector2` - Mouse movement delta

#### `getMouseButton(button: number): boolean`
Checks if a mouse button is currently pressed.

**Parameters:**
- `button` (number): Button index (0=left, 1=middle, 2=right)

**Returns:**
- `boolean` - True if button is currently pressed

#### `getMouseButtonDown(button: number): boolean`
Checks if a mouse button was pressed this frame.

**Returns:**
- `boolean` - True only on the frame the button was pressed

#### `getMouseButtonUp(button: number): boolean`
Checks if a mouse button was released this frame.

**Returns:**
- `boolean` - True only on the frame the button was released

#### `getMouseWheel(): number`
Gets mouse wheel scroll delta.

**Returns:**
- `number` - Scroll amount (positive=up, negative=down, 0=no scroll)

### Internal Methods

#### `update(): void`
Updates input state (called by Engine each frame).
- **Internal method - do not call manually**

## Usage Examples

### Basic Movement Controller
```typescript
class PlayerController extends Component {
    private speed: number = 200;
    
    update(): void {
        if (!this.transform) return;
        
        // Continuous movement
        const movement = Vector2.zero;
        
        if (Input.getKey('w') || Input.getKey('ArrowUp')) {
            movement.y -= 1;
        }
        if (Input.getKey('s') || Input.getKey('ArrowDown')) {
            movement.y += 1;
        }
        if (Input.getKey('a') || Input.getKey('ArrowLeft')) {
            movement.x -= 1;
        }
        if (Input.getKey('d') || Input.getKey('ArrowRight')) {
            movement.x += 1;
        }
        
        // Normalize diagonal movement
        if (movement.magnitude() > 0) {
            movement.normalize();
            const deltaMovement = movement.multiply(this.speed * Time.deltaTime);
            this.transform.position = this.transform.position.add(deltaMovement);
        }
        
        // One-time actions
        if (Input.getKeyDown(' ')) {
            this.jump();
        }
        
        if (Input.getKeyDown('f')) {
            this.interact();
        }
    }
    
    private jump(): void {
        console.log('Player jumped!');
    }
    
    private interact(): void {
        console.log('Player interacted!');
    }
}
```

### Mouse Look Camera
```typescript
class MouseLookCamera extends Component {
    private sensitivity: number = 2.0;
    private isLocked: boolean = false;
    
    start(): void {
        // Lock mouse on click
        const canvas = Engine.getInstance().getCanvas();
        canvas.addEventListener('click', () => {
            if (!this.isLocked) {
                canvas.requestPointerLock();
                this.isLocked = true;
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === canvas;
        });
    }
    
    update(): void {
        if (!this.isLocked || !this.transform) return;
        
        const mouseDelta = Input.getMouseDelta();
        
        // Rotate based on mouse movement
        const rotationX = -mouseDelta.y * this.sensitivity * Time.deltaTime;
        const rotationY = mouseDelta.x * this.sensitivity * Time.deltaTime;
        
        this.transform.rotation += rotationY;
        // Apply rotationX to camera pitch (if implemented)
    }
}
```

### Click to Place Objects
```typescript
class ObjectPlacer extends Component {
    private prefab: GameObject | null = null;
    
    update(): void {
        if (Input.getMouseButtonDown(0)) { // Left click
            this.placeObject();
        }
        
        if (Input.getMouseButtonDown(2)) { // Right click
            this.removeObject();
        }
    }
    
    private placeObject(): void {
        const mousePos = Input.getMousePosition();
        const worldPos = this.screenToWorldPosition(mousePos);
        
        if (this.prefab) {
            const newObject = this.prefab.clone();
            newObject.transform.position = worldPos;
            // Add to scene
        }
    }
    
    private removeObject(): void {
        const mousePos = Input.getMousePosition();
        const worldPos = this.screenToWorldPosition(mousePos);
        
        // Find object at world position and remove it
        // Implementation depends on collision detection
    }
    
    private screenToWorldPosition(screenPos: Vector2): Vector2 {
        const renderer = Engine.getInstance().getRenderer();
        const camera = renderer.getCamera();
        return camera.screenToWorld(screenPos, renderer.size);
    }
}
```

### Weapon System with Input
```typescript
class WeaponComponent extends Component {
    private fireRate: number = 5; // shots per second
    private lastFireTime: number = 0;
    private isReloading: boolean = false;
    private ammo: number = 30;
    private maxAmmo: number = 30;
    
    update(): void {
        // Auto fire while holding button
        if (Input.getMouseButton(0) && this.canFire()) {
            this.fire();
        }
        
        // Reload
        if (Input.getKeyDown('r') && !this.isReloading) {
            this.reload();
        }
        
        // Weapon switching
        if (Input.getKeyDown('1')) {
            this.switchWeapon(0);
        }
        if (Input.getKeyDown('2')) {
            this.switchWeapon(1);
        }
    }
    
    private canFire(): boolean {
        const cooldown = 1 / this.fireRate;
        return !this.isReloading && 
               this.ammo > 0 && 
               Time.time - this.lastFireTime >= cooldown;
    }
    
    private fire(): void {
        this.ammo--;
        this.lastFireTime = Time.time;
        
        // Create bullet, play sound, etc.
        console.log(`Fired! Ammo: ${this.ammo}`);
    }
    
    private reload(): void {
        this.isReloading = true;
        
        // Start reload timer
        setTimeout(() => {
            this.ammo = this.maxAmmo;
            this.isReloading = false;
            console.log('Reloaded!');
        }, 2000);
    }
    
    private switchWeapon(index: number): void {
        console.log(`Switched to weapon ${index}`);
    }
}
```

### Input Buffer System
```typescript
class InputBuffer extends Component {
    private bufferTime: number = 0.2; // seconds
    private bufferedInputs: Map<string, number> = new Map();
    
    update(): void {
        // Buffer jump input
        if (Input.getKeyDown(' ')) {
            this.bufferInput('jump', this.bufferTime);
        }
        
        // Buffer attack input
        if (Input.getMouseButtonDown(0)) {
            this.bufferInput('attack', this.bufferTime);
        }
        
        // Update buffer timers
        this.updateBuffers();
        
        // Consume buffered inputs when conditions are met
        if (this.isGrounded() && this.consumeInput('jump')) {
            this.jump();
        }
        
        if (this.canAttack() && this.consumeInput('attack')) {
            this.attack();
        }
    }
    
    private bufferInput(inputName: string, duration: number): void {
        this.bufferedInputs.set(inputName, Time.time + duration);
    }
    
    private consumeInput(inputName: string): boolean {
        const expireTime = this.bufferedInputs.get(inputName);
        if (expireTime && Time.time <= expireTime) {
            this.bufferedInputs.delete(inputName);
            return true;
        }
        return false;
    }
    
    private updateBuffers(): void {
        const currentTime = Time.time;
        this.bufferedInputs.forEach((expireTime, inputName) => {
            if (currentTime > expireTime) {
                this.bufferedInputs.delete(inputName);
            }
        });
    }
    
    private isGrounded(): boolean {
        // Implementation depends on physics system
        return true;
    }
    
    private canAttack(): boolean {
        // Implementation depends on game logic
        return true;
    }
    
    private jump(): void {
        console.log('Buffered jump executed!');
    }
    
    private attack(): void {
        console.log('Buffered attack executed!');
    }
}
```

### Scroll Wheel Interaction
```typescript
class ZoomController extends Component {
    private zoomSpeed: number = 0.1;
    private minZoom: number = 0.5;
    private maxZoom: number = 3.0;
    
    update(): void {
        const scrollDelta = Input.getMouseWheel();
        
        if (scrollDelta !== 0) {
            const camera = Engine.getInstance().getRenderer().getCamera();
            const zoomFactor = scrollDelta > 0 ? (1 - this.zoomSpeed) : (1 + this.zoomSpeed);
            
            const newZoom = camera.zoom * zoomFactor;
            const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
            
            camera.setZoom(clampedZoom);
        }
    }
}
```

### Custom Input Mapping
```typescript
class InputMapper extends Component {
    private keyBindings: Map<string, string> = new Map();
    
    constructor() {
        super();
        this.setupDefaultBindings();
    }
    
    private setupDefaultBindings(): void {
        this.keyBindings.set('move_up', 'w');
        this.keyBindings.set('move_down', 's');
        this.keyBindings.set('move_left', 'a');
        this.keyBindings.set('move_right', 'd');
        this.keyBindings.set('jump', ' ');
        this.keyBindings.set('interact', 'f');
    }
    
    public getAction(action: string): boolean {
        const key = this.keyBindings.get(action);
        return key ? Input.getKey(key) : false;
    }
    
    public getActionDown(action: string): boolean {
        const key = this.keyBindings.get(action);
        return key ? Input.getKeyDown(key) : false;
    }
    
    public getActionUp(action: string): boolean {
        const key = this.keyBindings.get(action);
        return key ? Input.getKeyUp(key) : false;
    }
    
    public rebindKey(action: string, newKey: string): void {
        this.keyBindings.set(action, newKey);
    }
    
    update(): void {
        // Use action-based input
        if (this.getActionDown('jump')) {
            this.jump();
        }
        
        if (this.getAction('move_up')) {
            this.moveUp();
        }
    }
    
    private jump(): void {
        console.log('Action: Jump');
    }
    
    private moveUp(): void {
        console.log('Action: Move Up');
    }
}
```

## Event System

The Input class extends EventEmitter and fires the following events:

### Event Types
```typescript
// Keyboard events
input.on('keyDown', ({ key, event }) => {
    console.log('Key pressed:', key);
});

input.on('keyUp', ({ key, event }) => {
    console.log('Key released:', key);
});

// Mouse events
input.on('mouseMove', ({ position, event }) => {
    console.log('Mouse moved to:', position);
});

input.on('mouseDown', ({ button, position, event }) => {
    console.log('Mouse button pressed:', button, 'at', position);
});

input.on('mouseUp', ({ button, position, event }) => {
    console.log('Mouse button released:', button, 'at', position);
});

input.on('mouseWheel', ({ delta, position, event }) => {
    console.log('Mouse wheel scrolled:', delta, 'at', position);
});
```

### Global Input Handler
```typescript
class GlobalInputHandler extends Component {
    start(): void {
        const input = Input.getInstance();
        
        input.on('keyDown', this.handleKeyDown.bind(this));
        input.on('mouseDown', this.handleMouseDown.bind(this));
    }
    
    private handleKeyDown({ key, event }: { key: string, event: KeyboardEvent }): void {
        switch (key) {
            case 'escape':
                this.togglePauseMenu();
                break;
            case 'f11':
                this.toggleFullscreen();
                event.preventDefault();
                break;
            case 'f12':
                this.toggleDebugMode();
                event.preventDefault();
                break;
        }
    }
    
    private handleMouseDown({ button, position }: { button: number, position: Vector2 }): void {
        if (button === 0) { // Left click
            console.log('Left clicked at:', position);
        }
    }
    
    private togglePauseMenu(): void {
        console.log('Toggle pause menu');
    }
    
    private toggleFullscreen(): void {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
    
    private toggleDebugMode(): void {
        console.log('Toggle debug mode');
    }
}
```

## Common Key Codes

### Standard Keys
- Letters: `'a'`, `'b'`, `'c'`, etc.
- Numbers: `'1'`, `'2'`, `'3'`, etc.
- Space: `' '`
- Enter: `'Enter'`
- Escape: `'Escape'`
- Tab: `'Tab'`

### Arrow Keys
- `'ArrowUp'`, `'ArrowDown'`, `'ArrowLeft'`, `'ArrowRight'`

### Function Keys
- `'F1'`, `'F2'`, `'F3'`, etc.

### Modifier Keys
- `'Shift'`, `'Control'`, `'Alt'`

### Special Keys
- `'Backspace'`, `'Delete'`, `'Home'`, `'End'`
- `'PageUp'`, `'PageDown'`

## Mouse Button Indices
- `0` - Left button
- `1` - Middle button (wheel click)
- `2` - Right button

## Common Patterns

### Multi-Key Combinations
```typescript
// Check for key combinations
if (Input.getKey('Control') && Input.getKeyDown('s')) {
    this.saveGame();
}

if (Input.getKey('Shift') && Input.getKey('w')) {
    this.sprint();
}
```

### Input State Machine
```typescript
enum InputState {
    Normal,
    Menu,
    Dialogue
}

class InputStateMachine extends Component {
    private currentState: InputState = InputState.Normal;
    
    update(): void {
        switch (this.currentState) {
            case InputState.Normal:
                this.handleNormalInput();
                break;
            case InputState.Menu:
                this.handleMenuInput();
                break;
            case InputState.Dialogue:
                this.handleDialogueInput();
                break;
        }
    }
    
    private handleNormalInput(): void {
        // Game controls
        if (Input.getKeyDown('Escape')) {
            this.currentState = InputState.Menu;
        }
    }
    
    private handleMenuInput(): void {
        // Menu navigation
        if (Input.getKeyDown('Escape')) {
            this.currentState = InputState.Normal;
        }
    }
    
    private handleDialogueInput(): void {
        // Dialogue controls
        if (Input.getKeyDown(' ')) {
            this.advanceDialogue();
        }
    }
    
    private advanceDialogue(): void {
        console.log('Dialogue advanced');
    }
}
```

## Performance Notes

- Input state is updated once per frame
- Key states are cached between frames
- Mouse position is relative to canvas when initialized
- Event listeners are set up once during initialization
- String keys are converted to lowercase for consistency

## Integration Points

- **Engine**: Calls Input.initialize() and Input.update()
- **Components**: Use static Input methods for input detection
- **Canvas**: Mouse coordinates are relative to canvas bounds
- **Events**: Can listen to input events for global handling

## Common Errors

### ❌ Case Sensitivity
```typescript
Input.getKey('W'); // May not work
Input.getKey('w'); // Correct - always use lowercase
```

### ❌ Missing Frame Check
```typescript
// WRONG - Fires every frame while held
if (Input.getKey(' ')) {
    player.jump(); // Player jumps repeatedly
}

// CORRECT - Fires once per press
if (Input.getKeyDown(' ')) {
    player.jump(); // Player jumps once
}
```

### ❌ Not Initializing Canvas
```typescript
// Mouse coordinates will be wrong if canvas not set
const mousePos = Input.getMousePosition(); // Relative to page, not canvas
```

**Solution:**
```typescript
// Engine automatically calls this
Input.initialize(canvas);
```