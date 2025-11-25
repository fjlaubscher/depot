const CANONICAL_ORIGIN = 'https://godepot.dev';
const HERO_IMAGE_URL = `${CANONICAL_ORIGIN}/images/depot-hero.jpg`;
const HERO_IMAGE_ALT = 'Screenshot of depot, the Warhammer 40,000 companion app';

type AssetBinding = {
  fetch: (request: Request) => Promise<Response>;
};

type Env = {
  ASSETS: AssetBinding;
};

type RouteMatch =
  | { type: 'faction'; factionSlug: string }
  | { type: 'datasheet'; factionSlug: string; datasheetSlug: string };

type PagesContext = {
  request: Request;
  env: Env;
};

type Metadata = {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
};

type FactionManifest = {
  name: string;
  slug: string;
  datasheetCount?: number;
  detachmentCount?: number;
  datasheets?: DatasheetSummary[];
  detachments?: unknown[];
};

type DatasheetSummary = {
  id: string;
  slug?: string;
  name: string;
  role?: string;
  path: string;
};

type DatasheetDetail = {
  legend?: string;
};

export const onRequest = async ({ request, env }: PagesContext): Promise<Response> => {
  if (request.method !== 'GET') {
    return env.ASSETS.fetch(request);
  }

  const routeMatch = matchRoute(request);
  const assetResponse = await env.ASSETS.fetch(request);
  if (!routeMatch) {
    return assetResponse;
  }

  const contentType = assetResponse.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('text/html')) {
    return assetResponse;
  }

  const url = new URL(request.url);
  let metadata: Metadata | null = null;

  try {
    metadata = await buildMetadata(routeMatch, env, url);
  } catch (error) {
    console.error('Failed to build dynamic metadata', error);
  }

  if (!metadata) {
    return assetResponse;
  }

  const originalHtml = await assetResponse.text();
  const rewrittenHtml = applyMetadata(originalHtml, metadata);
  const encoder = new TextEncoder();
  const bodyBuffer = encoder.encode(rewrittenHtml);
  const headers = new Headers(assetResponse.headers);

  headers.delete('content-encoding');
  headers.delete('etag');
  headers.set('content-length', bodyBuffer.length.toString());

  return new Response(bodyBuffer, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers
  });
};

const matchRoute = (request: Request): RouteMatch | null => {
  const url = new URL(request.url);
  const normalizedPath = normalizePathname(url.pathname);

  if (normalizedPath === '/' || normalizedPath.startsWith('/assets/')) {
    return null;
  }

  const datasheetMatch = normalizedPath.match(/^\/faction\/([^/]+)\/datasheet\/([^/]+)$/i);
  if (datasheetMatch) {
    return {
      type: 'datasheet',
      factionSlug: decodeURIComponent(datasheetMatch[1]).toLowerCase(),
      datasheetSlug: decodeURIComponent(datasheetMatch[2]).toLowerCase()
    };
  }

  const factionMatch = normalizedPath.match(/^\/faction\/([^/]+)$/i);
  if (factionMatch) {
    return {
      type: 'faction',
      factionSlug: decodeURIComponent(factionMatch[1]).toLowerCase()
    };
  }

  return null;
};

const buildMetadata = async (
  match: RouteMatch,
  env: Env,
  requestUrl: URL
): Promise<Metadata | null> => {
  const manifest = await fetchFactionManifest(env, requestUrl, match.factionSlug);
  if (!manifest) {
    return null;
  }

  const canonicalUrl = `${CANONICAL_ORIGIN}${requestUrl.pathname}${requestUrl.search}`;
  const imageAlt = HERO_IMAGE_ALT;

  if (match.type === 'faction') {
    const datasheetTotal =
      manifest.datasheetCount ?? (manifest.datasheets ? manifest.datasheets.length : 0);
    const detachmentTotal =
      manifest.detachmentCount ?? (Array.isArray(manifest.detachments) ? manifest.detachments.length : 0);

    return {
      title: `${manifest.name} - depot`,
      description: `Browse ${formatCount(datasheetTotal, 'datasheet')} and ${formatCount(
        detachmentTotal,
        'detachment'
      )} for ${manifest.name} in Warhammer 40,000.`,
      url: canonicalUrl,
      image: HERO_IMAGE_URL,
      imageAlt
    };
  }

  const datasheetEntry = findDatasheet(manifest, match.datasheetSlug);
  if (!datasheetEntry) {
    return null;
  }

  const datasheetDetails = await fetchDatasheet(env, requestUrl, datasheetEntry.path);
  const legend = datasheetDetails?.legend ? truncateText(stripHtml(datasheetDetails.legend)) : '';
  const description =
    legend ||
    `${datasheetEntry.name} datasheet for ${manifest.name} in Warhammer 40,000.${
      datasheetEntry.role ? ` Role: ${datasheetEntry.role}.` : ''
    }`;

  return {
    title: `${datasheetEntry.name} - ${manifest.name} | depot`,
    description,
    url: canonicalUrl,
    image: HERO_IMAGE_URL,
    imageAlt
  };
};

