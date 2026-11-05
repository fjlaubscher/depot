import { createSyncHandler } from '@depot/sync';

type Env = Partial<
  Record<
    'SYNC_OIDC_ISSUER' | 'SYNC_OIDC_AUDIENCE' | 'SYNC_OIDC_JWKS_URL' | 'SYNC_OIDC_ALLOW_LOCAL_HTTP',
    string
  >
>;
let cached: { key: string; handler: ReturnType<typeof createSyncHandler> } | undefined;

export async function onRequest({
  request,
  env
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const config = {
    issuer: env.SYNC_OIDC_ISSUER ?? '',
    audience: env.SYNC_OIDC_AUDIENCE ?? '',
    jwksUrl: env.SYNC_OIDC_JWKS_URL ?? '',
    allowLocalHttp: env.SYNC_OIDC_ALLOW_LOCAL_HTTP === 'true'
  };
  try {
    const key = JSON.stringify(config);
    if (cached?.key !== key) cached = { key, handler: createSyncHandler(config) };
    return await cached.handler(request);
  } catch {
    return Response.json(
      { error: 'unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  }
}
