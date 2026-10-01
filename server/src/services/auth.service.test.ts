import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import { loadConfig } from '../config';
import { MemoryStore } from '../infrastructure/json-file-store';
import { AuthSecrets, AuthService } from './auth.service';
import { LoginRateLimiter } from './login-rate-limiter';

describe('AuthService', () => {
    it('generates a password on first start and reuses it afterwards', async () => {
        const store = new MemoryStore<AuthSecrets>();
        const config = loadConfig({});

        const first = await AuthService.create(config, store);
        assert.ok(first.generatedPassword);
        assert.ok(await first.auth.verifyCredentials('admin', first.generatedPassword));
        assert.equal(await first.auth.verifyCredentials('admin', 'wrong'), false);
        assert.equal(await first.auth.verifyCredentials('root', first.generatedPassword), false);
        assert.equal(JSON.stringify(store.data).includes(first.generatedPassword), false);

        const second = await AuthService.create(config, store);
        assert.equal(second.generatedPassword, undefined);
        const { token } = first.auth.issueToken('admin');
        assert.equal(second.auth.verifyToken(token)?.username, 'admin');
    });

    it('rejects tampered, foreign and stale tokens', async () => {
        const store = new MemoryStore<AuthSecrets>();
        const { auth } = await AuthService.create(loadConfig({ ADMIN_PASSWORD: 'one' }), store);
        const { token } = auth.issueToken('admin');

        assert.equal(auth.verifyToken(token + 'x'), null);
        assert.equal(auth.verifyToken(jwt.sign({ role: 'admin', sub: 'admin' }, 'other')), null);

        const { auth: afterPasswordChange } = await AuthService.create(
            loadConfig({ ADMIN_PASSWORD: 'two' }),
            store
        );
        assert.equal(afterPasswordChange.verifyToken(token), null);
    });
});

describe('LoginRateLimiter', () => {
    it('blocks after too many failures until the window resets', () => {
        let now = 0;
        const limiter = new LoginRateLimiter(2, 1000, () => now);

        limiter.recordFailure('ip');
        assert.equal(limiter.retryAfterSeconds('ip'), 0);
        limiter.recordFailure('ip');
        assert.equal(limiter.retryAfterSeconds('ip'), 1);

        now = 1000;
        assert.equal(limiter.retryAfterSeconds('ip'), 0);
    });
});
