import { expect, it } from 'vitest';
import { createSyncHandler } from './index.js';
import { config, digest, network, token } from '../test/fixtures.js';

it('returns only the verified identity', async () => {
  const response = await createSyncHandler(config)(
    new Request('https://app.example/api/sync/me', {
      headers: { Authorization: `Bearer ${await token()}` }
    })
  );
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.json()).toEqual({ accountId: digest() });
});
it.each([
  ['/me', 'GET', {}, 401, 'unauthorized'],
  ['/me', 'GET', { Authorization: 'Bearer ' }, 401, 'unauthorized'],
  ['/me', 'GET', { Authorization: 'Basic abc' }, 401, 'unauthorized'],
  ['/me', 'GET', { Authorization: 'Bearer bad' }, 401, 'unauthorized'],
  ['/me?access_token=secret', 'GET', { Cookie: 'access_token=secret' }, 401, 'unauthorized'],
  ['/me', 'POST', {}, 405, 'method_not_allowed'],
  ['/me', 'HEAD', {}, 405, 'method_not_allowed'],
  ['/missing', 'GET', {}, 404, 'not_found'],
  ['', 'GET', {}, 404, 'not_found']
] as const)('handles %s %s', async (path, method, headers, status, error) => {
  const response = await createSyncHandler(config)(
    new Request(`https://app.example/api/sync${path}`, { method, headers })
  );
  expect(response.status).toBe(status);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(response.headers.get('content-type')).toContain('application/json');
  expect(await response.json()).toEqual({ error });
  if (status === 401) expect(response.headers.get('www-authenticate')).toBe('Bearer');
  if (status === 405) expect(response.headers.get('allow')).toBe('GET');
});
it('hides infrastructure failures', async () => {
  network.mockRejectedValue(new Error('secret infrastructure details'));
  const response = await createSyncHandler(config)(
    new Request('https://app.example/api/sync/me', {
      headers: { Authorization: `Bearer ${await token({ email: 'private@example.org' })}` }
    })
  );
  expect(response.status).toBe(503);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.json()).toEqual({ error: 'unavailable' });
});
it('rejects invalid configuration at creation', () => {
  expect(() => createSyncHandler({ ...config, audience: '' })).toThrow();
});
