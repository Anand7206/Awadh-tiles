/**
 * AWADH TILES GALLERY - Central Configuration
 * Update values here to reflect changes across the entire website,
 * including Call/WhatsApp links, JSON-LD schema, form endpoint, and timings.
 * Any value formatted as "{{...}}" is treated as unset until replaced.
 */
window.SITE_CONFIG = {
  businessName: "AWADH TILES GALLERY",
  tagline: "Best Tiles Showroom in Lucknow",

  // Primary & secondary contact numbers provided by client
  phoneDisplay: "+91 99368 42651",
  phoneHref: "tel:+919936842651",
  secondaryPhoneDisplay: "+91 91406 24387",
  secondaryPhoneHref: "tel:+919140624387",

  // WhatsApp numbers in international digits-only format (no + or spaces)
  whatsappNumber: "919936842651",
  secondaryWhatsappNumber: "919140624387",
  whatsappDefaultMessage:
    "Hi Awadh Tiles Gallery, I want to know about your tiles collection.",

  // Address & Location
  address: {
    street: "Kanpur Road, Bhoohar Rd",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226017",
    country: "IN"
  },

  // Business timings & IST open/closed evaluation rules
  timings: {
    // Client to confirm exact showroom & Sunday hours
    display: "Mon – Sat: 10:00 AM – 8:00 PM (Call for Sunday hours)",
    timezone: "Asia/Kolkata",
    // Default schedule used for live IST Open/Closed badge until exact hours are confirmed
    // Day keys: 0 = Sun, 1 = Mon ... 6 = Sat. Format: ["HH:MM", "HH:MM"] or null if closed.
    schedule: {
      0: null, // {{SUNDAY_TIMING}} - set to ["10:30", "19:00"] if open on Sundays
      1: ["10:00", "20:00"],
      2: ["10:00", "20:00"],
      3: ["10:00", "20:00"],
      4: ["10:00", "20:00"],
      5: ["10:00", "20:00"],
      6: ["10:00", "20:00"]
    },
    isPlaceholder: true // Set to false once exact showroom timings are confirmed
  },

  // Google Maps coordinates & links
  maps: {
    lat: 26.8543892,
    lng: 80.8590696,
    placeUrl:
      "https://www.google.com/maps/place/Awadh+Tiles+Gallery+-+Best+Tiles+Shop+In+Lucknow/@26.8543892,80.8590696,17z/data=!4m7!3m6!1s0x399bfd4c7ac43073:0xd5bb66a35915c782!8m2!3d26.8543892!4d80.8590696!10e5!16s%2Fg%2F11ycrlg_bt",
    shortLink: "https://maps.app.goo.gl/sFYh2szSH78gWY3J7?g_st=ac",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=26.8543892,80.8590696",
    embedUrl:
      "https://maps.google.com/maps?q=26.8543892,80.8590696&z=16&output=embed"
  },

  // Android App (badge stays in "Coming Soon" state while empty or placeholder)
  playStoreLink: "{{PLAY_STORE_LINK}}",

  // Website Domain (used for canonical / schema metadata once live)
  domain: "{{DOMAIN}}",

  // Lead Form Google Apps Script Web App URL (falls back to WhatsApp if unset)
  formEndpoint: "{{FORM_ENDPOINT}}",

  // Analytics & Pixels (optional)
  metaPixelId: "{{META_PIXEL_ID}}",

  // Social Media Links (automatically hidden while empty or placeholder)
  social: {
    instagramUrl: "{{INSTAGRAM_URL}}",
    facebookUrl: "{{FACEBOOK_URL}}"
  }
};
