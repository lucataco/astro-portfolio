# Portfolio Website

A minimal, fast personal portfolio website built with [Astro](https://astro.build).

**Live Site:** [lucataco.com](https://lucataco.com)

## Tech Stack

- **[Astro](https://astro.build)** - Static site generator
- **Zero JavaScript** - Ships only HTML/CSS (except analytics)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/lucataco/astro-portfolio.git
cd astro-portfolio

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
astro-portfolio/
├── public/
│   ├── favicon.png
│   ├── manifest.json
│   ├── resume.pdf
│   └── robots.txt
├── src/
│   ├── assets/images/
│   │   └── avatar.jpg
│   ├── components/
│   │   └── Profile.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### Deployment

The build outputs static files to `./dist/`. Deploy to any static host:

- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS S3 + CloudFront

## Customization

### Update Profile Information

Edit `src/components/Profile.astro`:

- **Name**: Change the `<h1>` content
- **Bio**: Change the `<p class="bio">` content
- **Avatar**: Replace `src/assets/images/avatar.jpg`
- **Social Links**: Modify the `socialLinks` array

### Update Site Metadata

Edit `src/layouts/Layout.astro`:

- **Title**: Change `title` default value
- **Description**: Change `description` default value

### Update Site URL

Edit `astro.config.mjs`:

```javascript
export default defineConfig({
  site: "https://your-domain.com",
});
```

## License

MIT
