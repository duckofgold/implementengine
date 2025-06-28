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
export { Rigidbody2D, BodyType, ForceMode } from './components/Rigidbody2D';
export { Collider2D, type Bounds2D, type RaycastHit2D, type ColliderDistance2D, type Collision2D, type ContactPoint2D, CollisionDetection2D } from './components/Collider2D';
export { BoxCollider2D } from './components/BoxCollider2D';
export { CircleCollider2D } from './components/CircleCollider2D';

export { Animation } from './animation/Animation';
export { SpriteAnimation, type SpriteAnimationData, type SpriteFrame } from './animation/SpriteAnimation';
export { Tween, TweenManager, type TweenConfig } from './animation/Tween';
export { AnimationStateMachine, type AnimationState, type AnimationTransition } from './animation/AnimationStateMachine';

export { Physics2DWorld, type Physics2DSettings } from './physics/Physics2DWorld';
export { PhysicsMaterial2D, CombineMode } from './physics/PhysicsMaterial2D';
export { type CollisionInfo, type CollisionPair, type RaycastHit } from './physics/CollisionInfo';

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
import { Rigidbody2D } from './components/Rigidbody2D';
import { Collider2D } from './components/Collider2D';
import { BoxCollider2D } from './components/BoxCollider2D';
import { CircleCollider2D } from './components/CircleCollider2D';
import { Animation } from './animation/Animation';
import { SpriteAnimation } from './animation/SpriteAnimation';
import { Tween, TweenManager } from './animation/Tween';
import { AnimationStateMachine } from './animation/AnimationStateMachine';
import { Physics2DWorld } from './physics/Physics2DWorld';
import { PhysicsMaterial2D } from './physics/PhysicsMaterial2D';
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
    Rigidbody2D,
    Collider2D,
    BoxCollider2D,
    CircleCollider2D,
    Animation,
    SpriteAnimation,
    Tween,
    TweenManager,
    AnimationStateMachine,
    Physics2DWorld,
    PhysicsMaterial2D,
    Vector2,
    EventEmitter,
    AssetLoader,
    Easing
};