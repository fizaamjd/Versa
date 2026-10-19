import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../src/app/api/plans/route.ts';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
    globalThis.fetch = originalFetch;
    for (const key of ['API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL', 'NODE_ENV']) {
        if (originalEnv[key] === undefined) delete process.env[key];
        else process.env[key] = originalEnv[key];
    }
});

function configure() {
    delete process.env.API_BASE_URL;
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://backend.invalid/api/';
    process.env.NODE_ENV = 'production';
}

test('forwards public plans unchanged without cookies or authorization', async () => {
    configure();
    const plans = [{ _id: 'fixture', name: 'Test plan', price: 42 }];
    globalThis.fetch = async (url, options) => {
        assert.equal(url, 'https://backend.invalid/api/plans');
        assert.deepEqual(options.headers, { Accept: 'application/json' });
        assert.equal(options.cache, 'no-store');
        assert.ok(options.signal instanceof AbortSignal);
        return Response.json(plans);
    };
    const response = await GET();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), plans);
});

test('empty catalog stays empty, never replaced by sample prices', async () => {
    configure();
    globalThis.fetch = async () => Response.json([]);
    assert.deepEqual(await (await GET()).json(), []);
});

test('upstream failure remains an error without exposing its response', async () => {
    configure();
    globalThis.fetch = async () => new Response('private upstream diagnostic', { status: 500 });
    const response = await GET();
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes('private upstream diagnostic'));
});

test('malformed catalog is rejected', async () => {
    configure();
    globalThis.fetch = async () => Response.json({ plans: [] });
    assert.equal((await GET()).status, 502);
});

test('unreachable or timed out service returns unavailable, never prices', async () => {
    configure();
    globalThis.fetch = async () => { throw new Error('connection failed'); };
    assert.equal((await GET()).status, 503);
});

test('missing production configuration never requests browser localhost', async () => {
    configure();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    globalThis.fetch = async () => { assert.fail('must not fetch without configuration'); };
    assert.equal((await GET()).status, 503);
});
