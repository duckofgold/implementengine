export type EasingFunction = (t: number) => number;

export class Easing {
    public static linear(t: number): number {
        return t;
    }

    public static easeInQuad(t: number): number {
        return t * t;
    }

    public static easeOutQuad(t: number): number {
        return t * (2 - t);
    }

    public static easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    public static easeInCubic(t: number): number {
        return t * t * t;
    }

    public static easeOutCubic(t: number): number {
        return (--t) * t * t + 1;
    }

    public static easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    public static easeInQuart(t: number): number {
        return t * t * t * t;
    }

    public static easeOutQuart(t: number): number {
        return 1 - (--t) * t * t * t;
    }

    public static easeInOutQuart(t: number): number {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    }

    public static easeInQuint(t: number): number {
        return t * t * t * t * t;
    }

    public static easeOutQuint(t: number): number {
        return 1 + (--t) * t * t * t * t;
    }

    public static easeInOutQuint(t: number): number {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
    }

    public static easeInSine(t: number): number {
        return 1 - Math.cos(t * Math.PI / 2);
    }

    public static easeOutSine(t: number): number {
        return Math.sin(t * Math.PI / 2);
    }

    public static easeInOutSine(t: number): number {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    public static easeInExpo(t: number): number {
        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
    }

    public static easeOutExpo(t: number): number {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    public static easeInOutExpo(t: number): number {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    }

    public static easeInCirc(t: number): number {
        return 1 - Math.sqrt(1 - t * t);
    }

    public static easeOutCirc(t: number): number {
        return Math.sqrt(1 - (--t) * t);
    }

    public static easeInOutCirc(t: number): number {
        return t < 0.5
            ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
            : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
    }

    public static easeInBack(t: number): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
    }

    public static easeOutBack(t: number): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    public static easeInOutBack(t: number): number {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    }

    public static easeInElastic(t: number): number {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
            ? 0
            : t === 1
            ? 1
            : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }

    public static easeOutElastic(t: number): number {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
            ? 0
            : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    public static easeInOutElastic(t: number): number {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0
            ? 0
            : t === 1
            ? 1
            : t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
            : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    }

    public static easeInBounce(t: number): number {
        return 1 - Easing.easeOutBounce(1 - t);
    }

    public static easeOutBounce(t: number): number {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    public static easeInOutBounce(t: number): number {
        return t < 0.5
            ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
            : (1 + Easing.easeOutBounce(2 * t - 1)) / 2;
    }

    public static getEasingFunction(name: string): EasingFunction {
        const easingMap: { [key: string]: EasingFunction } = {
            'linear': Easing.linear,
            'easeInQuad': Easing.easeInQuad,
            'easeOutQuad': Easing.easeOutQuad,
            'easeInOutQuad': Easing.easeInOutQuad,
            'easeInCubic': Easing.easeInCubic,
            'easeOutCubic': Easing.easeOutCubic,
            'easeInOutCubic': Easing.easeInOutCubic,
            'easeInQuart': Easing.easeInQuart,
            'easeOutQuart': Easing.easeOutQuart,
            'easeInOutQuart': Easing.easeInOutQuart,
            'easeInQuint': Easing.easeInQuint,
            'easeOutQuint': Easing.easeOutQuint,
            'easeInOutQuint': Easing.easeInOutQuint,
            'easeInSine': Easing.easeInSine,
            'easeOutSine': Easing.easeOutSine,
            'easeInOutSine': Easing.easeInOutSine,
            'easeInExpo': Easing.easeInExpo,
            'easeOutExpo': Easing.easeOutExpo,
            'easeInOutExpo': Easing.easeInOutExpo,
            'easeInCirc': Easing.easeInCirc,
            'easeOutCirc': Easing.easeOutCirc,
            'easeInOutCirc': Easing.easeInOutCirc,
            'easeInBack': Easing.easeInBack,
            'easeOutBack': Easing.easeOutBack,
            'easeInOutBack': Easing.easeInOutBack,
            'easeInElastic': Easing.easeInElastic,
            'easeOutElastic': Easing.easeOutElastic,
            'easeInOutElastic': Easing.easeInOutElastic,
            'easeInBounce': Easing.easeInBounce,
            'easeOutBounce': Easing.easeOutBounce,
            'easeInOutBounce': Easing.easeInOutBounce
        };

        return easingMap[name] || Easing.linear;
    }

    public static interpolate(start: number, end: number, t: number, easingFunction: EasingFunction = Easing.linear): number {
        const clampedT = Math.max(0, Math.min(1, t));
        const easedT = easingFunction(clampedT);
        return start + (end - start) * easedT;
    }
}