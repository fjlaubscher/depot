# OIDC local

Prérequis : Node 24, pnpm 10 et Docker Compose. Depuis la racine :

```sh
docker compose -f compose/docker-compose.yaml config --quiet
docker compose -f compose/docker-compose.yaml up -d
node scripts/check-sync.mjs oidc
```

Le contrôle attend au plus 90 secondes la discovery et vérifie les deux sujets
fixés dans le realm, sans écrire ni afficher de jeton. Les requêtes expirent après 5 secondes.
Keycloak 26.8.1 écoute uniquement sur `127.0.0.1:8080`.
Comptes fictifs : `alice` / `alice-dev-only`, `bob` / `bob-dev-only`.
Console : `http://localhost:8080`, administrateur `admin` / `admin-dev-only`.
Ces identifiants et le client password `muster-check` sont réservés au développement.
`muster-web` exige PKCE S256 et n’autorise pas le flux password.

Pour réinitialiser :

```sh
docker compose -f compose/docker-compose.yaml down
docker compose -f compose/docker-compose.yaml up -d
node scripts/check-sync.mjs oidc
```

`restart` conserve les modifications administratives ; recréer le conteneur les perd.
Aucun volume de données n’est monté. Les sujets restent identiques ; les clés peuvent changer.
Google sera intégré directement en T03. Aucun login navigateur ou stockage de synchronisation
n’est livré ici. La PWA locale fonctionne sans Keycloak.

## API Pages

Créer `.env.local` à la racine à partir de l’exemple, puis lancer :

```sh
cp compose/pages.env.example .env.local
pnpm dev:wrangler
```

La commande construit core, sync et web, puis sert Muster et son API sur
`http://localhost:8788`. `npm run dev:wrangler` lance le même script (pnpm reste requis).
Wrangler charge automatiquement `.env.local`, ignoré par Git ; ne pas créer de
`.dev.vars` en parallèle, car ce fichier prendrait la priorité sur `.env.local`.

Dans un autre terminal : `node scripts/check-sync.mjs api`. Vite seul ne sert pas l’API.
La date explicite correspond au runtime Workers installé. Aucun fichier secret n’est nécessaire ;
`pages.env.example` récapitule les variables. En déploiement, HTTPS est obligatoire ; l’exception
HTTP n’autorise que la paire issuer/JWKS locale exacte. Le cache JWKS dure 10 minutes, les
rafraîchissements sont espacés de 30 secondes et le délai réseau est de 5 secondes.
Après recréation de Keycloak, redémarrer Wrangler pour vider son cache de clés.

Pour vérifier le service worker sur le build servi par Pages :

```sh
WEB_BASE_URL=http://localhost:8788 pnpm --filter @depot/web exec playwright test sync-cache.spec.ts
```

La même commande fonctionne avec `CI=true`, sans lancer Vite.
