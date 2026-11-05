import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';

const issuer = 'http://localhost:8080/realms/muster-dev';
const api = 'http://localhost:8788';
const mode = process.argv[2];
const request = (url, init, timeout = 5000) =>
  fetch(url, { ...init, signal: AbortSignal.timeout(timeout) });

async function check() {
  assert.ok(['oidc', 'api'].includes(mode), 'Usage: check-sync.mjs oidc|api');
  let ready = false;
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      const discovery = await request(
        `${issuer}/.well-known/openid-configuration`,
        undefined,
        Math.max(1, Math.min(5000, deadline - Date.now()))
      );
      ready = discovery.ok && (await discovery.json()).issuer === issuer;
      if (ready) break;
    } catch {}
    await setTimeout(Math.min(1000, Math.max(0, deadline - Date.now())));
  }
  assert.ok(ready, 'Keycloak indisponible après 90 secondes');
  const jwks = await (await request(`${issuer}/protocol/openid-connect/certs`)).json();
  const accounts = [];
  for (const [username, sub] of [
    ['alice', '11111111-1111-4111-8111-111111111111'],
    ['bob', '22222222-2222-4222-8222-222222222222']
  ]) {
    const response = await request(`${issuer}/protocol/openid-connect/token`, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'muster-check',
        username,
        password: `${username}-dev-only`
      })
    });
    assert.equal(response.status, 200, 'Acquisition du jeton refusée');
    const { access_token: token } = await response.json();
    const [header, payload] = token
      .split('.')
      .slice(0, 2)
      .map((part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8')));
    assert.ok(
      header.alg === 'RS256' &&
        typeof header.kid === 'string' &&
        jwks.keys.some((key) => key.kid === header.kid)
    );
    assert.ok(payload.iss === issuer && payload.typ === 'Bearer' && payload.sub === sub);
    assert.ok([payload.aud].flat().includes('muster-sync'));
    assert.ok(typeof payload.exp === 'number' && payload.exp > Date.now() / 1000);
    const accountId = createHash('sha256')
      .update(JSON.stringify([issuer, sub]))
      .digest('hex');
    accounts.push(accountId);
    if (mode === 'api') {
      const me = await request(`${api}/api/sync/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert.equal(me.status, 200);
      assert.equal(me.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await me.json(), { accountId });
    }
  }
  assert.notEqual(accounts[0], accounts[1]);
  if (mode === 'api') {
    for (const [path, method, status] of [
      ['/me', 'GET', 401],
      ['/me', 'POST', 405],
      ['/missing', 'GET', 404]
    ]) {
      const response = await request(`${api}/api/sync${path}`, { method });
      assert.equal(response.status, status);
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    const page = await request(`${api}/factions`);
    assert.ok(page.ok && page.headers.get('content-type')?.includes('text/html'));
  }
  console.log(`Contrôle ${mode} réussi pour deux identités stables et distinctes.`);
}

check().catch(() => {
  console.error(
    'Contrôle échoué : vérifier la disponibilité (90 s maximum) et la configuration locale.'
  );
  process.exitCode = 1;
});
