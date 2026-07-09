# Meiliweb

Browser-based administration panel for [Meilisearch](https://www.meilisearch.com/): manage indexes, documents, keys, tasks, dumps, snapshots, networking, and webhooks.

## Stack

- Vue 3 with the Composition API and `<script setup lang="ts">`
- Vite+ for the development server, production build, formatting, linting, and type checks
- TypeScript in strict mode
- Vue Router with client-side history routing
- Pinia for state and `@vueuse/core` `useLocalStorage` for persistence
- Vue I18n; translations live in each component's `<i18n>` SFC block
- Tailwind CSS
- The official `meilisearch` JavaScript client and `meilisearch-filters`
- pnpm 11.11.0, selected and managed through Vite+
- Node.js 24.18.0, pinned in `.node-version`

There is no application backend. The static SPA talks directly to the user's Meilisearch instance from the browser.

## Commands

```bash
vp install --frozen-lockfile  # install exactly what pnpm-lock.yaml describes
vp dev                        # development server
vp build                      # production bundle in dist/
vp preview                    # preview the production bundle
vp check                      # formatting, linting, and type checks
vp run typecheck              # Vue SFC template type checks
vp check --fix                # apply safe formatting and lint fixes
```

CI runs a frozen install, `vp check`, `vp run typecheck`, and `vp build` with `voidzero-dev/setup-vp@v1`.

Docker:

```bash
docker build -t meiliweb .
docker run --rm -p 3000:80 meiliweb
```

The runtime image is nginx, serves `dist/`, and falls back to `index.html` for client-side routes.

## Project structure

Application code lives under `app/`:

```text
app/
├── main.ts            # creates Vue, Pinia, router, plugins, and mounts the app
├── App.vue            # root shell, global dialogs, and toasts
├── router.ts          # explicit route definitions and router setup
├── middleware/        # navigation guards registered from main.ts
├── pages/             # route-level views
├── components/
│   ├── layout/        # shared shell and UI primitives
│   ├── documents/     # document views, filters, facets, and renderers
│   ├── settings/      # index-settings editors
│   ├── network/
│   └── debug/
├── composables/
├── stores/
├── utils/
└── assets/
```

Consult the actual router configuration before changing paths or route names; directory placement no longer creates routes automatically.

## Routing and credentials

- A global Vue Router guard gates every route except login. With no credentials, it redirects to `/login`.
- Credentials persist in the credentials Pinia store. `credentials-all` holds known instances and `credentials-current` holds the active record.
- Each record's id derives from `xxh32(JSON.stringify({ baseUri, accessKey }))`, so saving the same instance is idempotent.
- The rendered route is keyed by both route and active credential id. Preserve this behavior: changing instances must remount the current page and discard instance-specific component state.
- The app is deployed as a static history-mode SPA. Every hosting environment must rewrite unknown routes to `index.html`.

## Talking to Meilisearch

Always use the shared composable; do not instantiate `Meilisearch` directly:

```ts
import { useMeiliClient } from '~/composables'

const meili = useMeiliClient()
const meiliAsTenant = useMeiliClient(tenantToken)
```

The client reads `baseUri` and `accessKey` reactively from the credentials store.

For asynchronous Meilisearch tasks, use `useTask`:

```ts
const processTask = useTask()
const task = await processTask(() => meili.createIndex(uid, { primaryKey }), {
  onCanceled: () => {},
  onFailure: () => {},
})

if (task.status === 'failed') throw new Error('Index creation failed')
```

`useIndexOperations` contains the canonical pattern for multi-step operations such as duplicating and renaming an index.

## Project conventions

### Coordinated reactive state

The codebase commonly gathers related reactive values into a `reactive` object and exposes selected fields with `toRefs`. Use `safeToRefs` when destructuring stores because it also tolerates actions and plain values.

### Promisified dialogs

Dialogs are opened imperatively and awaited through `usePromisifiedDialogs`. Prefer this established pattern over introducing unrelated modal state.

### Toasts and forms

- Use the constants and `useToasts` exported by `~/stores` for operation progress and results.
- Use `useFormSubmit` for submit loading state and standard error capture.
- Use `tryOrThrow` when a rejection must flow through the application's normal error handling.

### Instance- and index-scoped settings

Store per-instance and per-index display preferences through `useIndexLocalSettings` so settings cannot leak between Meilisearch instances.

### Barrel imports

`~/composables`, `~/stores`, and `~/utils` expose barrel `index.ts` files. Import through those barrels, and update the appropriate barrel when adding a module.

## Internationalization

Translations are colocated with components in YAML SFC blocks:

```vue
<i18n>
en:
  title: My page
</i18n>
```

Global strings live with the root application component. Do not create a central locale tree without discussion.

## Styling

- Prefer Tailwind utilities.
- Keep the project's explicit form-control classes and custom primary palette.
- Keep shared CSS in the root application stylesheet; prefer Tailwind utilities in components.
- Let Vite+'s formatter and configured Tailwind handling determine class and import ordering.

## Local Meilisearch integration testing

The user-provided disposable Meilisearch environment is the only approved project-external directory:

```bash
cd ~/Programs/meilisearch
docker compose up -d
```

It exposes Meilisearch at `http://127.0.0.1:7700`; read its local `meili.env` for the development master key. Its data may be reset when a clean state is useful. Return to the repository before running project commands.

For browser-level verification, start Meiliweb with `vp dev`, connect through the login page, and exercise the specific changed workflows against that instance. Use targeted assertions around routes, credential switching, translations, and the affected Meilisearch operations.

## Things not to do

- Do not add SSR-dependent code or a backend. The app must remain a deployable static SPA.
- Do not bypass `useMeiliClient`; doing so breaks reactive credential switching.
- Do not centralize component translations unless asked.
- Do not use deep imports where a project barrel exists.
- Do not add a second state-management library; Pinia and `useLocalStorage` cover current needs.
- Do not add or suggest smoke tests. Use focused checks tied to changed behavior.
