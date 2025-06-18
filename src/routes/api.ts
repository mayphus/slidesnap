import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SVGRenderer } from '../lib/svgRenderer';
import { getTemplate, getAllTemplates } from '../lib/templates';

const api = new Hono();

// Enable CORS for all API routes
api.use('/*', cors());

// Get all available templates
api.get('/templates', (c) => {
  const templates = getAllTemplates();
  return c.json({ templates });
});

// Generate image from text
api.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      text, 
      templateId, 
      backgroundColor, 
      textColor, 
      fontSize 
    } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return c.json({ error: 'Text is required and must be a string' }, 400);
    }

    if (!templateId || typeof templateId !== 'string') {
      return c.json({ error: 'Template ID is required' }, 400);
    }

    // Get template
    const template = getTemplate(templateId);
    if (!template) {
      return c.json({ error: 'Invalid template ID' }, 400);
    }

    // Generate SVG
    const svgContent = SVGRenderer.createImageFromText({
      text,
      template,
      customBackgroundColor: backgroundColor,
      customTextColor: textColor,
      customFontSize: fontSize
    });

    // Return SVG as response
    return new Response(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `attachment; filename="slidesnap-${templateId}-${Date.now()}.svg"`
      }
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return c.json({ error: 'Failed to generate image' }, 500);
  }
});

// Health check endpoint
api.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'SlidesSnap API'
  });
});

export { api };