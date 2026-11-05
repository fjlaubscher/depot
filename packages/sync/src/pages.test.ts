import { expect, it } from 'vitest';
import { onRequest } from '../../../functions/api/sync/[[path]].js';
import { config, digest, network, token } from '../test/fixtures.js';

it('rejects absent configuration and requires the literal local opt-in', async () => {
  const request = new Request('https://app.example/api/sync/me');
  for (const env of [
    {},
    {
      SYNC_OIDC_ISSUER: 'http://localhost:8080/realms/muster-dev',
      SYNC_OIDC_AUDIENCE: 'muster-sync',
      SYNC_OIDC_JWKS_URL: 'http://localhost:8080/realms/muster-dev/protocol/openid-connect/certs',
      SYNC_OIDC_ALLOW_LOCAL_HTTP: '1'
    }
  ]) {
    const response = await onRequest({ request, env });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'unavailable' });
  }
});
it('reuses one handler and replaces it when any configuration changes', async () => {
  const env = {
    SYNC_OIDC_ISSUER: config.issuer,
    SYNC_OIDC_AUDIENCE: config.audience,
    SYNC_OIDC_JWKS_URL: config.jwksUrl
  };
  const call = async (issuer: string, jwksUrl: string) =>
    onRequest({
      env: { ...env, SYNC_OIDC_ISSUER: issuer, SYNC_OIDC_JWKS_URL: jwksUrl },
      request: new Request('https://app.example/api/sync/me', {
        headers: { Authorization: `Bearer ${await token({ iss: issuer })}` }
      })
    });
  for (const issuer of [
    config.issuer,
    config.issuer,
    'https://second.example/realm',
    config.issuer
  ]) {
    const response = await call(issuer, `${issuer}/keys`);
    expect(await response.json()).toEqual({ accountId: digest(issuer) });
  }
  expect(network).toHaveBeenCalledTimes(3);
  expect(network.mock.calls.map(([url]) => url)).toEqual([
    `${config.issuer}/keys`,
    'https://second.example/realm/keys',
    `${config.issuer}/keys`
  ]);
  const localIssuer = 'http://localhost:8080/realms/muster-dev';
  const local = await onRequest({
    env: {
      ...env,
      SYNC_OIDC_ISSUER: localIssuer,
      SYNC_OIDC_JWKS_URL: `${localIssuer}/protocol/openid-connect/certs`,
      SYNC_OIDC_ALLOW_LOCAL_HTTP: 'true'
    },
    request: new Request('https://app.example/api/sync/me')
  });
  expect(local.status).toBe(401);
});
