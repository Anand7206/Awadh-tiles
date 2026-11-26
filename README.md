# AWADH TILES GALLERY — Website Setup, Deployment & Handover Guide

Single-page, mobile-first lead-generation landing page for **AWADH TILES GALLERY** (Best Tiles Showroom in Lucknow). Built with plain HTML5, CSS3, and vanilla JavaScript—no frameworks or build tools required.

---

## 1. Folder Structure

```text
/
├── index.html                  # Main single-page landing page + SEO + JSON-LD schema
├── robots.txt                  # Search engine crawl rules + sitemap pointer
├── sitemap.xml                 # XML sitemap for Google Search Console
├── README.md                   # This setup, deployment & handover guide
├── css/
│   ├── style.css               # Readable source stylesheet
│   └── style.min.css           # Minified stylesheet loaded by index.html
├── js/
│   ├── config.js               # Single configuration file for all business details & links
│   ├── main.js                 # Readable source JS (lightbox, IST status, form, tracking)
│   └── main.min.js             # Minified JS loaded by index.html
└── assets/
    ├── logo/
    │   ├── logo.png            # Official AWADH TILES GALLERY logo (transparent PNG)
    │   ├── favicon.svg         # Scalable vector favicon
    │   ├── favicon-16x16.png
    │   ├── favicon-32x32.png
    │   └── apple-touch-icon.png
    └── images/                 # Real photographs (WebP + JPG fallback)
        ├── hero-showroom.webp / .jpg
        ├── showroom-front.webp / .jpg
        ├── showroom-1.webp / .jpg … showroom-6.webp / .jpg
        ├── cat-gvt.webp / .jpg
        ├── cat-pgvt.webp / .jpg
        ├── cat-wall-floor.webp / .jpg
        ├── cat-granite.webp / .jpg
        ├── cat-slabs.webp / .jpg
        ├── cat-bath-fittings.webp / .jpg
        ├── cat-adhesive.webp / .jpg
        └── cat-epoxy.webp / .jpg
```

---

## 2. How to Update Business Details (`js/config.js`) & Swap Photos

### Editing Business Details
Open `js/config.js` in any text editor. Every phone link, WhatsApp link, map link, Play Store badge, social link, and form endpoint reads from `window.SITE_CONFIG`.
- `phoneDisplay` / `phoneHref`: Currently set to `+91 99368 42651` and secondary `+91 91406 24387`.
- `whatsappNumber`: Currently set to `919936842651` (digits only, international format).
- `address.street` & `address.pincode`: Currently set to `Kanpur Road, Bhoohar Rd` and `226017`.
- `timings`: Update `display`, `schedule`, and change `isPlaceholder: false` once confirmed.
- `playStoreLink`: Paste the Google Play Store URL when the Android app goes live; the greyed-out **"Coming Soon"** badge automatically activates.
- `social.instagramUrl` & `social.facebookUrl`: Paste your profile URLs; social icons remain hidden while empty or marked as `{{...}}`.

> **Also update static SEO tags** in `index.html`, `sitemap.xml`, and `robots.txt`: replace `{{DOMAIN}}` and `{{GSC_VERIFICATION}}` so search crawlers index the exact live details before JavaScript runs.

### Swapping Placeholder Photos
Replace the placeholder files inside `assets/images/` using the **exact same filenames**, keeping both `.webp` and `.jpg` versions under **200 KB** (`hero-showroom` under **350 KB**):
- `hero-showroom.webp` / `.jpg` (1920×1080, 16:9)
- `showroom-front.webp` / `.jpg` (1200×900, 4:3)
- `showroom-1` to `showroom-6` (1200×900, 4:3)
- `cat-gvt`, `cat-pgvt`, `cat-wall-floor`, `cat-granite`, `cat-slabs`, `cat-bath-fittings`, `cat-adhesive`, `cat-epoxy` (800×800, 1:1)

Then remove the `<!-- TODO: replace with client photo -->` comments in `index.html`.

> **Note on Minified Assets:** `index.html` loads `css/style.min.css` and `js/main.min.js` for faster page load. If you edit `css/style.css` or `js/main.js`, re-minify them (or temporarily point `index.html` to `css/style.css` and `js/main.js`).

---

## 3. How to Deploy & Enable SSL (HTTPS)

