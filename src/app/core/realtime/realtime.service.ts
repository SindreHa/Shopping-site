import { DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, Observable, repeat, retry, Subject, timer } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WS_URL } from '../../api/api.config';
import {
    ClientMessage,
    ServerMessage,
    ServerMessageOf,
    ServerMessageType,
} from '../../api/model/realtime.model';
import { AuthService } from '../auth/auth.service';

const MAX_RECONNECT_DELAY_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class RealtimeService {
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    private socket: WebSocketSubject<ServerMessage | ClientMessage> | null = null;
    private messages = new Subject<ServerMessage>();

    public isConnected$ = signal<boolean>(false);
    public online$ = signal<number | null>(null);
    public isAdminChannel$ = signal<boolean>(false);

    constructor() {
        // Upgrade or downgrade the open socket whenever the admin session changes
        effect(() => {
            const token = this.authService.token$();
            untracked(() => this.sendAuth(token));
        });
    }

    public connect(): void {
        if (this.socket) {
            return;
        }

        this.socket = webSocket<ServerMessage | ClientMessage>({
            url: WS_URL,
            openObserver: {
                next: () => {
                    this.isConnected$.set(true);
                    this.sendAuth(this.authService.token$());
                },
            },
            closeObserver: {
                next: () => {
                    this.isConnected$.set(false);
                    this.isAdminChannel$.set(false);
                    this.online$.set(null);
                },
            },
        });

        this.socket
            .pipe(
                retry({ delay: (_error, attempt) => this.backoff(attempt), resetOnSuccess: true }),
                repeat({ delay: () => this.backoff(1) }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(message => this.handle(message as ServerMessage));
    }

    public on<T extends ServerMessageType>(type: T): Observable<ServerMessageOf<T>> {
        return this.messages.pipe(
            filter((message): message is ServerMessageOf<T> => message.type === type)
        );
    }

    private handle(message: ServerMessage): void {
        switch (message.type) {
            case 'presence':
                this.online$.set(message.online);
                break;
            case 'auth.ok':
                this.isAdminChannel$.set(true);
                break;
            case 'auth.failed':
                this.isAdminChannel$.set(false);
                break;
            default:
                this.messages.next(message);
        }
    }

    private sendAuth(token: string | null): void {
        if (!this.socket || !this.isConnected$()) {
            return;
        }
        this.socket.next(token ? { type: 'auth', token } : { type: 'deauth' });
        if (!token) {
            this.isAdminChannel$.set(false);
        }
    }

    /** Exponential backoff with jitter: ~1s, 2s, 4s ... capped at 30s. */
    private backoff(attempt: number): Observable<0> {
        const base = Math.min(1000 * 2 ** (attempt - 1), MAX_RECONNECT_DELAY_MS);
        return timer(base / 2 + Math.random() * (base / 2));
    }
}
