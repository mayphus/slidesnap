# CLAUDE.md

This file provides guidance to Claude Code when working with the SlidesSnap project.

## Project Overview

SlidesSnap is a text-to-image generator for social media platforms, deployed on Cloudflare Workers. It converts long-form text into visually appealing, platform-optimized images suitable for posting on X/Twitter, Instagram, Facebook, and RedNote/XiaoHongShu.

## Architecture

**Tech Stack:**
- **Backend**: Hono web framework on Cloudflare Workers
- **Frontend**: Vanilla HTML/JS with Alpine.js for reactivity
- **Styling**: Tailwind CSS via CDN
- **Image Generation**: @napi-rs/canvas for server-side Canvas API
- **Build System**: Vite with TypeScript
- **Deployment**: GitHub Actions → Cloudflare Workers

**Key Files:**
- `src/index.ts` - Main Hono app entry point
- `src/routes/api.ts` - API endpoints for image generation
- `src/lib/textRenderer.ts` - Canvas-based text-to-image logic
- `src/lib/templates.ts` - Social media platform templates
- `wrangler.jsonc` - Cloudflare Workers configuration

## Development Commands

```bash
# Install dependencies
npm install

# Development server (local)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Generate Cloudflare types
npm run cf-typegen
```

## API Endpoints

- `GET /api/templates` - List all available social media templates
- `POST /api/generate` - Generate image from text
- `GET /api/health` - Health check endpoint

## Social Media Templates

The app supports these platforms with optimized dimensions:
- **X/Twitter**: 1200x675px (16:9)
- **Instagram Post**: 1080x1080px (1:1)
- **Instagram Story**: 1080x1920px (9:16)
- **Facebook**: 1200x630px (~1.9:1)
- **RedNote**: 1080x1080px (1:1)

## Canvas Text Rendering

The `TextRenderer` class handles:
- Text wrapping based on canvas width
- Font sizing and styling
- Background color application
- Vertical text centering
- Text truncation with ellipsis for long content
- PNG output generation

## Deployment Configuration

### GitHub Secrets Required:
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token for Wrangler
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Wrangler Configuration:
- Uses `wrangler.jsonc` format with comments
- Node.js compatibility enabled for Canvas API
- Static assets served from `public/` directory
- Build command integrated with Vite

## Development Notes

### Canvas API Usage:
- Uses `@napi-rs/canvas` which provides Node.js Canvas API
- Requires `node_compat: true` in wrangler.jsonc
- Text measurement and wrapping handled manually
- PNG buffer output for HTTP responses

### Frontend Design:
- Single-page application with embedded HTML in Hono
- Alpine.js for reactive form interactions
- Tailwind CSS for styling via CDN
- Real-time preview and download functionality

### Error Handling:
- API validation for required fields
- Template existence checking
- Canvas rendering error catching
- User-friendly error messages

## Common Tasks

### Adding New Social Media Platform:
1. Add template to `src/lib/templates.ts`
2. Test with appropriate dimensions and styling
3. Update frontend template selector

### Modifying Text Rendering:
1. Edit `src/lib/textRenderer.ts`
2. Test text wrapping and positioning
3. Verify PNG output quality

### UI Updates:
1. Modify HTML in `src/index.ts`
2. Update Tailwind classes for styling
3. Test Alpine.js reactivity

### Deployment:
- Push to `main` branch triggers automatic deployment
- Check GitHub Actions for build status
- Verify deployment in Cloudflare Workers dashboard

## Troubleshooting

**Canvas API Issues:**
- Ensure `node_compat: true` in wrangler.jsonc
- Check @napi-rs/canvas dependency version
- Verify font loading and text measurement

**Build Failures:**
- Run `npm run type-check` for TypeScript errors
- Check Vite configuration for import issues
- Verify all dependencies are installed

**Deployment Issues:**
- Validate GitHub secrets are set correctly
- Check Wrangler configuration syntax
- Review Cloudflare Workers dashboard for errors