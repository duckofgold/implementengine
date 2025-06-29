# AnimationStateMachine Class Documentation

## Overview
The `AnimationStateMachine` class manages multiple animation states and transitions between them. It provides automatic transitions based on conditions, manual trigger-based transitions, blending between states, and event callbacks. Used by the Animator component to handle complex animation logic.

## Class Declaration
```typescript
export class AnimationStateMachine extends EventEmitter
```

## Interfaces

### AnimationState Interface
```typescript
interface AnimationState {
    name: string;                       // Unique state identifier
    animation: Animation;               // Animation for this state
    speed?: number;                     // Speed override for this state
    loop?: boolean;                     // Loop override for this state
    onEnter?: () => void;              // Called when entering state
    onExit?: () => void;               // Called when leaving state
    onUpdate?: (deltaTime: number) => void; // Called each frame in this state
}
```

### AnimationTransition Interface
```typescript
interface AnimationTransition {
    from: string;                       // Source state name
    to: string;                         // Target state name
    condition?: () => boolean;          // Auto-transition condition
    duration?: number;                  // Blend duration in seconds
    trigger?: string;                   // Manual trigger name
}
```

### StateMachineEvents Interface
```typescript
interface StateMachineEvents {
    stateChanged: { from: string | null; to: string };
    transitionStarted: { from: string; to: string };
    transitionCompleted: { from: string; to: string };
}
```

## Constructor
```typescript
constructor()
```

Creates an empty state machine with no states or transitions.

## Properties (Read-only)

### Current State

#### `currentStateName: string | null` (get)
Name of the currently active state.

#### `isPlaying: boolean` (get)
Whether the current animation is playing.

#### `isInTransition: boolean` (get)
Whether the state machine is currently transitioning between states.

**Example:**
```typescript
if (stateMachine.isPlaying) {
    console.log(`Currently playing: ${stateMachine.currentStateName}`);
}

if (stateMachine.isInTransition) {
    console.log('Transitioning between states');
}
```

## Methods

### State Management

#### `addState(state: AnimationState): void`
Adds a new state to the state machine.

#### `removeState(stateName: string): boolean`
Removes a state from the state machine. Returns true if removed successfully.

#### `getState(stateName: string): AnimationState | null`
Gets a state by name.

#### `hasState(stateName: string): boolean`
Checks if a state exists.

#### `getStateList(): string[]`
Returns array of all state names.

**Example:**
```typescript
// Add states
const idleState: AnimationState = {
    name: 'idle',
    animation: idleAnimation,
    loop: true,
    onEnter: () => console.log('Entered idle'),
    onExit: () => console.log('Left idle')
};

stateMachine.addState(idleState);

// Check if state exists
if (stateMachine.hasState('idle')) {
    console.log('Idle state available');
}

// Get all states
const allStates = stateMachine.getStateList();
console.log('Available states:', allStates);
```

### Transition Management

#### `addTransition(transition: AnimationTransition): void`
Adds a transition between states.

#### `removeTransition(from: string, to: string): boolean`
Removes a specific transition. Returns true if removed successfully.

#### `getTransitionList(): AnimationTransition[]`
Returns array of all transitions.

**Example:**
```typescript
// Condition-based auto transition
stateMachine.addTransition({
    from: 'idle',
    to: 'walk',
    condition: () => Input.getKey('d') || Input.getKey('a'),
    duration: 0.2 // 200ms blend
});

// Trigger-based transition
stateMachine.addTransition({
    from: 'idle',
    to: 'attack',
    trigger: 'doAttack',
    duration: 0.1
});

// Remove transition
stateMachine.removeTransition('idle', 'walk');
```

### Playback Control

#### `play(stateName?: string): void`
Plays a specific state or resumes current state.

#### `pause(): void`
Pauses the current animation.

#### `resume(): void`
Resumes the paused animation.

#### `stop(): void`
Stops the current animation and any transitions.

**Example:**
```typescript
// Play specific state
stateMachine.play('idle');

// Pause current animation
stateMachine.pause();

// Resume
stateMachine.resume();

// Stop everything
stateMachine.stop();
```

### State Changes

#### `changeState(stateName: string, force: boolean = false): boolean`
Changes to a specific state, respecting transition rules unless forced.

#### `trigger(triggerName: string): void`
Triggers a named transition.