const fetchFactionManifest = async (
  env: Env,
  requestUrl: URL,
  factionSlug: string
): Promise<FactionManifest | null> =>
  fetchJson<FactionManifest>(env, requestUrl, `/data/factions/${factionSlug}/faction.json`);

const fetchDatasheet = async (
  env: Env,
  requestUrl: URL,
  datasheetPath: string
): Promise<DatasheetDetail | null> => fetchJson<DatasheetDetail>(env, requestUrl, datasheetPath);

const fetchJson = async <T>(
  env: Env,
  requestUrl: URL,
  assetPath: string
): Promise<T | null> => {
  try {
    const assetUrl = new URL(assetPath, requestUrl.origin);
    const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: 'GET' }));
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Failed to fetch ${assetPath}`, error);
    return null;
  }
};

const findDatasheet = (manifest: FactionManifest, slugOrId: string): DatasheetSummary | null => {
  const summaries = manifest.datasheets ?? [];
  const normalized = slugOrId.toLowerCase();

  return (
    summaries.find((datasheet) => (datasheet.slug ?? '').toLowerCase() === normalized) ??
    summaries.find((datasheet) => datasheet.id === slugOrId) ??
    null
  );
};

const normalizePathname = (pathname: string): string => {
  if (!pathname) {
    return '/';
  }

  const collapsed = pathname.replace(/\/{2,}/g, '/');
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1);
  }

  return collapsed || '/';
};

const stripHtml = (value: string): string => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const truncateText = (value: string, maxLength = 200): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
};

const formatCount = (count: number, singular: string): string => {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const label = safeCount === 1 ? singular : `${singular}s`;
  return `${safeCount} ${label}`;
};

const applyMetadata = (html: string, metadata: Metadata): string => {
  if (!html.includes('</head>')) {
    return html;
  }

  let output = replaceTitle(html, metadata.title);

  const replacements: Array<{ attribute: 'name' | 'property'; key: string; value: string }> = [
    { attribute: 'name', key: 'description', value: metadata.description },
    { attribute: 'property', key: 'og:title', value: metadata.title },
    { attribute: 'property', key: 'og:description', value: metadata.description },
    { attribute: 'property', key: 'og:url', value: metadata.url },
    { attribute: 'property', key: 'og:image', value: metadata.image },
    { attribute: 'property', key: 'og:image:secure_url', value: metadata.image },
    { attribute: 'property', key: 'og:image:alt', value: metadata.imageAlt },
    { attribute: 'name', key: 'twitter:title', value: metadata.title },
    { attribute: 'name', key: 'twitter:description', value: metadata.description },
    { attribute: 'name', key: 'twitter:image', value: metadata.image },
    { attribute: 'name', key: 'twitter:image:alt', value: metadata.imageAlt }
  ];

  for (const replacement of replacements) {
    output = upsertMetaTag(output, replacement.attribute, replacement.key, replacement.value);
  }

  return output;
};

const replaceTitle = (html: string, value: string): string => {
  const escaped = escapeHtml(value);
  if (/<title>.*<\/title>/is.test(html)) {
    return html.replace(/<title>.*<\/title>/is, `<title>${escaped}</title>`);
  }

  return html.replace('</head>', `<title>${escaped}</title></head>`);
};

const upsertMetaTag = (
  html: string,
  attribute: 'name' | 'property',
  key: string,
  value: string
): string => {
  const escapedValue = escapeHtml(value);
  const metaTag = `<meta ${attribute}="${key}" content="${escapedValue}" />`;
  const regex = new RegExp(
    `<meta[^>]*${attribute}\\s*=\\s*["']${escapeRegExp(key)}["'][^>]*>`,
    'i'
  );

  if (regex.test(html)) {
    return html.replace(regex, metaTag);
  }

  return html.replace('</head>', `${metaTag}</head>`);
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
