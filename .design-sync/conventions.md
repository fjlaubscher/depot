# depot UI — conventions for building with this design system

`depot` is a Warhammer 40,000 companion app. These components are React 19 function
components styled with **Tailwind v4**. The brand accent is **orange** (`primary` is
mapped to Tailwind's orange palette) and the type face is **Atkinson Hyperlegible**.
Every component supports **dark mode** automatically via `prefers-color-scheme` (use
`dark:` variants in your own markup).

## Setup / wrapping
- **No theme provider is needed for styling** — styles come from the stylesheet + the
  components' own classes. Just render the components.
- **Tokens & base styles live in the stylesheet**, not in JS. The compiled CSS (the
  component `_ds_bundle.css`, imported by `styles.css`) defines the orange `primary-*`
  scale and the semantic utility classes below.
- A few components are **router-aware** and must be rendered inside a react-router context
  in your app: `Breadcrumbs` (reads the current location), `LinkCard` and `ErrorState`
  (render `<Link>`). Wrap your app in a router (`BrowserRouter`/`MemoryRouter`).

## How to style your own layout — use THIS system's classes
Compose layout with normal Tailwind utilities, and reach for these **custom semantic
classes** (defined by the design system) instead of inventing colors — they carry the
brand and are dark-mode aware:

| Purpose | Classes |
|---|---|
| Surfaces | `surface-card` (bordered, rounded panel), `surface-base`, `surface-muted`, `surface-soft`, `surface-accent` |
| Status surfaces | `surface-info`, `surface-success`, `surface-warning`, `surface-danger` (+ `-strong`) |
| Text | `text-foreground` (headings), `text-body`, `text-secondary`, `text-muted`, `text-subtle`, `text-hint` |
| Accent / status text | `text-accent`, `text-accent-strong`, `text-info`, `text-success`, `text-warning`, `text-danger` (+ `-strong`) |
| Borders | `border-subtle`, `border-accent`, `border-info`, `border-success`, `border-warning`, `border-danger` |
| Focus rings | `focus-ring-primary`, `focus-ring-info`, `focus-ring-success`, `focus-ring-warning`, `focus-ring-danger` |
| Links | `link-subtle` |

The brand color is the **orange `primary` scale**: `bg-primary-600`, `hover:bg-primary-700`,
`text-primary-700`, `border-primary-200`, etc. Prefer the semantic classes above for
surfaces/text/borders; use `primary-*` for brand-colored accents and CTAs.

## Component API idiom
Components are configured with **semantic props, not utility classes** — pass a `variant`
rather than restyling. Common axes:
- `Button` / `IconButton`: `variant="default|secondary|accent|error"`, `size="sm|md|lg"`,
  plus `fullWidth`, `loading`.
- `Alert` / status-bearing components: `variant="info|success|warning|error"`.
- `Card`: a compound — `Card`, `Card.Header`, `Card.Title`, `Card.Subtitle`,
  `Card.Content`, `Card.Footer`, `Card.Badge`, `Card.BadgeGroup`.
- `Table`: composed from `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
  `TableCell` (plus the `tableStyles` helper for cell alignment/mono numerals).
Always check the per-component `<Name>.d.ts` (the prop contract) and `<Name>.prompt.md`
(usage) before composing — the compiled stylesheet is the source of truth for available
classes.

## Idiomatic example
```tsx
<Card>
  <Card.Header>
    <div>
      <Card.Title>Terminator Squad</Card.Title>
      <Card.Subtitle>Adeptus Astartes — Elites</Card.Subtitle>
    </div>
    <Card.Badge variant="accent">185 pts</Card.Badge>
  </Card.Header>
  <Card.Content>
    A resilient anvil for any strike force.
  </Card.Content>
  <Card.Footer align="end">
    <Button variant="secondary" size="sm">Datasheet</Button>
    <Button size="sm">Add to Roster</Button>
  </Card.Footer>
</Card>
```
For your own surrounding layout, use the DS classes — e.g.
`<div className="surface-muted text-body p-4">…</div>` — so it matches the app.
