# AGENTS.md - Astro Portfolio

This document provides comprehensive guidance for AI agents working with this Astro portfolio project.

## Project Overview

A minimal, single-page personal portfolio website for Luis D Catacora. Built with Astro for optimal performance - ships zero JavaScript by default (except analytics).

**Live Site:** [lucataco.com](https://lucataco.com)

**Key Features:**

- Profile card with avatar, name, and bio
- Social media links (GitHub, Twitter/X, LinkedIn, PayPal, Resume, Email)
- Vercel Analytics + Custom analytics integration
- PWA-ready with manifest.json
- Fully static site generation

---

## Tech Stack

| Technology                                        | Version     | Purpose               |
| ------------------------------------------------- | ----------- | --------------------- |
| [Astro](https://astro.build)                      | ^5.1.1      | Static site generator |
| [@vercel/analytics](https://vercel.com/analytics) | ^1.1.1      | Web analytics         |
| TypeScript                                        | (via Astro) | Type safety           |

**No React, no MUI, no runtime JavaScript** (except analytics scripts).

---

## Project Structure

```
astro-portfolio/
├── public/                    # Static assets (copied as-is to build)
│   ├── favicon.png           # Site favicon
│   ├── manifest.json         # PWA manifest
│   ├── resume.pdf            # Downloadable resume
│   └── robots.txt            # SEO robots configuration
├── src/
│   ├── assets/
│   │   └── images/
│   │       ├── avatar.jpg    # Profile picture (1x)
│   │       └── avatar@2x.jpg # Profile picture (2x retina)
│   ├── components/
│   │   └── Profile.astro     # Main profile card component
│   ├── layouts/
│   │   └── Layout.astro      # Base HTML layout with analytics
│   └── pages/
│       └── index.astro       # Home page (entry point)
├── astro.config.mjs          # Astro configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── AGENTS.md                 # This file
```

---

## Development Commands

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm install`     | Install dependencies                 |
| `npm run dev`     | Start dev server at `localhost:4321` |
| `npm run build`   | Build production site to `./dist/`   |
| `npm run preview` | Preview production build locally     |

---

## Key Files Explained

### `src/pages/index.astro`

The home page. Imports and renders the Layout and Profile components.

### `src/layouts/Layout.astro`

Base HTML document structure containing:

- HTML `<head>` with meta tags, favicon, manifest
- Custom analytics script (data.lucataco.dev)
- Vercel Analytics integration
- Main content slot
- Footer with dynamic copyright year

**Props:**

- `title` (optional): Page title, defaults to "Luis D Catacora"
- `description` (optional): Meta description

### `src/components/Profile.astro`

The main profile card containing:

- Profile image with srcset for retina displays
- Name and bio text
- Social media links with inline SVG icons

**Data Structure:**

```typescript
interface SocialLink {
  name: string; // Display name (used for icon selection)
  url: string; // Link URL
  ariaLabel: string; // Accessibility label
}
```

### `astro.config.mjs`

Minimal Astro configuration:

- `site`: Set to `https://lucataco.com` for canonical URLs

### `tsconfig.json`

TypeScript configuration:

- Extends Astro's strict preset
- Path alias: `@/*` maps to `src/*`

---

## Code Conventions

### Astro Components

1. **File Naming**: PascalCase for components (`Profile.astro`, `Layout.astro`)
2. **Frontmatter**: TypeScript code goes in the `---` fence at the top
3. **Props Interface**: Define TypeScript interfaces for component props
4. **Scoped Styles**: Use `<style>` tags for component-specific CSS
5. **Global Styles**: Use `:global()` selector sparingly, prefer in Layout

### CSS Conventions

1. **Class Naming**: kebab-case (`profile-container`, `icon-button`)
2. **Scoped by Default**: Styles in `<style>` tags are automatically scoped
3. **Units**: Use `rem` for spacing, `px` for borders/shadows
4. **Colors**: Use standard color names or rgba for transparency

### SVG Icons

Icons are embedded inline in `Profile.astro` for:

- Zero external dependencies
- Best performance (no network requests)
- Full CSS control (currentColor inheritance)

**Standard size:** 24x24 viewBox, scaled via CSS

---

## Analytics Configuration

### Vercel Analytics

Integrated via `@vercel/analytics` package. Injected in Layout.astro:

```astro
<script>
  import { inject } from "@vercel/analytics";
  inject();
</script>
```

### Custom Analytics (Umami-style)

Script loaded in `<head>`:

```html
<script
  defer
  src="https://data.lucataco.dev/script.js"
  data-website-id="b19756e5-9bc2-4f91-8b77-3ca7274c59be"
></script>
```

---

## Common Modifications

### Adding a New Social Link

1. Open `src/components/Profile.astro`
2. Add entry to `socialLinks` array:

```typescript
{
  name: "NewPlatform",
  url: "https://example.com/username",
  ariaLabel: "NewPlatform profile",
}
```

3. Add SVG icon in the template section (search for existing icon patterns)
4. The icon will render automatically based on `link.name`

### Updating Profile Information

Edit `src/components/Profile.astro`:

- **Name**: Change the `<h1>` content
- **Bio**: Change the `<p class="bio">` content
- **Avatar**: Replace images in `src/assets/images/`

### Updating Site Metadata

Edit `src/layouts/Layout.astro`:

- **Default Title**: Change `title` default value in Props
- **Description**: Change `description` default value
- **Favicon**: Replace `public/favicon.png`

### Adding a New Page

1. Create `src/pages/newpage.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="New Page">
  <h1>New Page Content</h1>
</Layout>
```

2. The page will be available at `/newpage`

### Changing the Site URL

Edit `astro.config.mjs`:

```javascript
export default defineConfig({
  site: "https://your-new-domain.com",
});
```

---

## Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel dashboard
3. Vercel auto-detects Astro and configures build settings
4. Deploy automatically on push

**Build Settings (auto-detected):**

- Framework: Astro
- Build Command: `npm run build`
- Output Directory: `dist`

### Other Platforms

Astro generates static files to `./dist/`. Deploy to any static host:

- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS S3 + CloudFront

---

## Image Handling

Images in `src/assets/` are processed by Astro:

- Automatic optimization
- Format conversion (WebP/AVIF)
- Responsive srcset generation

Images in `public/` are copied as-is (no processing).

**Current Setup:**

- Avatar images use Astro's image processing
- Resume PDF is in `public/` (no processing needed)

---

## Performance Notes

This site achieves excellent performance by:

1. **Zero JS by default**: No React/Vue/Svelte runtime
2. **Inline SVG icons**: No icon font or external requests
3. **Scoped CSS**: Minimal CSS, no unused styles
4. **Static generation**: Pre-rendered HTML at build time
5. **Optimized images**: Astro processes images automatically

**Only JavaScript shipped:**

- Vercel Analytics (~1KB)
- Custom analytics script (external)

---

## Troubleshooting

### Build Errors

**"Cannot find module"**: Run `npm install` to ensure dependencies are installed.

**Image import errors**: Ensure images exist in `src/assets/images/` with correct filenames.

### Development Server

**Port conflict**: Dev server runs on `localhost:4321`. If busy, Astro will suggest an alternative.

### Analytics Not Working

- Verify site is deployed (analytics don't work on localhost for Vercel)
- Check browser console for script loading errors
- Ensure ad blockers aren't blocking analytics scripts

---

## Migration Notes

This project was migrated from Create React App (CRA) with the following changes:

| Before (React)     | After (Astro)          |
| ------------------ | ---------------------- |
| React 18 + MUI     | Pure Astro components  |
| CSS Modules        | Scoped `<style>` tags  |
| MUI IconButton     | Native `<a>` + CSS     |
| MUI Tooltip        | HTML `title` attribute |
| `className`        | `class`                |
| `onClick` handlers | Native `href` links    |
| ~150KB+ JS bundle  | ~1KB (analytics only)  |

---

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Astro Discord](https://astro.build/chat)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