**Example:**
```typescript
// Normal state change (checks transitions)
if (stateMachine.changeState('walk')) {
    console.log('Successfully changed to walk');
}

// Forced state change (ignores transition rules)
stateMachine.changeState('death', true);

// Trigger transition
stateMachine.trigger('doAttack');
```

### Animation Properties

#### `setSpeed(speed: number): void`
Sets playback speed for current animation.

#### `setLoop(loop: boolean): void`
Sets loop setting for current animation.

**Example:**
```typescript
// Double speed
stateMachine.setSpeed(2.0);

// Disable looping
stateMachine.setLoop(false);
```

### System Updates

#### `update(deltaTime: number): void`
Updates the state machine (called by animation system).

#### `destroy(): void`
Cleans up the state machine and removes all listeners.

## Events

The AnimationStateMachine emits the following events:

- `stateChanged` - When state changes (immediate)
- `transitionStarted` - When blend transition begins
- `transitionCompleted` - When blend transition finishes

**Example:**
```typescript
stateMachine.on('stateChanged', (event) => {
    console.log(`State changed from ${event.from} to ${event.to}`);
});

stateMachine.on('transitionStarted', (event) => {
    console.log(`Starting transition: ${event.from} → ${event.to}`);
});

stateMachine.on('transitionCompleted', (event) => {
    console.log(`Completed transition: ${event.from} → ${event.to}`);
});
```

## Usage Examples

