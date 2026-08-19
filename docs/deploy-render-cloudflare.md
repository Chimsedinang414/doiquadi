# Deploy LocalFood with Render and Cloudflare Pages

This deployment keeps the existing architecture:

- Render runs the Spring Boot API from `backend/Dockerfile`.
- Cloudflare Pages builds and serves the Vite frontend.
- Aiven provides MySQL.
- R2 or another S3-compatible service stores images.

## 1. Deploy the backend on Render

Create a Blueprint from this repository and select `render.yaml`. Render prompts
for every variable marked `sync: false`; use the values from the local `.env`
without committing that file.

The Aiven JDBC URL must use TLS, for example:

```text
jdbc:mysql://HOST:PORT/DATABASE?sslmode=require
```

After deployment, verify that this endpoint returns a JSON response with
`"status":"UP"`:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api
```

## 2. Deploy the frontend on Cloudflare Pages

Connect the same GitHub repository and configure:

```text
Production branch: ANOTATION
Root directory: frontend
Build command: npm ci && npm run build
Build output directory: dist
```

Set these production environment variables, replacing the Render hostname:

```text
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
VITE_WS_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/ws
VITE_OAUTH_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
```

Cloudflare Pages treats this Vite build as a single-page application because
the project does not provide a top-level `404.html`.

## 3. Finish cross-origin configuration

Once Cloudflare provides the production URL, update these Render variables:

```text
CORS_ALLOWED_ORIGINS=https://YOUR-PAGES-PROJECT.pages.dev
OAUTH2_FRONTEND_REDIRECT_URI=https://YOUR-PAGES-PROJECT.pages.dev/oauth2/callback
PASSWORD_RESET_FRONTEND_URI=https://YOUR-PAGES-PROJECT.pages.dev/reset-password
```

Redeploy the Render service after saving the variables.

For Google and Facebook, configure these provider callback URLs:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/login/oauth2/code/google
https://YOUR-RENDER-SERVICE.onrender.com/api/login/oauth2/code/facebook
```

For browser uploads, allow the Cloudflare Pages production origin in the
bucket CORS policy.
