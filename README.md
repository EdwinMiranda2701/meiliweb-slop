# Meiliweb

[Meiliweb](https://meiliweb.pages.dev) is a browser-based administration panel for storing, organizing, and visualizing data in [Meilisearch](https://www.meilisearch.com/) instances.

https://github.com/bpolaszek/meiliweb/assets/5569077/b4100e75-1e70-45dd-8c38-926a3dafafe1

## Features

- Index and settings management
- Document import, search, sorting, and filtering
- API key and tenant-token management
- Task monitoring
- Dump and snapshot management

## Demo

You can use [the hosted app](https://meiliweb.pages.dev) with any Meilisearch instance that exposes suitable CORS headers.

## Development

Meiliweb is a static [Vue](https://vuejs.org/) single-page application built with [Vite+](https://viteplus.dev/) and [Tailwind CSS](https://tailwindcss.com/). It has no application backend: the browser connects directly to the Meilisearch URL supplied by the user.

The project pins Node.js 24.18.0 and pnpm 11.11.0. Install the `vp` CLI from the [Vite+ getting-started guide](https://viteplus.dev/guide/); Vite+ then provisions the pinned runtime and package manager automatically.

```bash
git clone https://github.com/EdwinMiranda2701/meiliweb-slop.git
cd meiliweb-slop
vp install --frozen-lockfile
```

Start the development server:

```bash
vp dev
```

Check formatting, linting, and types:

```bash
vp check
vp run typecheck
```

Apply safe formatting and lint fixes:

```bash
vp check --fix
```

Build and preview the production bundle:

```bash
vp build
vp preview
```

## Docker

The production image builds the static bundle with the pinned Vite+ toolchain, then serves it with nginx. Its nginx configuration falls back to `index.html` for client-side routes.

```bash
docker build -t meiliweb .
docker run --rm -p 3000:80 meiliweb
```

The app is then available at <http://localhost:3000>.

## Contributing

- [Discussions](https://github.com/bpolaszek/meiliweb/discussions) for questions and ideas
- [Issues](https://github.com/bpolaszek/meiliweb/issues) for bug reports
- [Pull requests](https://github.com/bpolaszek/meiliweb/pulls) for proposed changes