### Character Animation State Machine
```typescript
class CharacterAnimationController {
    private stateMachine: AnimationStateMachine;
    private character: GameObject;
    
    constructor(character: GameObject) {
        this.character = character;
        this.stateMachine = new AnimationStateMachine();
        this.setupStates();
        this.setupTransitions();
        this.setupEventHandlers();
    }
    
    private async setupStates(): Promise<void> {
        const spriteSheet = await AssetLoader.loadImage('character.png');
        
        // Create animations
        const idleAnim = SpriteAnimation.fromFrameRange('idle', spriteSheet, 32, 32, 0, 3, 6);
        const walkAnim = SpriteAnimation.fromFrameRange('walk', spriteSheet, 32, 32, 4, 11, 8);
        const runAnim = SpriteAnimation.fromFrameRange('run', spriteSheet, 32, 32, 12, 19, 12);
        const jumpAnim = SpriteAnimation.fromFrameRange('jump', spriteSheet, 32, 32, 20, 23, 10);
        const attackAnim = SpriteAnimation.fromFrameRange('attack', spriteSheet, 32, 32, 24, 31, 15);
        
        // Define states with callbacks
        this.stateMachine.addState({
            name: 'idle',
            animation: idleAnim,
            loop: true,
            onEnter: () => this.onIdleEnter(),
            onExit: () => this.onIdleExit()
        });
        
        this.stateMachine.addState({
            name: 'walk',
            animation: walkAnim,
            loop: true,
            onEnter: () => this.onWalkEnter(),
            onUpdate: (dt) => this.onWalkUpdate(dt)
        });
        
        this.stateMachine.addState({
            name: 'run',
            animation: runAnim,
            loop: true,
            speed: 1.5, // Faster playback
            onEnter: () => this.onRunEnter()
        });
        
        this.stateMachine.addState({
            name: 'jump',
            animation: jumpAnim,
            loop: false,
            onEnter: () => this.onJumpEnter(),
            onExit: () => this.onJumpExit()
        });
        
        this.stateMachine.addState({
            name: 'attack',
            animation: attackAnim,
            loop: false,
            onEnter: () => this.onAttackEnter(),
            onUpdate: (dt) => this.onAttackUpdate(dt),
            onExit: () => this.onAttackExit()
        });
        
        // Start with idle
        this.stateMachine.play('idle');
    }
    
    private setupTransitions(): void {
        // Idle transitions
        this.stateMachine.addTransition({
            from: 'idle',
            to: 'walk',
            condition: () => this.isWalking(),
            duration: 0.1
        });
        
        this.stateMachine.addTransition({
            from: 'idle',
            to: 'jump',
            condition: () => this.isJumping(),
            duration: 0.05
        });
        
        this.stateMachine.addTransition({
            from: 'idle',
            to: 'attack',
            trigger: 'attack',
            duration: 0.05
        });
        
        // Walk transitions
        this.stateMachine.addTransition({
            from: 'walk',
            to: 'idle',
            condition: () => !this.isWalking(),
            duration: 0.1
        });
        
        this.stateMachine.addTransition({
            from: 'walk',
            to: 'run',
            condition: () => this.isRunning(),
            duration: 0.15
        });
        
        this.stateMachine.addTransition({
            from: 'walk',
            to: 'jump',
            condition: () => this.isJumping(),
            duration: 0.05
        });
        
        // Run transitions
        this.stateMachine.addTransition({
            from: 'run',
            to: 'walk',
            condition: () => !this.isRunning(),
            duration: 0.15
        });
        
        this.stateMachine.addTransition({
            from: 'run',
            to: 'jump',
            condition: () => this.isJumping(),
            duration: 0.05
        });
        
        // Jump transitions (back to appropriate state when landing)
        this.stateMachine.addTransition({
            from: 'jump',
            to: 'idle',
            condition: () => this.isGrounded() && !this.isWalking(),
            duration: 0.1
        });
        
        this.stateMachine.addTransition({
            from: 'jump',
            to: 'walk',
            condition: () => this.isGrounded() && this.isWalking(),
            duration: 0.1
        });
        
        // Attack transitions (return to previous state)
        this.stateMachine.addTransition({
            from: 'attack',
            to: 'idle',
            condition: () => !this.isWalking() && this.isAttackFinished(),
            duration: 0.1
        });
        
        this.stateMachine.addTransition({
            from: 'attack',
            to: 'walk',
            condition: () => this.isWalking() && this.isAttackFinished(),
            duration: 0.1
        });
    }
    
    private setupEventHandlers(): void {
        this.stateMachine.on('stateChanged', (event) => {
            console.log(`Character animation: ${event.from} → ${event.to}`);
        });
    }
    
    // Input checking methods
    private isWalking(): boolean {
        return (Input.getKey('a') || Input.getKey('d')) && !Input.getKey('shift');
    }
    
    private isRunning(): boolean {
        return (Input.getKey('a') || Input.getKey('d')) && Input.getKey('shift');
    }
    
    private isJumping(): boolean {
        return Input.getKeyDown('w') && this.isGrounded();
    }
    
    private isGrounded(): boolean {
        const rigidbody = this.character.getComponent(Rigidbody2D);
        return rigidbody?.getIsGrounded() || false;
    }
    
    private isAttackFinished(): boolean {
        const currentAnim = this.stateMachine.getState('attack')?.animation;
        return currentAnim && !currentAnim.isPlaying;
    }
    
    // State callback methods
    private onIdleEnter(): void {
        console.log('Character entered idle state');
    }
    
    private onIdleExit(): void {
        console.log('Character left idle state');
    }
    
    private onWalkEnter(): void {
        console.log('Character started walking');
        // Play footstep audio
    }
    
    private onWalkUpdate(deltaTime: number): void {
        // Handle footstep timing, dust particles, etc.
    }
    
    private onRunEnter(): void {
        console.log('Character started running');
        // Play running audio, create dust trail
    }
    
    private onJumpEnter(): void {
        console.log('Character jumped');
        // Play jump sound, create jump particles
    }
    
    private onJumpExit(): void {
        console.log('Character landed');
        // Play landing sound, screen shake
    }
    
    private onAttackEnter(): void {
        console.log('Character started attack');
        // Enable attack hitbox
    }
    
    private onAttackUpdate(deltaTime: number): void {
        // Check for hit targets during attack frames
        const currentFrame = this.getCurrentAttackFrame();
        if (currentFrame >= 3 && currentFrame <= 5) {
            this.checkAttackHits();
        }
    }
    
    private onAttackExit(): void {
        console.log('Character finished attack');
        // Disable attack hitbox
    }
    
    private getCurrentAttackFrame(): number {
        const attackState = this.stateMachine.getState('attack');
        if (attackState?.animation instanceof SpriteAnimation) {
            return attackState.animation.currentFrameIndex;
        }
        return 0;
    }
    
    private checkAttackHits(): void {
        // Implementation for checking attack collision
    }
    
    public handleInput(): void {
        // Handle attack input
        if (Input.getKeyDown(' ')) {
            this.stateMachine.trigger('attack');
        }
    }
    
    public update(deltaTime: number): void {
        this.handleInput();
        this.stateMachine.update(deltaTime);
    }
    
    public destroy(): void {
        this.stateMachine.destroy();
    }
}
```

