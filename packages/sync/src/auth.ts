import type { SyncIdentity } from '@depot/core';
import { createRemoteJWKSet, errors, jwtVerify } from 'jose';

export type SyncConfig = {
  issuer: string;
  audience: string;
  jwksUrl: string;
  allowLocalHttp?: boolean;
};

export function createIdentityVerifier(config: SyncConfig) {
  const issuer = new URL(config.issuer);
  const jwks = new URL(config.jwksUrl);
  const localIssuer = 'http://localhost:8080/realms/muster-dev';
  const local =
    config.allowLocalHttp === true &&
    config.issuer === localIssuer &&
    config.jwksUrl === `${localIssuer}/protocol/openid-connect/certs`;
  if (
    !config.audience?.trim() ||
    [issuer, jwks].some(
      (url) =>
        url.username ||
        url.password ||
        /[?#]/.test(url.href) ||
        (url.protocol !== 'https:' && !local)
    )
  )
    throw new Error('Invalid sync configuration');
  const resolveKey = createRemoteJWKSet(jwks, {
    timeoutDuration: 5000,
    cacheMaxAge: 600000,
    cooldownDuration: 30000
  });
  return async (token: string): Promise<SyncIdentity | null> => {
    try {
      const { payload } = await jwtVerify(token, resolveKey, {
        algorithms: ['RS256'],
        issuer: config.issuer,
        audience: config.audience,
        requiredClaims: ['sub', 'exp'],
        clockTolerance: 30
      });
      if (payload.typ !== 'Bearer' || typeof payload.sub !== 'string' || !payload.sub.trim())
        return null;
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify([config.issuer, payload.sub]))
      );
      return {
        accountId: Array.from(new Uint8Array(hash), (byte) =>
          byte.toString(16).padStart(2, '0')
        ).join('')
      };
    } catch (error) {
      if (
        error instanceof errors.JWTInvalid ||
        error instanceof errors.JWSInvalid ||
        error instanceof errors.JWTClaimValidationFailed ||
        error instanceof errors.JWTExpired ||
        error instanceof errors.JOSEAlgNotAllowed ||
        error instanceof errors.JOSENotSupported ||
        error instanceof errors.JWSSignatureVerificationFailed ||
        error instanceof errors.JWKSNoMatchingKey
      )
        return null;
      throw error;
    }
  };
}
