# South Cheshire Locals (Crewe • Nantwich • Sandbach | CW1–CW11)

A warm, community-first local trades directory built with **Next.js 16 (App Router + TypeScript)** and configured for **Cloudflare Workers (`@opennextjs/cloudflare`) + Cloudflare D1**.

---

## 1. Key Community Features

* **CW1–CW11 Neighbourhood Identity:** Built around **Crewe (`CW1`/`CW2`)**, **Nantwich (`CW5`)**, and **Sandbach (`CW11`)** plus surrounding Cheshire East villages (*Wistaston, Shavington, Haslington, Willaston, Stapeley, Elworth, Wheelock, Audlem*).
* **Nominate a Local Trade (`/api/nominations`):** Residents can add friends, relatives, or trusted tradespeople (including Facebook-only pros) in 30 seconds for £0.
* **Neighbour Vouching (`/api/vouch`) & 1-Click Share:** One-click local vouch counters and copy-to-share links tailored for Crewe/Nantwich/Sandbach Facebook groups and WhatsApp.
* **Practical Local Filters:** Filter by *24/7 Emergency Callout*, *No Call-Out Fee*, *Free Written Quotes*, *Gas Safe / NICEIC*, *DBS Checked*, and more.
* **Protected Community Steward Console (`/admin`):** Password-protected console (`ADMIN_PASSWORD`) to review nominations, publish approved trades live in 1 click, quick-add real CW trades, inspect homeowner quote requests (`/api/leads`), and toggle **Sample Preview Mode** ON/OFF.
* **Hybrid Cloudflare D1 + Local JSON Storage (`src/lib/db.ts`):** Persists nominations, vouches, leads, claims, approved trades, and settings in Cloudflare D1 in production, with automatic local JSON fallback for standalone Node dev.

---

## 2. Local Development & Cloudflare Preview

```bash
# Install dependencies
npm install

# Run standard Next.js dev server
npm run dev

# Set up local D1 schema & seed rows
npm run db:migrate:local

# Build & preview inside the real Cloudflare Workers runtime (workerd)
cp .dev.vars.example .dev.vars
npm run preview
```

---

## 3. Deploying to Cloudflare Workers via GitHub

1. **Create a D1 database** in Cloudflare Dashboard (or CLI):
   ```bash
   npx wrangler d1 create sctd-community-db
   ```
   Paste the resulting `database_id` into `wrangler.jsonc`.
2. **Apply the D1 schema remotely:**
   ```bash
   npx wrangler d1 execute sctd-community-db --remote --file=./migrations/0001_init.sql
   ```
3. **Connect GitHub (`bezelon/SCTD`) in Cloudflare Dashboard → Workers & Pages → Create → Import a repository:**
   * **Build command:** `npx opennextjs-cloudflare build`
   * **Deploy command:** `npx opennextjs-cloudflare deploy`
4. **Set Variables & Secrets in Cloudflare Workers → Settings:**
   * Secret: `ADMIN_PASSWORD` (protects `/admin` and private API reads)
   * Variable: `NEXT_PUBLIC_SITE_URL` (e.g., `https://your-domain.co.uk`)
   * Variable: `NEXT_PUBLIC_DEMO_MODE` (`"true"` initially, or switch live in `/admin`)
