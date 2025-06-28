export type EventListener<T = any> = (data: T) => void;

export class EventEmitter {
    private events: Map<string, EventListener[]> = new Map();

    on<T = any>(event: string, listener: EventListener<T>): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(listener);
    }

    once<T = any>(event: string, listener: EventListener<T>): void {
        const onceWrapper = (data: T): void => {
            listener(data);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }

    off<T = any>(event: string, listener: EventListener<T>): void {
        const listeners = this.events.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
            if (listeners.length === 0) {
                this.events.delete(event);
            }
        }
    }

    emit<T = any>(event: string, data?: T): void {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.slice().forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            });
        }
    }

    removeAllListeners(event?: string): void {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    listenerCount(event: string): number {
        const listeners = this.events.get(event);
        return listeners ? listeners.length : 0;
    }

    eventNames(): string[] {
        return Array.from(this.events.keys());
    }
}