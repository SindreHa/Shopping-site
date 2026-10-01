import { readFileSync } from 'node:fs';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface Store<T> {
    read(fallback: () => T): T;
    write(data: T): Promise<void>;
    flush(): Promise<void>;
}

/**
 * Tiny JSON persistence. Writes are serialized and atomic (tmp file + rename)
 * so a crash mid-write never leaves a corrupt file behind.
 */
export class JsonFileStore<T> implements Store<T> {
    private pending: Promise<void> = Promise.resolve();

    constructor(public readonly filePath: string) {}

    public read(fallback: () => T): T {
        try {
            return JSON.parse(readFileSync(this.filePath, 'utf8')) as T;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return fallback();
            }
            throw error;
        }
    }

    public write(data: T): Promise<void> {
        const json = JSON.stringify(data, null, 2);

        this.pending = this.pending
            .then(async () => {
                const tmpFile = `${this.filePath}.${process.pid}.tmp`;
                await mkdir(path.dirname(this.filePath), { recursive: true });
                await writeFile(tmpFile, json, { mode: 0o600 });
                await rename(tmpFile, this.filePath);
            })
            .catch(error => console.error(`Failed to write ${this.filePath}:`, error));

        return this.pending;
    }

    public flush(): Promise<void> {
        return this.pending;
    }
}

/** In-memory stand-in used by tests. */
export class MemoryStore<T> implements Store<T> {
    constructor(public data?: T) {}

    public read(fallback: () => T): T {
        return this.data === undefined ? fallback() : structuredClone(this.data);
    }

    public write(data: T): Promise<void> {
        this.data = structuredClone(data);
        return Promise.resolve();
    }

    public flush(): Promise<void> {
        return Promise.resolve();
    }
}
