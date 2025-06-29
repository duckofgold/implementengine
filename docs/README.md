# ImplementEngine API Documentation

Complete documentation for all classes, methods, and properties in ImplementEngine.

## Table of Contents

### Core System
- [Engine](./core/Engine.md) - Main engine class and configuration
- [Scene](./core/Scene.md) - Scene management and game object containers
- [GameObject](./core/GameObject.md) - Base entity class
- [Component](./core/Component.md) - Base component class
- [Time](./core/Time.md) - Time management system
- [Input](./core/Input.md) - Input handling system

### Components
- [Transform](./components/Transform.md) - Position, rotation, scale
- [SpriteRenderer](./components/SpriteRenderer.md) - Sprite rendering
- [Rigidbody2D](./components/Rigidbody2D.md) - Physics body
- [Collider2D](./components/Collider2D.md) - Base collision detection
- [BoxCollider2D](./components/BoxCollider2D.md) - Box collision shapes
- [CircleCollider2D](./components/CircleCollider2D.md) - Circle collision shapes
- [Animator](./components/Animator.md) - Animation controller
- [AudioSource](./components/AudioSource.md) - Audio playback

### Rendering
- [Renderer](./rendering/Renderer.md) - Rendering system
- [Camera](./rendering/Camera.md) - Camera and viewport

### Animation
- [Animation](./animation/Animation.md) - Base animation class
- [SpriteAnimation](./animation/SpriteAnimation.md) - Sprite-based animation
- [Tween](./animation/Tween.md) - Property tweening
- [AnimationStateMachine](./animation/AnimationStateMachine.md) - State-based animation

### Physics
- [Physics2DWorld](./physics/Physics2DWorld.md) - Physics simulation
- [PhysicsMaterial2D](./physics/PhysicsMaterial2D.md) - Material properties

### Audio
- [AudioManager](./audio/AudioManager.md) - Audio system management
- [AudioClip](./audio/AudioClip.md) - Audio asset handling
- [AudioSource](./audio/AudioSource.md) - Audio playback control

### Utilities
- [Vector2](./utils/Vector2.md) - 2D vector mathematics
- [EventEmitter](./utils/EventEmitter.md) - Event system
- [AssetLoader](./utils/AssetLoader.md) - Asset loading utilities
- [Easing](./utils/Easing.md) - Easing functions

## Quick Reference

### Common Usage Patterns

```typescript
// Engine initialization
const engine = Engine.createInstance({
    canvas: document.getElementById('canvas'),
    backgroundColor: '#1a1a1a',
    targetFPS: 60
});

// Scene setup
const scene = new Scene('GameScene');
engine.setScene(scene);

// GameObject creation
const player = new GameObject('Player');
const transform = player.addComponent(Transform);
const sprite = player.addComponent(SpriteRenderer);
scene.addGameObject(player);

// Start engine
engine.start();
```

### Error Prevention

**IMPORTANT**: This documentation reflects the ACTUAL API as implemented. Do not assume methods exist without checking this documentation first.

## Documentation Standards

Each class documentation includes:
- **Class overview** and purpose
- **Constructor parameters** with types and defaults
- **Public properties** with types and descriptions
- **Public methods** with signatures, parameters, and return types
- **Usage examples** with working code
- **Common pitfalls** and error prevention
- **Related classes** and integration points