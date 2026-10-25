# Interface translations

The web app uses i18next and react-i18next. Catalogues live in
`src/locales/{language}/{namespace}.json`: `common` for shared interface text,
`home` for the dashboard, `settings` for preferences and `catalog` for catalogue
screens and shared unit/weapon profiles. Create other domains
such as `rosters` for army lists, their legality diagnostics and share labels
when their screens are translated, rather than creating empty catalogues.

Vite emits separate JSON assets (never inline). The backend in `loader.ts` fetches
namespaces when components request them and caches successful responses through
the Cache API, including on the first visit before a service worker controls the
page. On each page load, requested namespaces are revalidated over HTTP with
`cache: 'no-cache'` and successful responses replace the stored version. Cached
translations are used when the network is unavailable or returns an error.
Requests are shared within the page, so a namespace is checked only once per
language until the next reload. Translation assets are excluded from the PWA
global precache. Settings
prepare remaining namespaces in the background for **only the current language
and English fallback**. Other languages are not downloaded until selected.

`src/i18n.ts` initializes the shared instance before rendering. The app uses
Suspense during namespace loading. Tests explicitly select English by default
and preload catalogues synchronously through `src/test-setup.ts`.

English is the initial and fallback language. A missing French key uses its
English translation. To configure French programmatically, import the instance
from `@/i18n` and call `await i18n.changeLanguage('fr')`. Language selection and
persistence are handled by the existing settings context. Previously cached
translations remain available offline; selecting a language never downloaded
requires a connection, otherwise English provides the fallback.

## Add a key

Add a semantic, stable key to the relevant English JSON catalogue and its French
counterpart. `src/i18next.d.ts` imports English catalogue types to check translation
keys. Register new namespace types there. Unknown keys fail the web typecheck,
even with a default value. Module constants must store keys, not translations;
translate during render so mounted menus follow language changes.

Common notifications attach optional `Toast.translation` keys and interpolation
values so an already-visible notification follows language changes too. Existing
plain title/message props remain unchanged. Share callers can pass
`copySuccessKey` / `shareSuccessKey` for this behavior; custom message strings
continue to override defaults without being translated automatically.

In a React component:

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('home');
// English: Bookmarks; French: Favoris
t('bookmarks');
```

## Interpolation and plurals

Use `{{variable}}` in a resource and pass its value in the translation options.
For counts, define `_one` and `_other` variants, then call the base key with
`count`. The home catalogue's `bookmarkCount_one` and `bookmarkCount_other`
demonstrate both interpolation and pluralization:

```tsx
// English: 1 bookmark / 2 bookmarks; French: 1 favori / 2 favoris
t('bookmarkCount', { count: 1 });
t('bookmarkCount', { count: 2 });
```

i18next applies each language's plural rules (French uses the singular form for
zero). React escapes rendered text, so i18next escaping is disabled; render
translations as text rather than passing them to `dangerouslySetInnerHTML`.
Translate interface text only: preserve Wahapedia data, user names, IDs and slugs.

## Verify

```sh
pnpm --filter @depot/web exec vitest run src/i18n.test.ts src/locales/loader.test.ts src/components/shared/common-translations.test.tsx
pnpm --filter @depot/web typecheck
pnpm --filter @depot/web test
```

The focused tests cover selective downloads, offline cache reuse, English fallback,
live language changes, generic controls, unchanged user names, interpolation,
plural rules and invalid keys (checked by TypeScript with `@ts-expect-error`).

Reference: [i18next TypeScript documentation](https://www.i18next.com/overview/typescript).