### Enemy AI State Machine
```typescript
class EnemyAI {
    private stateMachine: AnimationStateMachine;
    private enemy: GameObject;
    private player: GameObject | null = null;
    private detectionRange: number = 100;
    private attackRange: number = 40;
    private patrolPoints: Vector2[] = [];
    private currentPatrolIndex: number = 0;
    
    constructor(enemy: GameObject) {
        this.enemy = enemy;
        this.stateMachine = new AnimationStateMachine();
        this.setupAIStates();
        this.setupAITransitions();
        
        this.player = this.enemy.scene.findGameObject('Player');
    }
    
    private async setupAIStates(): Promise<void> {
        const spriteSheet = await AssetLoader.loadImage('enemy.png');
        
        // AI animations
        const patrolAnim = SpriteAnimation.fromFrameRange('patrol', spriteSheet, 48, 48, 0, 5, 4);
        const alertAnim = SpriteAnimation.fromFrameRange('alert', spriteSheet, 48, 48, 6, 8, 8);
        const chaseAnim = SpriteAnimation.fromFrameRange('chase', spriteSheet, 48, 48, 9, 16, 8);
        const attackAnim = SpriteAnimation.fromFrameRange('attack', spriteSheet, 48, 48, 17, 20, 12);
        const stunAnim = SpriteAnimation.fromFrameRange('stun', spriteSheet, 48, 48, 21, 23, 6);
        
        this.stateMachine.addState({
            name: 'patrol',
            animation: patrolAnim,
            loop: true,
            onUpdate: (dt) => this.updatePatrol(dt)
        });
        
        this.stateMachine.addState({
            name: 'alert',
            animation: alertAnim,
            loop: false,
            onEnter: () => this.onAlertEnter()
        });
        
        this.stateMachine.addState({
            name: 'chase',
            animation: chaseAnim,
            loop: true,
            speed: 1.2,
            onUpdate: (dt) => this.updateChase(dt)
        });
        
        this.stateMachine.addState({
            name: 'attack',
            animation: attackAnim,
            loop: false,
            onEnter: () => this.onAttackEnter(),
            onUpdate: (dt) => this.updateAttack(dt)
        });
        
        this.stateMachine.addState({
            name: 'stun',
            animation: stunAnim,
            loop: false,
            onEnter: () => this.onStunEnter()
        });
        
        this.stateMachine.play('patrol');
    }
    
    private setupAITransitions(): void {
        // Patrol → Alert (player detected)
        this.stateMachine.addTransition({
            from: 'patrol',
            to: 'alert',
            condition: () => this.canSeePlayer(),
            duration: 0.2
        });
        
        // Alert → Chase (alert animation finished)
        this.stateMachine.addTransition({
            from: 'alert',
            to: 'chase',
            condition: () => this.isAlertFinished(),
            duration: 0.1
        });
        
        // Chase → Attack (in attack range)
        this.stateMachine.addTransition({
            from: 'chase',
            to: 'attack',
            condition: () => this.isInAttackRange(),
            duration: 0.05
        });
        
        // Attack → Chase (attack finished, still in range)
        this.stateMachine.addTransition({
            from: 'attack',
            to: 'chase',
            condition: () => this.isAttackFinished() && this.canSeePlayer(),
            duration: 0.1
        });
        
        // Chase → Patrol (lost player)
        this.stateMachine.addTransition({
            from: 'chase',
            to: 'patrol',
            condition: () => !this.canSeePlayer(),
            duration: 0.3
        });
        
        // Any → Stun (when hit)
        ['patrol', 'alert', 'chase', 'attack'].forEach(state => {
            this.stateMachine.addTransition({
                from: state,
                to: 'stun',
                trigger: 'stun',
                duration: 0.05
            });
        });
        
        // Stun → Patrol (stun finished)
        this.stateMachine.addTransition({
            from: 'stun',
            to: 'patrol',
            condition: () => this.isStunFinished(),
            duration: 0.2
        });
    }
    
    private updatePatrol(deltaTime: number): void {
        // Move between patrol points
        if (this.patrolPoints.length > 0) {
            const target = this.patrolPoints[this.currentPatrolIndex];
            const current = this.enemy.transform.position;
            const direction = target.subtract(current);
            
            if (direction.magnitude() < 5) {
                this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            } else {
                const speed = 50;
                const movement = direction.normalized().multiply(speed * deltaTime);
                this.enemy.transform.translate(movement);
            }
        }
    }
    
    private updateChase(deltaTime: number): void {
        if (this.player) {
            const direction = this.player.transform.position.subtract(this.enemy.transform.position);
            const speed = 80;
            const movement = direction.normalized().multiply(speed * deltaTime);
            this.enemy.transform.translate(movement);
        }
    }
    
    private updateAttack(deltaTime: number): void {
        // Check attack hit during specific frames
        const attackState = this.stateMachine.getState('attack');
        if (attackState?.animation instanceof SpriteAnimation) {
            const frame = attackState.animation.currentFrameIndex;
            if (frame === 2) { // Hit frame
                this.performAttack();
            }
        }
    }
    
    private canSeePlayer(): boolean {
        if (!this.player) return false;
        const distance = this.enemy.transform.position.distance(this.player.transform.position);
        return distance <= this.detectionRange;
    }
    
    private isInAttackRange(): boolean {
        if (!this.player) return false;
        const distance = this.enemy.transform.position.distance(this.player.transform.position);
        return distance <= this.attackRange;
    }
    
    private isAlertFinished(): boolean {
        const alertState = this.stateMachine.getState('alert');
        return alertState && !alertState.animation.isPlaying;
    }
    
    private isAttackFinished(): boolean {
        const attackState = this.stateMachine.getState('attack');
        return attackState && !attackState.animation.isPlaying;
    }
    
    private isStunFinished(): boolean {
        const stunState = this.stateMachine.getState('stun');
        return stunState && !stunState.animation.isPlaying;
    }
    
    private onAlertEnter(): void {
        console.log('Enemy spotted player!');
        // Play alert sound, show exclamation mark
    }
    
    private onAttackEnter(): void {
        console.log('Enemy attacking!');
    }
    
    private onStunEnter(): void {
        console.log('Enemy stunned!');
        // Play stun effect, stop movement
    }
    
    private performAttack(): void {
        // Deal damage to player if in range
        if (this.isInAttackRange()) {
            console.log('Enemy hit player!');
        }
    }
    
    public takeDamage(): void {
        this.stateMachine.trigger('stun');
    }
    
    public update(deltaTime: number): void {
        this.stateMachine.update(deltaTime);
    }
}
```

