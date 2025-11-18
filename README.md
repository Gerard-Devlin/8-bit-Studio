# 8-bit Studio

<img src="./public/logo.png" alt="8-bit Studio logo" width="128" />

[![Vite](https://img.shields.io/badge/built%20with-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/styles-Tailwind%20CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/github/license/Gerard-Devlin/PixelMuse?style=flat-square)](LICENSE)

Turn any reference photo into crisp, console-inspired pixel art right in the browser.

## Features

-   Drag-and-drop image upload with GIF parsing (animated sources export as animated GIFs)
-   Palette picker inspired by retro hardware (Game Boy, NES, C64, neon sets, and more)
-   Sliders for pixel size and sample columns with instant preview + SVG/PNG exports
-   Dual download buttons (PNG/SVG) plus automatic GIF download when the source is animated
-   Live aurora background and responsive shadcn/ui layout tailored for desktop & mobile
-   Status pill messaging for processing, GIF downscaling, and error diagnostics
-   Quantized SVG builder + GIF writer backed by `omggif` for sharp, consistent pixels

## Quick Start

```bash
git clone https://github.com/Gerard-Devlin/8-bit-Studio.git
cd 8-bit-Studio
npm install
npm run dev      # start Vite dev server
```

### Production

```bash
npm run build    # generate dist/
# deploy however you prefer (Netlify, Vercel, static hosting, etc.)
```

## Tech Stack

-   React 19 + Vite
-   Tailwind CSS + shadcn/ui components
-   Lucide icons
-   `omggif` for GIF encoding/decoding

## Performance Notes

-   Quantization work is batched per frame and guarded by job IDs to avoid race conditions
-   GIF exports clamp pixel size dynamically (4Mpx safety budget) to prevent OOM crashes
-   Palette lookups are memoized so each frame reuses color-distance calculations
-   The aurora background runs via a single animated gradient layer, keeping layout fluid

Launch 8-bit Studio, drop in an image (or GIF), tweak the sliders and palette, then export lovingly chunky pixels in seconds.
