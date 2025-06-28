# ImplementEngine 🎮

A production-level 2D game engine built with TypeScript, designed for intuitive development and robust performance.

## Features

- **Component-Based Architecture**: Flexible and modular entity-component system
- **TypeScript First**: Full type safety and excellent developer experience
- **Intuitive API**: Clean, fluent interfaces that feel natural to use
- **Performance Optimized**: Efficient rendering and game loop management
- **Event-Driven**: Powerful event system for loose coupling
- **Asset Management**: Comprehensive asset loading and caching system
- **Input Handling**: Complete keyboard and mouse input support
- **Camera System**: Flexible 2D camera with zoom, rotation, and effects

## Quick Start

### Installation

```bash
npm install
```

### Basic Usage

```typescript
import { Engine, Scene, GameObject, SpriteRenderer, Transform, Vector2 } from 'implementengine';

// Create engine instance
const engine = Engine.createInstance({
    width: 800,
    height: 600,
    backgroundColor: '#2C3E50'
});

// Create a scene
const scene = new Scene('Main Scene');

// Create a game object
const player = new GameObject('Player');
player.transform.position = new Vector2(400, 300);

// Add sprite renderer
const spriteRenderer = player.addComponent(SpriteRenderer);
spriteRenderer.setSprite(myImage); // Your loaded image

// Add to scene and start
scene.addGameObject(player);
engine.setScene(scene);
engine.start();
```

## Core Concepts

### GameObjects and Components

ImplementEngine uses an Entity-Component-System (ECS) architecture:

```typescript
// Create a game object
const enemy = new GameObject('Enemy');

// Add components
enemy.addComponent(Transform, 100, 100); // x, y position
enemy.addComponent(SpriteRenderer, enemySprite);
enemy.addComponent(MyCustomBehavior);

// Access components
const transform = enemy.getComponent(Transform);
const renderer = enemy.getComponent(SpriteRenderer);
```

### Custom Components

```typescript
class PlayerController extends Component {
    speed = 200;
    
    update() {
        const movement = new Vector2();
        
        if (Input.getKey('w')) movement.y -= 1;
        if (Input.getKey('s')) movement.y += 1;
        if (Input.getKey('a')) movement.x -= 1;
        if (Input.getKey('d')) movement.x += 1;
        
        if (movement.magnitude() > 0) {
            movement.normalize();
            const velocity = movement.multiply(this.speed * Time.deltaTime);
            this.transform.translate(velocity);
        }
    }
}
```

### Asset Loading

```typescript
import { AssetLoader } from 'implementengine';

// Load assets
await AssetLoader.loadImage('player', './assets/player.png');
await AssetLoader.loadAudio('jump', './assets/jump.wav');

// Use loaded assets
const playerSprite = AssetLoader.getAsset<HTMLImageElement>('player');
const jumpSound = AssetLoader.getAsset<HTMLAudioElement>('jump');
```

### Input Handling

```typescript
import { Input } from 'implementengine';

// In your component's update method
if (Input.getKeyDown('space')) {
    // Jump!
}

if (Input.getMouseButtonDown(0)) {
    const mousePos = Input.getMousePosition();
    console.log('Clicked at:', mousePos);
}
```

## Architecture

### Core Systems

- **Engine**: Main game loop and system coordinator
- **Scene**: Container for game objects with lifecycle management
- **GameObject**: Entity that holds components
- **Component**: Base class for all game logic and behaviors
- **Transform**: Essential component for position, rotation, and scale

### Rendering

- **Renderer**: Canvas-based 2D renderer with sprite support
- **Camera**: Flexible camera system with zoom, rotation, and effects
- **SpriteRenderer**: Component for displaying sprites and images

### Utilities

- **Vector2**: Comprehensive 2D vector mathematics
- **Time**: Delta time, frame rate, and time scale management
- **EventEmitter**: Robust event system for component communication
- **AssetLoader**: Asset management with caching and loading states

## Development Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Examples

Check out the `examples/` directory for complete game examples:

- `basic-game.html` - Simple player movement and basic rendering
- More examples coming soon!

## Built-in Components

### Transform
Essential component for position, rotation, and scale with full hierarchy support.

### SpriteRenderer
Renders sprites with support for:
- Color tinting
- Alpha blending
- Sprite flipping
- Source rectangles (sprite sheets)
- Sorting layers
- Pixel-perfect rendering

## API Reference

### Engine
```typescript
// Create engine
Engine.createInstance(config: EngineConfig): Engine

// Control engine
engine.start(): void
engine.pause(): void
engine.resume(): void
engine.stop(): void

// Scene management
engine.setScene(scene: Scene): void
engine.getCurrentScene(): Scene | null
```

### Scene
```typescript
// Object management
scene.addGameObject(gameObject: GameObject): void
scene.removeGameObject(gameObject: GameObject): boolean
scene.findGameObject(name: string): GameObject | null

// Lifecycle
scene.start(): void
scene.update(): void
scene.unload(): void
```

### GameObject
```typescript
// Component management
gameObject.addComponent<T>(componentClass, ...args): T
gameObject.getComponent<T>(componentClass): T | null
gameObject.removeComponent<T>(component): boolean

// Lifecycle
gameObject.setActive(active: boolean): void
gameObject.destroy(): void
```

## Contributing

ImplementEngine is designed to be extensible and welcoming to contributions. See the architecture guide for more details on how to extend the engine.

## License

MIT License - feel free to use ImplementEngine in your projects!

---

Built with ❤️ by Implement Technologies Inc