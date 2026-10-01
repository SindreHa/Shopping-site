import { IncomingMessage, Server } from 'node:http';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { EventBus, Unsubscribe } from '../infrastructure/event-bus';
import { DomainEvent, ServerMessage } from '../models/realtime.model';
import { AuthService } from '../services/auth.service';
import { clientMessageSchema } from '../validation/schemas';

interface ClientState {
    isAlive: boolean;
    admin: { username: string; expiresAt: number } | null;
}

export interface RealtimeOptions {
    allowedOrigins: string[];
    heartbeatIntervalMs: number;
}

/**
 * Pushes domain events to browsers over WebSocket at /ws.
 * Everyone gets catalog + presence updates; only authenticated admins get orders.
 */
export class RealtimeGateway {
    private readonly wss: WebSocketServer;
    private readonly clients = new Map<WebSocket, ClientState>();
    private readonly heartbeat: NodeJS.Timeout;
    private readonly unsubscribe: Unsubscribe;

    constructor(
        server: Server,
        events: EventBus,
        private readonly auth: AuthService,
        private readonly options: RealtimeOptions
    ) {
        this.wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8 * 1024 });
        this.wss.on('connection', (socket, request) => this.onConnection(socket, request));
        this.heartbeat = setInterval(() => this.checkHeartbeats(), options.heartbeatIntervalMs);
        this.unsubscribe = events.subscribe(event => this.onDomainEvent(event));
    }

    public get onlineCount(): number {
        return this.clients.size;
    }

    public close(): void {
        clearInterval(this.heartbeat);
        this.unsubscribe();
        for (const socket of this.clients.keys()) {
            socket.close(1001, 'Server shutting down');
        }
        this.wss.close();
    }

    private onConnection(socket: WebSocket, request: IncomingMessage): void {
        // Browsers always send Origin; this blocks other sites from opening sockets as our users
        const origin = request.headers.origin;
        if (origin && !this.options.allowedOrigins.includes(origin)) {
            socket.close(1008, 'Origin not allowed');
            return;
        }

        const state: ClientState = { isAlive: true, admin: null };
        this.clients.set(socket, state);

        socket.on('pong', () => (state.isAlive = true));
        socket.on('message', (data, isBinary) => this.onMessage(socket, state, data, isBinary));
        socket.on('close', () => {
            this.clients.delete(socket);
            this.broadcastPresence();
        });
        socket.on('error', error => console.warn('WebSocket error:', error.message));

        this.broadcastPresence();
    }

    private onMessage(
        socket: WebSocket,
        state: ClientState,
        data: RawData,
        isBinary: boolean
    ): void {
        if (isBinary) {
            return;
        }

        let json: unknown;
        try {
            json = JSON.parse(data.toString());
        } catch {
            return;
        }

        const parsed = clientMessageSchema.safeParse(json);
        if (!parsed.success) {
            return;
        }

        const message = parsed.data;
        switch (message.type) {
            case 'auth': {
                state.admin = this.auth.verifyToken(message.token);
                this.send(
                    socket,
                    state.admin
                        ? { type: 'auth.ok', username: state.admin.username }
                        : { type: 'auth.failed' }
                );
                break;
            }
            case 'deauth':
                state.admin = null;
                break;
        }
    }

    private onDomainEvent(event: DomainEvent): void {
        const adminOnly = event.type === 'order.placed';
        for (const [socket, state] of this.clients) {
            if (!adminOnly || this.isAdmin(state)) {
                this.send(socket, event);
            }
        }
    }

    private isAdmin(state: ClientState): boolean {
        return !!state.admin && state.admin.expiresAt * 1000 > Date.now();
    }

    private broadcastPresence(): void {
        const message: ServerMessage = { type: 'presence', online: this.clients.size };
        for (const socket of this.clients.keys()) {
            this.send(socket, message);
        }
    }

    private checkHeartbeats(): void {
        for (const [socket, state] of this.clients) {
            if (!state.isAlive) {
                socket.terminate();
                continue;
            }
            state.isAlive = false;
            socket.ping();
        }
    }

    private send(socket: WebSocket, message: ServerMessage): void {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }
}
