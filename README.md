# South Cheshire Trades Directory (Crewe • Nantwich • Sandbach)

A fast, high-converting **Programmatic SEO & Local Lead Generation Directory** built with **Next.js (App Router + TypeScript)** following Chris Koerner's *Directory Profits / Filter Gap* blueprint.

---

## 1. Key Features Built In

* **Multi-City "Copy & Paste" Engine (`src/config/region.ts`):**
  Pre-configured for **South Cheshire** covering **Crewe (`CW1`/`CW2`)**, **Nantwich (`CW5`)** and **Sandbach (`CW11`)** plus surrounding villages (*Wistaston, Shavington, Haslington, Willaston, Stapeley, Elworth, Wheelock, Audlem*).
* **10 High-Ticket Home & Trade Categories (`src/config/categories.ts`):**
  Plumbers & Heating, Electricians & EV, Roofers & Guttering, Driveway Cleaning & Paving, Landscapers & Tree Surgeons, 24/7 Locksmiths, Pest Control, Cleaners, Handyman, and Painters/Plasterers.
* **Chris Koerner's "Filter Gap Secret":**
  Real-time interactive filtering for what Google Maps misses: *24/7 Emergency Callout*, *No Call-Out Fee*, *Free Written Quotes*, *Gas Safe / NICEIC*, *DBS Checked*, *Unmarked Van*, *Dust-Free Sanding*, etc.
* **155+ Statically Generated Programmatic SEO Pages:**
  * `/` – South Cheshire Regional Hub
  * `/crewe`, `/nantwich`, `/sandbach` – Town Hubs
  * `/[town]/[category]` – 30 high-intent Town × Trade landing pages with `ItemList` and `FAQPage` JSON-LD schema
  * `/pro/[slug]` – 120 dedicated Digital Shopfront pages with `LocalBusiness` JSON-LD schema
  * `/for-businesses` – Self-serve Phase 1 pricing, ROI calculator, live Top-3 scarcity table, and claim form
  * `/admin` – Owner Command Centre for 1-click WhatsApp/Email outreach, homeowner quote leads, and business claims
  * `/sitemap.xml` & `/robots.txt` – Dynamic SEO sitemap for Google Search Console

---

## 2. Two-Stage Monetization Architecture

1. **Stage 1 (On Launch): TOP 3 Featured Listings (£29/mo) & Digital Shopfronts (£59/mo)**
   * Strictly capped at **3 Featured Pros per category in each town** (scarcity banner automatically displays remaining spots on every category page).
   * Unclaimed profiles display a self-serve *"Own this business? Claim or Upgrade to Top 3 (£29/mo)"* prompt.
   * Automated outreach generator (`npm run outreach`) detects the **60 businesses without a website (Facebook-only)** and prepares ready-to-send WhatsApp/Email messages with direct claim links.
2. **Stage 2 (Right After Launch): "Get 3 Free Local Quotes" Lead Gen Engine**
   * Homeowners click *"Get 3 Free Local Quotes"* on any page.
   * Enquiries are stored via `/api/leads` and immediately matched with the Top 3 Verified Pros in that town & trade.

---

## 3. Useful Commands

```bash
# Install dependencies
npm install

# Run development server locally
npm run dev

# Re-generate or enrich listings database (120 South Cheshire businesses)
npm run seed

# Generate automated Email & WhatsApp outreach campaigns (CSV + JSON)
npm run outreach

# Build all 155+ static Programmatic SEO pages for production
npm run build
```

---

## 4. How to "Copy & Paste" to a New City Cluster in 15 Minutes

1. Open `src/config/region.ts` and update `brandName`, `domain`, and the `towns` list (e.g., *Northwich, Winsford & Middlewich* or *Chester & Ellesmere Port*).
2. Run `npm run seed -- --input ./your-google-maps-export.json` (or adapt the town arrays in `scripts/import-and-enrich.mjs` and run `npm run seed && npm run outreach`).
3. Push to GitHub and deploy free on **Vercel** or **Cloudflare Pages**.
