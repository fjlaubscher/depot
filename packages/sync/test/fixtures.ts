import { createHash } from 'node:crypto';
import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

export const config = {
  issuer: 'https://id.example/realm',
  audience: 'muster-sync',
  jwksUrl: 'https://id.example/keys'
};
export let a: Awaited<ReturnType<typeof generateKeyPair>>;
export let b: typeof a;
export let keys: object[];
export const network = vi.fn();
export const digest = (issuer = config.issuer, sub = 'alice') =>
  createHash('sha256')
    .update(JSON.stringify([issuer, sub]))
    .digest('hex');
export const token = (claims: Record<string, unknown> = {}, kid = 'a', key = a.privateKey) =>
  new SignJWT({
    iss: config.issuer,
    aud: config.audience,
    sub: 'alice',
    exp: Date.now() / 1000 + 300,
    typ: 'Bearer',
    ...claims
  })
    .setProtectedHeader({ alg: 'RS256', kid })
    .sign(key);

beforeAll(async () => {
  a = await generateKeyPair('RS256');
  b = await generateKeyPair('RS256');
});
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  keys = [{ ...(await exportJWK(a.publicKey)), kid: 'a' }];
  network.mockReset().mockImplementation(async () => Response.json({ keys }));
  vi.stubGlobal('fetch', network);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
