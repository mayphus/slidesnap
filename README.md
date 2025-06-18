# SlidesSnap

Transform your text into beautiful social media images with SlidesSnap - a fast, modern text-to-image generator optimized for social media platforms.

## Features

- 🎨 **Multiple Platform Support**: X/Twitter, Instagram, Facebook, RedNote/XiaoHongShu
- 🎭 **Customizable Styling**: Background colors, text colors, font sizes
- ⚡ **Edge Performance**: Deployed on Cloudflare Workers for global speed
- 📱 **Responsive Interface**: Works seamlessly on desktop and mobile
- 🖼️ **High-Quality Output**: PNG images with proper dimensions for each platform
- 🚀 **Instant Generation**: Real-time text-to-image conversion

## Live Demo

[Your deployed Cloudflare Workers URL will go here]

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account (for deployment)

### Local Development

1. **Clone and install:**
   ```bash
   git clone <your-repo>
   cd slidesnap
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

### Deployment

1. **Set up Cloudflare Workers:**
   - Create a Cloudflare account
   - Get your API token and Account ID

2. **Configure GitHub Secrets:**
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

3. **Deploy:**
   ```bash
   npm run deploy
   ```

   Or push to `main` branch for automatic deployment via GitHub Actions.

## Usage

1. **Enter Your Text**: Paste or type your content (up to 2000 characters)
2. **Choose Platform**: Select from X/Twitter, Instagram, Facebook, or RedNote
3. **Customize Style**: Adjust background color, text color, and font size
4. **Generate**: Click "Generate Image" to create your social media image
5. **Download**: Save the generated PNG image to your device

## Supported Platforms

| Platform | Dimensions | Aspect Ratio |
|----------|------------|--------------|
| X/Twitter | 1200×675 | 16:9 |
| Instagram Post | 1080×1080 | 1:1 |
| Instagram Story | 1080×1920 | 9:16 |
| Facebook | 1200×630 | ~1.9:1 |
| RedNote | 1080×1080 | 1:1 |

## API

### Endpoints

- `GET /api/templates` - Get available social media templates
- `POST /api/generate` - Generate image from text
- `GET /api/health` - Health check

### Example API Usage

```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Your social media text here",
    templateId: "twitter",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontSize: 48
  })
});

const imageBlob = await response.blob();
```

## Tech Stack

- **Backend**: Hono (Cloudflare Workers)
- **Frontend**: Alpine.js + Tailwind CSS
- **Image Generation**: @napi-rs/canvas
- **Build Tool**: Vite + TypeScript
- **Deployment**: GitHub Actions + Cloudflare Workers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

MIT License - see LICENSE file for details