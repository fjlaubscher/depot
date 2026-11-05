import { createIdentityVerifier } from './auth.js';
import type { SyncConfig } from './auth.js';
export type { SyncConfig } from './auth.js';

export function createSyncHandler(config: SyncConfig) {
  const verify = createIdentityVerifier(config);
  return async (request: Request): Promise<Response> => {
    const reply = (body: object, status: number, headers = {}) =>
      Response.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store', ...headers }
      });
    if (new URL(request.url).pathname !== '/api/sync/me') return reply({ error: 'not_found' }, 404);
    if (request.method !== 'GET')
      return reply({ error: 'method_not_allowed' }, 405, { Allow: 'GET' });
    const token = /^Bearer ([^\s]+)$/i.exec(request.headers.get('Authorization') ?? '')?.[1];
    try {
      const identity = token ? await verify(token) : null;
      return identity
        ? reply(identity, 200)
        : reply({ error: 'unauthorized' }, 401, { 'WWW-Authenticate': 'Bearer' });
    } catch {
      return reply({ error: 'unavailable' }, 503);
    }
  };
}
