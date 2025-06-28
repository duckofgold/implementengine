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

export { Vector2 } from './utils/Vector2';
export { EventEmitter, type EventListener } from './utils/EventEmitter';
export { AssetLoader, type LoadedAsset } from './utils/AssetLoader';

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
import { Vector2 } from './utils/Vector2';
import { EventEmitter } from './utils/EventEmitter';
import { AssetLoader } from './utils/AssetLoader';

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
    Vector2,
    EventEmitter,
    AssetLoader
};