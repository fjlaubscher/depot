# Interface translations

The web app uses i18next and react-i18next. English and French resources are
statically imported from `packages/web/src/locales/` into the application bundle,
so translations work offline without a translation service or extra requests.
`src/i18n.ts` initializes the shared instance before rendering; tests load the
same initialization through `src/test-setup.ts`.

English is the initial and fallback language. A missing French key uses its
English translation. To configure French programmatically, import the instance
from `@/i18n` and call `await i18n.changeLanguage('fr')`. Language selection and
persistence are handled separately in issue #3.

## Add a key

Add a semantic, stable key to `src/locales/en.ts` and its translation to
`src/locales/fr.ts`. Group keys by feature, for example `home.bookmarks`.
Keep the English catalogue's `as const`: `src/i18next.d.ts` uses it to type
translation keys. Unknown keys fail the web typecheck, even with a default value.

In a React component:

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
// English: Bookmarks; French: Favoris
t('home.bookmarks');
```

## Interpolation and plurals

Use `{{variable}}` in a resource and pass its value in the translation options.
For counts, define `_one` and `_other` variants, then call the base key with
`count`. The bundled `home.bookmarkCount_one` and `home.bookmarkCount_other`
demonstrate both interpolation and pluralization:

```tsx
// English: 1 bookmark / 2 bookmarks; French: 1 favori / 2 favoris
t('home.bookmarkCount', { count: 1 });
t('home.bookmarkCount', { count: 2 });
```

i18next applies each language's plural rules (French uses the singular form for
zero). React escapes rendered text, so i18next escaping is disabled; render
translations as text rather than passing them to `dangerouslySetInnerHTML`.
Translate interface text only: preserve Wahapedia data, user names, IDs and slugs.

## Verify

```sh
pnpm --filter @depot/web exec vitest run src/i18n.test.ts src/routes/home/index.test.tsx
pnpm --filter @depot/web typecheck
pnpm --filter @depot/web test
```

The focused tests cover bundled initialization, language changes in the home
page, interpolation, plural rules, missing French translations and invalid keys
(checked by TypeScript with `@ts-expect-error`).

Reference: [i18next TypeScript documentation](https://www.i18next.com/overview/typescript).