### UI State Machine
```typescript
class MenuStateMachine {
    private stateMachine: AnimationStateMachine;
    
    constructor() {
        this.stateMachine = new AnimationStateMachine();
        this.setupMenuStates();
        this.setupMenuTransitions();
    }
    
    private async setupMenuStates(): Promise<void> {
        // Create simple placeholder animations for UI states
        const hiddenAnim = new SpriteAnimation({
            name: 'hidden',
            texture: new Image(), // Placeholder
            frames: [{ x: 0, y: 0, width: 1, height: 1 }],
            fps: 1
        });
        
        const showingAnim = new SpriteAnimation({
            name: 'showing',
            texture: new Image(),
            frames: [{ x: 0, y: 0, width: 1, height: 1 }],
            fps: 1
        });
        
        const visibleAnim = new SpriteAnimation({
            name: 'visible',
            texture: new Image(),
            frames: [{ x: 0, y: 0, width: 1, height: 1 }],
            fps: 1
        });
        
        const hidingAnim = new SpriteAnimation({
            name: 'hiding',
            texture: new Image(),
            frames: [{ x: 0, y: 0, width: 1, height: 1 }],
            fps: 1
        });
        
        this.stateMachine.addState({
            name: 'hidden',
            animation: hiddenAnim,
            onEnter: () => this.setMenuVisible(false)
        });
        
        this.stateMachine.addState({
            name: 'showing',
            animation: showingAnim,
            onEnter: () => this.startShowAnimation(),
            onExit: () => this.endShowAnimation()
        });
        
        this.stateMachine.addState({
            name: 'visible',
            animation: visibleAnim,
            onEnter: () => this.setMenuVisible(true)
        });
        
        this.stateMachine.addState({
            name: 'hiding',
            animation: hidingAnim,
            onEnter: () => this.startHideAnimation(),
            onExit: () => this.endHideAnimation()
        });
        
        this.stateMachine.play('hidden');
    }
    
    private setupMenuTransitions(): void {
        // Show menu
        this.stateMachine.addTransition({
            from: 'hidden',
            to: 'showing',
            trigger: 'show',
            duration: 0.3
        });
        
        this.stateMachine.addTransition({
            from: 'showing',
            to: 'visible',
            condition: () => this.isShowAnimationComplete()
        });
        
        // Hide menu
        this.stateMachine.addTransition({
            from: 'visible',
            to: 'hiding',
            trigger: 'hide',
            duration: 0.3
        });
        
        this.stateMachine.addTransition({
            from: 'hiding',
            to: 'hidden',
            condition: () => this.isHideAnimationComplete()
        });
    }
    
    private setMenuVisible(visible: boolean): void {
        const menuElement = document.getElementById('game-menu');
        if (menuElement) {
            menuElement.style.display = visible ? 'block' : 'none';
        }
    }
    
    private startShowAnimation(): void {
        const menuElement = document.getElementById('game-menu');
        if (menuElement) {
            menuElement.style.opacity = '0';
            menuElement.style.display = 'block';
            // Animate opacity to 1
        }
    }
    
    private endShowAnimation(): void {
        const menuElement = document.getElementById('game-menu');
        if (menuElement) {
            menuElement.style.opacity = '1';
        }
    }
    
    private startHideAnimation(): void {
        // Animate opacity to 0
    }
    
    private endHideAnimation(): void {
        this.setMenuVisible(false);
    }
    
    private isShowAnimationComplete(): boolean {
        // Check if show animation is finished
        return true; // Placeholder
    }
    
    private isHideAnimationComplete(): boolean {
        // Check if hide animation is finished
        return true; // Placeholder
    }
    
    public showMenu(): void {
        this.stateMachine.trigger('show');
    }
    
    public hideMenu(): void {
        this.stateMachine.trigger('hide');
    }
    
    public update(deltaTime: number): void {
        this.stateMachine.update(deltaTime);
    }
}
```

