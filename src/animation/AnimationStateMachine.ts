import { Animation } from './Animation';
import { EventEmitter } from '../utils/EventEmitter';

export interface AnimationState {
    name: string;
    animation: Animation;
    speed?: number;
    loop?: boolean;
    onEnter?: () => void;
    onExit?: () => void;
    onUpdate?: (deltaTime: number) => void;
}

export interface AnimationTransition {
    from: string;
    to: string;
    condition?: () => boolean;
    duration?: number; // Blend duration
    trigger?: string; // Manual trigger name
}

export interface StateMachineEvents {
    stateChanged: { from: string | null; to: string };
    transitionStarted: { from: string; to: string };
    transitionCompleted: { from: string; to: string };
}

export class AnimationStateMachine extends EventEmitter {
    private states: Map<string, AnimationState> = new Map();
    private transitions: AnimationTransition[] = [];
    private currentState: AnimationState | null = null;
    private previousState: AnimationState | null = null;
    private isTransitioning: boolean = false;
    private transitionProgress: number = 0;
    private transitionDuration: number = 0;
    private activeTransition: AnimationTransition | null = null;
    private triggers: Set<string> = new Set();

    constructor() {
        super();
    }

    public get currentStateName(): string | null {
        return this.currentState?.name || null;
    }

    public get isPlaying(): boolean {
        return this.currentState?.animation.isPlaying || false;
    }

    public get isInTransition(): boolean {
        return this.isTransitioning;
    }

    public addState(state: AnimationState): void {
        this.states.set(state.name, state);
        
        // Setup animation events
        state.animation.on('end', () => {
            this.onAnimationEnd(state);
        });
    }

    public removeState(stateName: string): boolean {
        const state = this.states.get(stateName);
        if (state) {
            if (this.currentState === state) {
                this.currentState = null;
            }
            this.states.delete(stateName);
            return true;
        }
        return false;
    }

    public getState(stateName: string): AnimationState | null {
        return this.states.get(stateName) || null;
    }

    public hasState(stateName: string): boolean {
        return this.states.has(stateName);
    }

    public addTransition(transition: AnimationTransition): void {
        this.transitions.push(transition);
    }

    public removeTransition(from: string, to: string): boolean {
        const index = this.transitions.findIndex(t => t.from === from && t.to === to);
        if (index !== -1) {
            this.transitions.splice(index, 1);
            return true;
        }
        return false;
    }

    public play(stateName?: string): void {
        if (stateName) {
            this.changeState(stateName);
        } else if (this.currentState) {
            this.currentState.animation.play();
        }
    }

    public pause(): void {
        if (this.currentState) {
            this.currentState.animation.pause();
        }
    }

    public resume(): void {
        if (this.currentState) {
            this.currentState.animation.resume();
        }
    }

    public stop(): void {
        if (this.currentState) {
            this.currentState.animation.stop();
        }
        this.isTransitioning = false;
        this.activeTransition = null;
    }

    public changeState(stateName: string, force: boolean = false): boolean {
        const targetState = this.states.get(stateName);
        if (!targetState) {
            console.warn(`Animation state '${stateName}' not found`);
            return false;
        }

        if (this.currentState?.name === stateName && !force) {
            return true; // Already in this state
        }

        // Check if transition is allowed
        if (!force && this.currentState && !this.canTransition(this.currentState.name, stateName)) {
            return false;
        }

        const previousStateName = this.currentState?.name || null;
        
        // Find transition for blend duration
        const transition = this.findTransition(this.currentState?.name || '', stateName);
        
        if (transition && transition.duration && transition.duration > 0) {
            this.startTransition(transition, targetState);
        } else {
            this.setStateImmediate(targetState);
        }

        this.emit('stateChanged', { from: previousStateName, to: stateName });
        return true;
    }

    public trigger(triggerName: string): void {
        this.triggers.add(triggerName);
    }

    public setSpeed(speed: number): void {
        if (this.currentState) {
            this.currentState.animation.playbackSpeed = speed;
        }
    }

    public setLoop(loop: boolean): void {
        if (this.currentState) {
            this.currentState.animation.loop = loop;
        }
    }

