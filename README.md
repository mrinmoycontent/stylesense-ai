# StyleSense — Virtual Stylist

**StyleSense** is a responsive web application and personal styling studio crafted with React, TypeScript, and Tailwind CSS. It delivers personalized outfit recommendations, color harmony analysis, wardrobe planning, and curated local styling rules in an elegant fashion-tech interface.

---

## Key Highlights & Architectural Principles

- **100% Local Intelligence**: Generates complete sartorial ensembles and color harmonies without any external AI APIs or cloud services.
- **Zero API Keys & Zero Databases**: Runs entirely client-side with persistent user data saved securely in browser `localStorage`.
- **Fashion-Tech Aesthetics**: Warm ivory canvas (`#FAF7F2`), deep charcoal typography, muted beige accents, serif editorial headings (`Cormorant Garamond`), and clean sans body text (`Plus Jakarta Sans`).

---

## Features

1. **Editorial Home Page**: High-contrast typography, aspirational styling introduction, instant preset garment selectors, and a prominent "Style My Outfit" action.
2. **Photo Upload with Live Preview**: Drag-and-drop or file browsing using browser-side `FileReader` (supports PNG, JPG, WEBP).
3. **Garment Attribute Customization**: Detailed category selections (Tops, Bottoms, One-Piece, Outerwear, Footwear, Accessories), cuts, color swatches with undertones, and aesthetic styles.
4. **Occasion Dress Codes**: Five targeted occasions: Casual, Office, Party, Date Night, and Wedding Guest, with tailored formality ratings and silhouette advice.
5. **Local Styling Engine**: Generates 3 distinct curated looks per request:
   - *Look 01: The Signature Ensemble* (Quintessential balance & classic pairings)
   - *Look 02: The Contemporary Twist* (Modern proportions & high-low tension)
   - *Look 03: Monochromatic Tonal Luxe* (Tone-on-tone textures & quiet luxury)
6. **Weather-Based Stylist**: Climate-calibrated sartorial suggestions across 5 weather states (Sunny, Cloudy, Rainy, Windy, Cold) and 4 temperature ranges (Below 10°C, 10–19°C, 20–29°C, 30°C+). Selects breathable textiles, weather-sealed footwear, water-repellent trench coats, and protective accessories.
7. **Outfit Calendar**: Interactive monthly and 7-day agenda views. Schedule outfits from recommendations, favorites, or custom planning. Features wear tracking ("Mark as Worn") and automatic repetition alerts to prevent over-wearing identical staples within 7 days.
8. **Color Harmony Studio**: Interactive color wheel analysis offering Complementary, Analogous, and Monochromatic harmonies, plus the classic 60-30-10 fashion color distribution rule.
9. **Capsule Wardrobe Planner**: Add, edit, and filter garments. Evaluates capsule versatility, occasion coverage, and category balance. Features one-click "Style This Item" integration.
10. **Saved Lookbook**: Archive favorite looks in browser `localStorage` with personal notes, formula copying, and printable lookbook sheets.
11. **Responsive & Accessible**: Seamlessly adapts from mobile devices to full-width 1440px desktop displays.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# 3. Open in browser at http://localhost:3000
```

---

## Deploying to Vercel

Deploying **StyleSense** to Vercel takes under 2 minutes:

1. **Push to Git**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial StyleSense release"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your Git repository.

3. **Verify Settings & Deploy**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: *None needed* (the application runs 100% in the browser).
   - Click **Deploy**.