## Performance Considerations

- State machine updates run every frame when active
- Condition functions are evaluated each frame (keep them lightweight)
- Transition blending requires updating multiple animations simultaneously
- Event emission has minimal overhead
- Large numbers of states and transitions may impact lookup performance

## Common Errors

### ❌ Circular Transitions
```typescript
// WRONG - Can cause infinite transition loops
stateMachine.addTransition({
    from: 'walk',
    to: 'run',
    condition: () => true
});
stateMachine.addTransition({
    from: 'run',
    to: 'walk',
    condition: () => true
});

// CORRECT - Use proper conditions
stateMachine.addTransition({
    from: 'walk',
    to: 'run',
    condition: () => Input.getKey('shift')
});
stateMachine.addTransition({
    from: 'run',
    to: 'walk',
    condition: () => !Input.getKey('shift')
});
```

### ❌ Missing State References
```typescript
// WRONG - Referencing non-existent state
stateMachine.addTransition({
    from: 'walk',
    to: 'fly', // State 'fly' doesn't exist
    trigger: 'jump'
});

// CORRECT - Ensure state exists first
if (stateMachine.hasState('fly')) {
    stateMachine.addTransition({
        from: 'walk',
        to: 'fly',
        trigger: 'jump'
    });
}
```

### ❌ Expensive Condition Functions
```typescript
// WRONG - Expensive condition checked every frame
stateMachine.addTransition({
    from: 'idle',
    to: 'alert',
    condition: () => {
        return this.findAllEnemiesInRange().length > 0; // Expensive!
    }
});

// CORRECT - Cache or use events
private hasNearbyEnemies = false;
// Update hasNearbyEnemies when enemies enter/leave area
stateMachine.addTransition({
    from: 'idle',
    to: 'alert',
    condition: () => this.hasNearbyEnemies
});
```

### ❌ Forgetting to Update State Machine
```typescript
// WRONG - State machine not updated
class MyComponent extends Component {
    update(): void {
        // Other logic but no stateMachine.update(deltaTime)
    }
}

// CORRECT - Update in component lifecycle
class MyComponent extends Component {
    update(): void {
        this.stateMachine.update(Time.deltaTime);
    }
}
```

## Integration Points

- **Animation**: Manages Animation instances within states
- **Animator**: Uses AnimationStateMachine for complex animation logic
- **EventEmitter**: Provides event system for state change notifications
- **Component**: Typically used within Component update loops
- **Input**: Conditions often check input state for transitions