    public update(deltaTime: number): void {
        // Process triggers for transitions
        this.processTriggers();
        
        // Process automatic transitions
        this.processAutoTransitions();
        
        // Update current state
        if (this.currentState) {
            this.currentState.animation.update(deltaTime);
            
            if (this.currentState.onUpdate) {
                this.currentState.onUpdate(deltaTime);
            }
        }
        
        // Update transition
        if (this.isTransitioning && this.activeTransition) {
            this.updateTransition(deltaTime);
        }
        
        // Clear triggers after processing
        this.triggers.clear();
    }

    private canTransition(from: string, to: string): boolean {
        if (this.isTransitioning) return false; // Don't allow transitions during transition
        
        const transition = this.findTransition(from, to);
        if (!transition) return false;
        
        if (transition.condition && !transition.condition()) {
            return false;
        }
        
        return true;
    }

    private findTransition(from: string, to: string): AnimationTransition | null {
        return this.transitions.find(t => t.from === from && t.to === to) || null;
    }

    private setStateImmediate(state: AnimationState): void {
        // Exit current state
        if (this.currentState) {
            this.currentState.animation.stop();
            if (this.currentState.onExit) {
                this.currentState.onExit();
            }
        }
        
        this.previousState = this.currentState;
        this.currentState = state;
        
        // Configure state
        if (state.speed !== undefined) {
            state.animation.playbackSpeed = state.speed;
        }
        if (state.loop !== undefined) {
            state.animation.loop = state.loop;
        }
        
        // Enter new state
        if (state.onEnter) {
            state.onEnter();
        }
        
        state.animation.play();
    }

    private startTransition(transition: AnimationTransition, targetState: AnimationState): void {
        this.isTransitioning = true;
        this.activeTransition = transition;
        this.transitionProgress = 0;
        this.transitionDuration = transition.duration || 0;
        
        // Keep current animation playing during transition
        this.previousState = this.currentState;
        this.currentState = targetState;
        
        this.emit('transitionStarted', { from: transition.from, to: transition.to });
    }

    private updateTransition(deltaTime: number): void {
        if (!this.activeTransition || !this.isTransitioning) return;
        
        this.transitionProgress += deltaTime / this.transitionDuration;
        
        if (this.transitionProgress >= 1) {
            this.completeTransition();
        }
    }

    private completeTransition(): void {
        if (!this.activeTransition || !this.currentState) return;
        
        const fromState = this.activeTransition.from;
        const toState = this.activeTransition.to;
        
        // Stop previous animation
        if (this.previousState) {
            this.previousState.animation.stop();
            if (this.previousState.onExit) {
                this.previousState.onExit();
            }
        }
        
        // Start new animation
        if (this.currentState.speed !== undefined) {
            this.currentState.animation.playbackSpeed = this.currentState.speed;
        }
        if (this.currentState.loop !== undefined) {
            this.currentState.animation.loop = this.currentState.loop;
        }
        
        if (this.currentState.onEnter) {
            this.currentState.onEnter();
        }
        
        this.currentState.animation.play();
        
        this.isTransitioning = false;
        this.activeTransition = null;
        this.transitionProgress = 0;
        
        this.emit('transitionCompleted', { from: fromState, to: toState });
    }

    private processTriggers(): void {
        if (this.triggers.size === 0 || !this.currentState) return;
        
        for (const trigger of this.triggers) {
            const transition = this.transitions.find(t => 
                t.from === this.currentState!.name && t.trigger === trigger
            );
            
            if (transition && this.canTransition(transition.from, transition.to)) {
                this.changeState(transition.to);
                break; // Only process one transition per frame
            }
        }
    }

    private processAutoTransitions(): void {
        if (!this.currentState || this.isTransitioning) return;
        
        for (const transition of this.transitions) {
            if (transition.from === this.currentState.name && 
                !transition.trigger && 
                transition.condition && 
                transition.condition()) {
                
                if (this.canTransition(transition.from, transition.to)) {
                    this.changeState(transition.to);
                    break; // Only process one transition per frame
                }
            }
        }
    }

    private onAnimationEnd(state: AnimationState): void {
        // Check for transitions when animation ends
        if (this.currentState === state && !state.animation.loop) {
            this.processAutoTransitions();
        }
    }

    public getStateList(): string[] {
        return Array.from(this.states.keys());
    }

    public getTransitionList(): AnimationTransition[] {
        return [...this.transitions];
    }

    public destroy(): void {
        this.stop();
        this.states.clear();
        this.transitions.length = 0;
        this.removeAllListeners();
    }
}