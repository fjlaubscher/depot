const CANONICAL_ORIGIN = 'https://godepot.dev';
const HERO_IMAGE_URL = `${CANONICAL_ORIGIN}/maskable-icon-512x512.png`;
const HERO_IMAGE_ALT = 'depot app icon';

// Minimal Pages-runtime types; HTMLRewriter is a runtime global on Cloudflare Pages.
type Env = { ASSETS: { fetch: (request: Request) => Promise<Response> } };
type PagesContext = { request: Request; env: Env };

type RewriterElement = {
  setAttribute(name: string, value: string): void;
  setInnerContent(content: string): void;
};

declare class HTMLRewriter {
  on(selector: string, handlers: { element?(element: RewriterElement): void }): this;
  transform(response: Response): Response;
}

type RouteMatch =
  | { type: 'faction'; factionSlug: string }
  | { type: 'datasheet'; factionSlug: string; datasheetSlug: string };

type Metadata = { title: string; description: string; url: string };

type DatasheetSummary = { id: string; slug?: string; name: string; role?: string; path: string };

type FactionManifest = {
  name: string;
  slug: string;
  datasheetCount?: number;
  detachmentCount?: number;
  datasheets?: DatasheetSummary[];
  detachments?: unknown[];
};

export const onRequest = async ({ request, env }: PagesContext): Promise<Response> => {
  if (request.method !== 'GET') {
    return env.ASSETS.fetch(request);
  }

  const url = new URL(request.url);
  const routeMatch = matchRoute(url.pathname);
  const assetResponse = await env.ASSETS.fetch(request);
  if (!routeMatch) {
    return assetResponse;
  }

  const contentType = assetResponse.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('text/html')) {
    return assetResponse;
  }

  let metadata: Metadata | null = null;
  try {
    metadata = await buildMetadata(routeMatch, env, url);
  } catch (error) {
    console.error('Failed to build dynamic metadata', error);
  }

  if (!metadata) {
    return assetResponse;
  }

  const { title, description, url: canonicalUrl } = metadata;
  const metaContent: Record<string, string> = {
    description,
    'og:title': title,
    'og:description': description,
    'og:url': canonicalUrl,
    'og:image': HERO_IMAGE_URL,
    'og:image:secure_url': HERO_IMAGE_URL,
    'og:image:alt': HERO_IMAGE_ALT,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': HERO_IMAGE_URL,
    'twitter:image:alt': HERO_IMAGE_ALT
  };

  // ponytail: rewrites tags in place only; every tag is guaranteed present in
  // packages/web/index.html. Re-add an upsert path if tags are removed there.
  const rewriter = new HTMLRewriter().on('title', {
    element: (element) => element.setInnerContent(title)
  });
  for (const [key, value] of Object.entries(metaContent)) {
    rewriter.on(`meta[name="${key}"], meta[property="${key}"]`, {
      element: (element) => element.setAttribute('content', value)
    });
  }

  // Streamed body: copy the response so headers are mutable, drop the stale etag.
  const transformed = rewriter.transform(assetResponse);
  const response = new Response(transformed.body, transformed);
  response.headers.delete('content-encoding');
  response.headers.delete('etag');
  return response;
};

const matchRoute = (pathname: string): RouteMatch | null => {
  const datasheetMatch = pathname.match(/^\/faction\/([^/]+)\/datasheet\/([^/]+)\/?$/i);
  if (datasheetMatch) {
    return {
      type: 'datasheet',
      factionSlug: decodeURIComponent(datasheetMatch[1]).toLowerCase(),
      datasheetSlug: decodeURIComponent(datasheetMatch[2]).toLowerCase()
    };
  }

  const factionMatch = pathname.match(/^\/faction\/([^/]+)\/?$/i);
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
  const manifest = await fetchJson<FactionManifest>(
    env,
    requestUrl,
    `/data/factions/${match.factionSlug}/faction.json`
  );
  if (!manifest) {
    return null;
  }

  const canonicalUrl = `${CANONICAL_ORIGIN}${requestUrl.pathname}${requestUrl.search}`;

  if (match.type === 'faction') {
    const datasheetTotal = manifest.datasheetCount ?? manifest.datasheets?.length ?? 0;
    const detachmentTotal =
      manifest.detachmentCount ?? (Array.isArray(manifest.detachments) ? manifest.detachments.length : 0);

    return {
      title: `${manifest.name} - depot`,
      description: `Browse ${formatCount(datasheetTotal, 'datasheet')} and ${formatCount(
        detachmentTotal,
        'detachment'
      )} for ${manifest.name} in Warhammer 40,000.`,
      url: canonicalUrl
    };
  }

  const datasheetEntry = findDatasheet(manifest, match.datasheetSlug);
  if (!datasheetEntry) {
    return null;
  }

  const datasheetDetails = await fetchJson<{ legend?: string }>(env, requestUrl, datasheetEntry.path);
  const legend = datasheetDetails?.legend ? truncateText(stripHtml(datasheetDetails.legend)) : '';
  const description =
    legend ||
    `${datasheetEntry.name} datasheet for ${manifest.name} in Warhammer 40,000.${
      datasheetEntry.role ? ` Role: ${datasheetEntry.role}.` : ''
    }`;

  return {
    title: `${datasheetEntry.name} - ${manifest.name} | depot`,
    description,
    url: canonicalUrl
  };
};

const fetchJson = async <T>(env: Env, requestUrl: URL, assetPath: string): Promise<T | null> => {
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

const stripHtml = (value: string): string =>
  value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const truncateText = (value: string, maxLength = 200): string =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 3).trimEnd()}...`;

const formatCount = (count: number, singular: string): string =>
  `${count} ${count === 1 ? singular : `${singular}s`}`;