### Option A: cPanel / Hostinger Shared Hosting
1. Log in to **cPanel** or **Hostinger hPanel** → open **File Manager**.
2. Navigate to `public_html/`.
3. Upload all files and folders (`index.html`, `robots.txt`, `sitemap.xml`, `css/`, `js/`, `assets/`) directly into `public_html/`.
4. **Enable Free SSL (HTTPS):**
   - In **cPanel**: Open **SSL/TLS Status** → select your domain → click **Run AutoSSL**. Then enable **Force HTTPS Redirect** in **Domains**.
   - In **Hostinger**: Open **Security → SSL** → click **Install SSL** (Let's Encrypt) and toggle **Force HTTPS** ON.

### Option B: Netlify (Free, Fast Static Hosting)
1. Sign in at [app.netlify.com](https://app.netlify.com).
2. Drag and drop the project folder onto **Sites → Add new site → Deploy manually**.
3. Go to **Domain management → Add a domain** to connect your custom domain (`awadhtilesgallery.com`).
4. Netlify automatically provisions and renews a **Let's Encrypt SSL certificate** and enforces HTTPS.

---

## 4. Google Sheet + Apps Script Lead Form Setup

Until `formEndpoint` is configured, submitting the inquiry form safely falls back to opening WhatsApp with the customer's details pre-filled so no lead is ever lost. To also store every lead in a Google Sheet:

1. Create a new **Google Sheet** named `Awadh Tiles Gallery Leads`.
2. Rename the first tab to `Leads` and add these headers in Row 1 (`A1:G1`):
   `Timestamp | Name | Mobile | Product | Locality | Message | Source`
3. Click **Extensions → Apps Script**.
4. Replace the default code with:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name || "",
      "'" + (data.phone || ""),
      data.product || "",
      data.locality || "",
      data.message || "",
      data.source || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. Click **Deploy → New deployment**.
6. Select type **Web app**:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
7. Click **Deploy**, authorize permissions, and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).
8. Paste that URL into `js/config.js` as `formEndpoint`.

---

## 5. Google Search Console Setup

1. Open [Google Search Console](https://search.google.com/search-console) and click **Add Property**.
2. Choose **Domain** (verify via TXT DNS record at your domain registrar) OR **URL prefix** (`https://yourdomain.com/`).
3. If using the **HTML Tag** verification method:
   - Copy the `content="..."` token from Search Console.
   - Replace `{{GSC_VERIFICATION}}` in `<head>` of `index.html` and re-upload.
   - Click **Verify** in Search Console.
4. Go to **Sitemaps** in the left menu, enter `sitemap.xml`, and click **Submit**.
5. Use **URL Inspection** on your homepage URL and click **Request Indexing**.
6. Once live, validate your structured data with [Google's Rich Results Test](https://search.google.com/test/rich-results).

---

## 6. Remaining Placeholders & TODO Photos Checklist

### Config & SEO Placeholders (`{{...}}`)
| Placeholder | Where Used | Action Needed |
|---|---|---|
| `{{TIMINGS}}` / `{{SUNDAY_TIMING}}` | `js/config.js`, `index.html` | Confirm Mon–Sat & Sunday showroom hours, set `isPlaceholder: false` |
| `{{PLAY_STORE_LINK}}` | `js/config.js` | Add Play Store URL once Android app is live |
| `{{DOMAIN}}` | `js/config.js`, `index.html`, `sitemap.xml`, `robots.txt` | Enter final domain (e.g. `awadhtilesgallery.com`) |
| `{{FORM_ENDPOINT}}` | `js/config.js` | Paste Google Apps Script Web App URL |
| `{{META_PIXEL_ID}}` | `js/config.js` | Optional Meta Pixel ID (and add Pixel snippet in `<head>` if used) |
| `{{GSC_VERIFICATION}}` | `index.html` | Paste Google Search Console HTML verification token |
| `{{INSTAGRAM_URL}}` | `js/config.js` | Add Instagram profile URL (hidden while empty) |
| `{{FACEBOOK_URL}}` | `js/config.js` | Add Facebook page URL (hidden while empty) |

### Copy & Trust Points to Confirm with Client
- Hero trust line (`Wide range of brands`, `Best prices in Lucknow`, `Expert guidance`)
- Section 2 Quick Trust Strip items (`Top Brands`, `Huge Display Showroom`, `Best Price Guarantee`, `Expert Advice`)
- Section 4 About Us draft copy (`{{CLIENT TO REVIEW}}`)
- Section 5 Why Choose Us 6 feature descriptions (`{{CLIENT TO CONFIRM}}`)

### Temporary Placeholder Photos (`TODO: replace with client photo`)
All 16 images in `assets/images/` currently use free-licence Pexels architectural/interior/tile photography as placeholders until real showroom photos are supplied:
- `hero-showroom.webp` / `.jpg`
- `showroom-front.webp` / `.jpg`
- `showroom-1` through `showroom-6` (`.webp` / `.jpg`)
- `cat-gvt`, `cat-pgvt`, `cat-wall-floor`, `cat-granite`, `cat-slabs`, `cat-bath-fittings`, `cat-adhesive`, `cat-epoxy` (`.webp` / `.jpg`)

---

## 7. Client Handover Checklist

- [ ] Domain name registered in **AWADH TILES GALLERY**'s legal/owner name and email
- [ ] Domain registrar & hosting account login credentials handed over
- [ ] Full source code ZIP / Git repository delivered
- [ ] Google Search Console & Google Analytics / Meta Pixel ownership transferred to client's Google account
- [ ] Google Sheet (`Leads`) & Apps Script ownership under client's Google account
- [ ] SSL/HTTPS active and `http://` redirecting to `https://`
- [ ] Domain & hosting renewal dates and annual charges documented below:
  - **Domain Registrar:** `____________________` | **Renewal Date:** `__________` | **Annual Charge:** `________`
  - **Hosting Provider:** `____________________` | **Renewal Date:** `__________` | **Annual Charge:** `________`
