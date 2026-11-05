import { expect, it, vi } from 'vitest';
import { exportJWK, SignJWT } from 'jose';
import { createIdentityVerifier } from './auth.js';
import { a, b, keys, config, network, digest, token } from '../test/fixtures.js';

it('hashes verified issuer/subject independently of email and client', async () => {
  const verify = createIdentityVerifier(config);
  expect(await verify(await token())).toEqual({ accountId: digest() });
  expect(await verify(await token({ email: 'other@example.org', azp: 'other' }))).toEqual({
    accountId: digest()
  });
  expect(await verify(await token({ sub: 'bob' }))).toEqual({
    accountId: digest(config.issuer, 'bob')
  });
  const issuer = 'https://other.example/realm';
  expect(await createIdentityVerifier({ ...config, issuer })(await token({ iss: issuer }))).toEqual(
    { accountId: digest(issuer) }
  );
  expect(digest(issuer)).not.toBe(digest());
  expect(await verify(await token({ aud: ['other', config.audience] }))).toBeTruthy();
});
it.each([
  { exp: 1 },
  { aud: undefined },
  { aud: 'other' },
  { iss: 'https://other.example' },
  { exp: undefined },
  { sub: undefined },
  { sub: '' },
  { sub: 42 },
  { sub: {} },
  { sub: [] },
  { nbf: 9999999999 },
  { typ: undefined },
  { typ: 'ID' }
])('rejects unauthorized claims %j', async (claims) => {
  expect(await createIdentityVerifier(config)(await token(claims))).toBeNull();
});
it('rejects malformed, unsigned, HMAC and forged tokens', async () => {
  const verify = createIdentityVerifier(config);
  const signed = await token();
  for (const invalid of [
    'bad',
    'eyJhbGciOiJub25lIn0.e30.',
    await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).sign(new Uint8Array(32)),
    await token({}, 'a', b.privateKey),
    signed.slice(0, -10) + 'xxxxxxxxxx'
  ]) {
    expect(await verify(invalid)).toBeNull();
  }
});
it('rejects unsupported critical JWT headers', async () => {
  const signed = await new SignJWT({})
    .setProtectedHeader({ alg: 'RS256', kid: 'a', crit: ['custom'], custom: true })
    .sign(a.privateKey, { crit: { custom: true } });
  expect(await createIdentityVerifier(config)(signed)).toBeNull();
});
it('applies exactly 30 seconds of clock tolerance', async () => {
  const verify = createIdentityVerifier(config);
  const now = Math.floor(Date.now() / 1000);
  for (const [claims, accepted] of [
    [{ exp: now - 29 }, true],
    [{ exp: now - 30 }, false],
    [{ nbf: now + 30 }, true],
    [{ nbf: now + 31 }, false]
  ] as const) {
    expect(Boolean(await verify(await token(claims)))).toBe(accepted);
  }
});
it('bounds rotation refreshes and fails closed after cache expiry', async () => {
  const verify = createIdentityVerifier(config);
  expect(await verify(await token())).toBeTruthy();
  keys.push({ ...(await exportJWK(b.publicKey)), kid: 'b' });
  const rotated = await token({}, 'b', b.privateKey);
  expect(await verify(rotated)).toBeNull();
  expect(network).toHaveBeenCalledTimes(1);
  vi.setSystemTime(Date.now() + 30001);
  expect(await verify(rotated)).toBeTruthy();
  expect(await verify(await token({}, 'missing'))).toBeNull();
  expect(await verify(await token({}, 'missing'))).toBeNull();
  expect(network).toHaveBeenCalledTimes(2);
  network.mockRejectedValue(new Error('private network detail'));
  expect(await verify(await token())).toBeTruthy();
  vi.setSystemTime(Date.now() + 600001);
  await expect(verify(await token())).rejects.toThrow();
});
it.each(['network', 'timeout', 'malformed', 'redirect'])(
  'reports unavailable JWKS: %s',
  async (failure) => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    network.mockImplementation(async (_url, options) => {
      expect(options.redirect).toBe('manual');
      expect(options.signal).toBeInstanceOf(AbortSignal);
      if (failure === 'network') throw new Error('private detail');
      if (failure === 'timeout') throw new DOMException('Timeout', 'TimeoutError');
      return failure === 'redirect'
        ? new Response(null, { status: 302, headers: { Location: 'https://evil.example' } })
        : Response.json({ keys: 'bad' });
    });
    await expect(createIdentityVerifier(config)(await token())).rejects.toThrow();
    expect(network).toHaveBeenCalledTimes(1);
    expect(timeout).toHaveBeenCalledWith(5000);
  }
);
it('ignores token-supplied key URLs', async () => {
  const signed = await new SignJWT({
    iss: config.issuer,
    aud: config.audience,
    sub: 'alice',
    exp: Date.now() / 1000 + 100,
    typ: 'Bearer'
  })
    .setProtectedHeader({
      alg: 'RS256',
      kid: 'a',
      jku: 'https://evil.example',
      x5u: 'https://evil.example'
    })
    .sign(a.privateKey);
  expect(await createIdentityVerifier(config)(signed)).toBeTruthy();
  expect(network.mock.calls.every(([url]) => url === config.jwksUrl)).toBe(true);
});
it.each([
  { issuer: '' },
  { audience: '' },
  { jwksUrl: '' },
  { issuer: 'http://id.example' },
  { issuer: 'https://user:pass@id.example' },
  { jwksUrl: 'https://id.example/keys?q=1' },
  { issuer: 'https://id.example/#fragment' },
  { issuer: 'https://id.example/?' },
  { jwksUrl: 'https://id.example/keys#' },
  { allowLocalHttp: true, issuer: 'http://evil.example:8080/realms/muster-dev' }
])('rejects unsafe configuration %j', (change) => {
  expect(() => createIdentityVerifier({ ...config, ...change })).toThrow();
});
it('allows only the exact local HTTP pair with explicit opt-in', () => {
  const local = {
    ...config,
    issuer: 'http://localhost:8080/realms/muster-dev',
    jwksUrl: 'http://localhost:8080/realms/muster-dev/protocol/openid-connect/certs'
  };
  expect(() => createIdentityVerifier(local)).toThrow();
  expect(() => createIdentityVerifier({ ...local, allowLocalHttp: true })).not.toThrow();
  expect(() =>
    createIdentityVerifier({ ...local, allowLocalHttp: true, jwksUrl: config.jwksUrl })
  ).toThrow();
});
