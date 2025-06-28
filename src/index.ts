export { Engine, type EngineConfig } from './core/Engine';
export { Scene } from './core/Scene';
export { GameObject } from './core/GameObject';
export { Component } from './core/Component';
export { Time } from './core/Time';
export { Input, type KeyState, type MouseState } from './core/Input';

export { Renderer, type RenderOptions } from './rendering/Renderer';
export { Camera } from './rendering/Camera';

export { Transform } from './components/Transform';
export { SpriteRenderer } from './components/SpriteRenderer';
export { Animator } from './components/Animator';

export { Animation } from './animation/Animation';
export { SpriteAnimation, type SpriteAnimationData, type SpriteFrame } from './animation/SpriteAnimation';
export { Tween, TweenManager, type TweenConfig } from './animation/Tween';
export { AnimationStateMachine, type AnimationState, type AnimationTransition } from './animation/AnimationStateMachine';

export { Vector2 } from './utils/Vector2';
export { EventEmitter, type EventListener } from './utils/EventEmitter';
export { AssetLoader, type LoadedAsset } from './utils/AssetLoader';
export { Easing, type EasingFunction } from './utils/Easing';

import { Engine } from './core/Engine';
import { Scene } from './core/Scene';
import { GameObject } from './core/GameObject';
import { Component } from './core/Component';
import { Time } from './core/Time';
import { Input } from './core/Input';
import { Renderer } from './rendering/Renderer';
import { Camera } from './rendering/Camera';
import { Transform } from './components/Transform';
import { SpriteRenderer } from './components/SpriteRenderer';
import { Animator } from './components/Animator';
import { Animation } from './animation/Animation';
import { SpriteAnimation } from './animation/SpriteAnimation';
import { Tween, TweenManager } from './animation/Tween';
import { AnimationStateMachine } from './animation/AnimationStateMachine';
import { Vector2 } from './utils/Vector2';
import { EventEmitter } from './utils/EventEmitter';
import { AssetLoader } from './utils/AssetLoader';
import { Easing } from './utils/Easing';

export const ImplementEngine = {
    Engine,
    Scene,
    GameObject,
    Component,
    Time,
    Input,
    Renderer,
    Camera,
    Transform,
    SpriteRenderer,
    Animator,
    Animation,
    SpriteAnimation,
    Tween,
    TweenManager,
    AnimationStateMachine,
    Vector2,
    EventEmitter,
    AssetLoader,
    Easing
};