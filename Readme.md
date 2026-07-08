# Litmus Check — Frontend

The web frontend for **[Litmus Check](https://litmuscheck.com)**, the open-source, AI-powered testing environment for Playwright. Write end-to-end tests in plain English, get Playwright code instantly, run them, and auto-triage failures — all from a self-hostable UI.

- 🌐 **Website:** https://litmuscheck.com
- 📚 **Documentation:** https://documentation.litmuscheck.com
- ⚙️ **Backend / QA engine:** https://github.com/litmus-check/lc-server
- 🛠️ **Triage CLI (npm):** https://www.npmjs.com/package/litmus-agent

This repository is the **Next.js frontend**. It talks to the [`lc-server`](https://github.com/litmus-check/lc-server) backend for authentication, test execution, and triage — so to run the full product, deploy this app alongside `lc-server`.

## The Litmus Check ecosystem

| Component | Repository | What it does |
|-----------|------------|--------------|
| Frontend (this repo) | [`litmus-check/lc-frontend`](https://github.com/litmus-check/lc-frontend) | Next.js UI for writing, running, and triaging tests |
| Backend / QA engine | [`litmus-check/lc-server`](https://github.com/litmus-check/lc-server) | Flask + Playwright engine that runs tests and powers the auth/APIs this frontend calls |
| Triage CLI | [`litmus-agent`](https://www.npmjs.com/package/litmus-agent) | Drop-in CLI to triage Playwright failures from a JSON report + traces |

---

## Getting Started

This guide covers deploying the Litmus Check frontend in two scenarios: **Vercel** (hosted) and **on-premises** (virtual machine). It requires a running [`lc-server`](https://github.com/litmus-check/lc-server) backend that this app points at via `NEXT_PUBLIC_LITMUSCHECK_URL`.

---

## Prerequisites

- **Node.js** 18.x or later (20.x recommended)
- **pnpm** (or npm/yarn)
- Access to the LitmusCheck backend API(s)
- Auth backend endpoints derived from `NEXT_PUBLIC_LITMUSCHECK_URL`

---

## Environment Variables

Configure the following environment variables before building or deploying.

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_LITMUSCHECK_URL | Backend API URL (LitmusCheck) | Yes |
| NEXT_PUBLIC_BASE_API_URL | Backend Org/Admin API URL | Yes |
| NEXT_PUBLIC_WEBSOCKET_URL | Websocket URL (used in Compose component) | Yes |
| NEXT_PUBLIC_AUTH_SESSION_MAX_AGE | Session cookie lifetime in seconds (default: 604800) | Optional |
| NEXT_PUBLIC_ENV | Environment (e.g. UAT, PROD) | Yes |
| NEXT_PUBLIC_SENTRY_DSN | Sentry DSN (error tracking) | Optional |
| SENTRY_AUTH_TOKEN | Sentry auth token (for source maps) | Optional |
| SLACK_WEBHOOK_URL | Slack webhook URL (notifications) | Optional |

---

## Option 1: Deploy on Vercel

### 1. Connect Your Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Select the repository and branch

### 2. Configure the Project

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (or your project root)
- **Build Command:** `pnpm run build` (or `npm run build`)
- **Output Directory:** `.next` (default for Next.js)
- **Install Command:** `pnpm install` (or `npm install`)

### 3. Set Environment Variables

1. In the project dashboard, go to **Settings** → **Environment Variables**
2. Add each variable from the table above
3. Assign them to the appropriate environments (Production, Preview, Development)
4. For `NEXT_PUBLIC_*` variables, ensure they are available at build time

### 4. Deploy

1. Click **Deploy**
2. Vercel will build and deploy your app
3. Your app will be available at `https://<project-name>.vercel.app`
4. Configure a custom domain in **Settings** → **Domains** if needed

### 5. Post-Deploy
- Ensure `NEXT_PUBLIC_LITMUSCHECK_URL` is set to your backend base URL so the app can reach:
  - `POST {NEXT_PUBLIC_LITMUSCHECK_URL}/login`
  - `POST {NEXT_PUBLIC_LITMUSCHECK_URL}/api/v1/signup`
- Verify backend APIs allow requests from your Vercel domain and accept the Bearer token issued by your auth API

---

## Option 2: Deploy On-Premises (Virtual Machine)

For more details on self-hosting Next.js (Node.js server, Docker, static export), see the [Next.js Deployment documentation](https://nextjs.org/docs/app/getting-started/deploying).

### 1. Prepare the VM

Ensure the VM has:

- **Node.js 18+** installed
- **pnpm** (or npm) installed
- Port **3000** (or your chosen port) open for inbound traffic
- Outbound access to your backend APIs and auth endpoints derived from `NEXT_PUBLIC_LITMUSCHECK_URL`

### 2. Clone and Install

```bash
git clone <repository-url> litmuscheck-fe
cd litmuscheck-fe
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the project root (or use your preferred method for secrets):

```bash
# Copy the example and edit
cp .env.example .env.local
# Edit .env.local with your values
```

Alternatively, export variables before build:

```bash
export NEXT_PUBLIC_LITMUSCHECK_URL="https://your-backend.example.com/api/v1"
# ... add other variables
```

### 4. Build

```bash
pnpm run build
```

### 5. Run in Production

**Option A: Run with Node directly**

```bash
pnpm run start
```

This starts the Next.js production server on port 3000 by default.

**Option B: Run with a process manager (recommended)**

Using **PM2**:

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start pnpm --name "litmuscheck" -- start

# Save the process list for restart on reboot
pm2 save
pm2 startup
```

Using **systemd** (create `/etc/systemd/system/litmuscheck.service`):

```ini
[Unit]
Description=LitmusCheck Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/litmuscheck-fe
ExecStart=/usr/bin/pnpm run start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable litmuscheck
sudo systemctl start litmuscheck
sudo systemctl status litmuscheck
```

### 6. Reverse Proxy (Recommended)

Use **Nginx** or **Caddy** as a reverse proxy for HTTPS and load balancing.

**Nginx example** (`/etc/nginx/sites-available/litmuscheck`):

```nginx
server {
    listen 80;
    server_name litmuscheck.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/litmuscheck /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL/TLS (Recommended for Production)

Use **Let's Encrypt** with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d litmuscheck.yourdomain.com
```

### 8. Post-Deploy
- Ensure `NEXT_PUBLIC_LITMUSCHECK_URL` points to your backend so login/signup requests can reach `/login` and `/signup`
- Ensure firewall rules allow traffic on ports 80/443
- Verify backend APIs are reachable from the VM
- Set up log rotation and monitoring as needed

---

## Local Development

```bash
pnpm install
pnpm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Troubleshooting

| Issue | Possible cause | Solution |
|-------|----------------|---------|
| Build fails | Missing env vars | Ensure all `NEXT_PUBLIC_*` variables are set at build time |
| Auth redirect fails | Missing/incorrect `NEXT_PUBLIC_LITMUSCHECK_URL` or wrong token shape | Ensure `/login` returns JSON with `accessToken` and that the frontend can reach it from the app server |
| API errors | CORS or wrong base URL | Verify backend CORS allows your frontend origin; check API URLs |
| Blank page | JS errors | Check browser console; verify Sentry DSN if using error tracking |

---

[Litmus Check](https://www.litmuscheck.com)
