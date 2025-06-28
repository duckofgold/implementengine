export class PhysicsMaterial2D {
    public name: string;
    public friction: number;
    public restitution: number; // Bounciness (0 = no bounce, 1 = perfect bounce)
    public density: number;
    public frictionCombine: CombineMode;
    public restitutionCombine: CombineMode;

    constructor(
        name: string = 'Default',
        friction: number = 0.4,
        restitution: number = 0,
        density: number = 1
    ) {
        this.name = name;
        this.friction = Math.max(0, friction);
        this.restitution = Math.max(0, Math.min(1, restitution));
        this.density = Math.max(0.1, density);
        this.frictionCombine = CombineMode.Average;
        this.restitutionCombine = CombineMode.Average;
    }

    public clone(): PhysicsMaterial2D {
        const material = new PhysicsMaterial2D(this.name + '_clone', this.friction, this.restitution, this.density);
        material.frictionCombine = this.frictionCombine;
        material.restitutionCombine = this.restitutionCombine;
        return material;
    }

    // Static helper methods for combining material properties
    public static combineFriction(material1: PhysicsMaterial2D, material2: PhysicsMaterial2D): number {
        return PhysicsMaterial2D.combineValues(
            material1.friction,
            material2.friction,
            material1.frictionCombine,
            material2.frictionCombine
        );
    }

    public static combineRestitution(material1: PhysicsMaterial2D, material2: PhysicsMaterial2D): number {
        return PhysicsMaterial2D.combineValues(
            material1.restitution,
            material2.restitution,
            material1.restitutionCombine,
            material2.restitutionCombine
        );
    }

    private static combineValues(value1: number, value2: number, mode1: CombineMode, mode2: CombineMode): number {
        // Use the more restrictive combine mode
        const mode = Math.max(mode1, mode2);

        switch (mode) {
            case CombineMode.Average:
                return (value1 + value2) / 2;
            case CombineMode.Minimum:
                return Math.min(value1, value2);
            case CombineMode.Maximum:
                return Math.max(value1, value2);
            case CombineMode.Multiply:
                return value1 * value2;
            default:
                return (value1 + value2) / 2;
        }
    }

    // Predefined materials
    public static get Default(): PhysicsMaterial2D {
        return new PhysicsMaterial2D('Default', 0.4, 0, 1);
    }

    public static get Ice(): PhysicsMaterial2D {
        return new PhysicsMaterial2D('Ice', 0.02, 0.1, 0.9);
    }

    public static get Rubber(): PhysicsMaterial2D {
        return new PhysicsMaterial2D('Rubber', 1.0, 0.8, 1.5);
    }

    public static get Metal(): PhysicsMaterial2D {
        return new PhysicsMaterial2D('Metal', 0.15, 0.2, 7.8);
    }

    public static get Wood(): PhysicsMaterial2D {
        return new PhysicsMaterial2D('Wood', 0.7, 0.3, 0.6);
    }

    public static get Bouncy(): PhysicsMaterial2D {
        return new PhysicsMaterial2D('Bouncy', 0.3, 1.0, 1.0);
    }
}

export enum CombineMode {
    Average = 0,
    Minimum = 1,
    Maximum = 2,
    Multiply = 3
}