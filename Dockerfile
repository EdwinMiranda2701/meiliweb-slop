# syntax=docker/dockerfile:1

FROM ghcr.io/voidzero-dev/vite-plus:0.2.4 AS build

WORKDIR /app

# Keep dependency installation cacheable and let Vite+ provision the pinned
# Node.js and pnpm versions declared by the project.
COPY --chown=vp:vp package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version ./
RUN vp install --frozen-lockfile

COPY --chown=vp:vp . .
RUN vp build

FROM nginx:1.31.2-alpine AS runtime

COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
EOF

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
