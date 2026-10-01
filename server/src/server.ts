import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { createApp } from './app';
import { loadConfig } from './config';
import { EventBus } from './infrastructure/event-bus';
import { JsonFileStore } from './infrastructure/json-file-store';
import { Order } from './models/order.model';
import { Product } from './models/product.model';
import { RealtimeGateway } from './realtime/realtime.gateway';
import { AuthSecrets, AuthService } from './services/auth.service';
import { OrdersService } from './services/orders.service';
import { ProductsService } from './services/products.service';

const main = async (): Promise<void> => {
    const config = loadConfig();
    const events = new EventBus();

    const productsStore = new JsonFileStore<Product[]>(path.join(config.dataDir, 'products.json'));
    const ordersStore = new JsonFileStore<Order[]>(path.join(config.dataDir, 'orders.json'));
    const secretsStore = new JsonFileStore<AuthSecrets>(path.join(config.dataDir, 'secrets.json'));

    const products = new ProductsService(productsStore, events, () =>
        JSON.parse(readFileSync(config.seedProductsFile, 'utf8'))
    );
    const orders = new OrdersService(ordersStore, products, events);
    const { auth, generatedPassword } = await AuthService.create(config, secretsStore);

    let gateway: RealtimeGateway | undefined;
    const app = createApp({
        config,
        products,
        orders,
        auth,
        onlineCount: () => gateway?.onlineCount ?? 0,
    });
    const server = createServer(app);
    gateway = new RealtimeGateway(server, events, auth, config);

    server.listen(config.port, () => {
        console.log(`API        http://localhost:${config.port}/api`);
        console.log(`WebSocket  ws://localhost:${config.port}/ws`);
        console.log(`Loaded ${products.list().length} products, ${orders.list().length} orders`);
        if (generatedPassword) {
            console.log('\nGenerated admin credentials (shown once, only the hash is stored):');
            console.log(`  username: ${config.admin.username}`);
            console.log(`  password: ${generatedPassword}`);
            console.log(`Delete ${secretsStore.filePath} or set ADMIN_PASSWORD to change it.\n`);
        }
    });

    const shutdown = async (signal: string): Promise<void> => {
        console.log(`${signal} received, shutting down`);
        gateway?.close();
        server.close();
        await Promise.all([productsStore.flush(), ordersStore.flush(), secretsStore.flush()]);
        process.exit(0);
    };
    process.once('SIGINT', () => void shutdown('SIGINT'));
    process.once('SIGTERM', () => void shutdown('SIGTERM'));
};

main().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
