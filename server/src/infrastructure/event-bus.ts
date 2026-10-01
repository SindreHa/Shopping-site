import { EventEmitter } from 'node:events';
import { DomainEvent } from '../models/realtime.model';

export type Unsubscribe = () => void;

export class EventBus {
    private readonly emitter = new EventEmitter();

    public publish(event: DomainEvent): void {
        this.emitter.emit('event', event);
    }

    public subscribe(handler: (event: DomainEvent) => void): Unsubscribe {
        this.emitter.on('event', handler);
        return () => this.emitter.off('event', handler);
    }
}
