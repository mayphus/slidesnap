import { Hono } from 'hono';
import { api } from './routes/api';
import { assets } from './routes/assets';

const app = new Hono();

// API routes
app.route('/api', api);

// Static file serving
app.route('/', assets);

// Default route to serve index.html
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SlidesSnap - Text to Social Media Images</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-50">
    <div id="app">
        <div class="min-h-screen py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">SlidesSnap</h1>
                    <p class="text-xl text-gray-600">Transform your text into beautiful social media images</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Text Input Section -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-2xl font-semibold mb-4">Enter Your Text</h2>
                        <form id="textForm">
                            <textarea id="textInput" 
                                      placeholder="Enter your text here... (Supports paragraph breaks)" 
                                      class="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"></textarea>
                            
                            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                                    <select id="templateSelect" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="">Loading templates...</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                                    <input type="color" id="bgColor" value="#ffffff" class="w-full h-10 border border-gray-300 rounded-lg">
                                </div>
                            </div>
                            
                            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                                    <input type="color" id="textColor" value="#000000" class="w-full h-10 border border-gray-300 rounded-lg">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                                    <input type="range" id="fontSize" min="20" max="100" value="48" class="w-full">
                                    <span id="fontSizeValue" class="text-sm text-gray-600">48px</span>
                                </div>
                            </div>
                            
                            <button type="submit" 
                                    class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    id="generateBtn">
                                Generate Image
                            </button>
                        </form>
                    </div>
                    
                    <!-- Preview Section -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-2xl font-semibold mb-4">Preview</h2>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
                            <div id="previewArea">
                                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-gray-500">Your generated image will appear here</p>
                            </div>
                        </div>
                        
                        <div id="downloadSection" class="mt-4 hidden">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button id="downloadSvgBtn" 
                                        class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                                    Download SVG
                                </button>
                                <button id="downloadPngBtn" 
                                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                                    Download PNG
                                </button>
                            </div>
                            <p class="text-sm text-gray-600 mt-2 text-center">SVG: Vector format, scalable • PNG: Image format, compatible</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentImageBlob = null;

        // Load templates on page load
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const response = await fetch('/api/templates');
                const data = await response.json();
                const select = document.getElementById('templateSelect');
                
                select.innerHTML = '<option value="">Select a platform...</option>';
                data.templates.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template.id;
                    option.textContent = template.name;
                    // Set RedNote as default
                    if (template.id === 'rednote') {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Failed to load templates:', error);
                document.getElementById('templateSelect').innerHTML = '<option value="">Error loading templates</option>';
            }
        });

        // Font size slider
        document.getElementById('fontSize').addEventListener('input', (e) => {
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        });

        // Form submission
        document.getElementById('textForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const text = document.getElementById('textInput').value.trim();
            const templateId = document.getElementById('templateSelect').value;
            const backgroundColor = document.getElementById('bgColor').value;
            const textColor = document.getElementById('textColor').value;
            const fontSize = parseInt(document.getElementById('fontSize').value);
            
            if (!text) {
                alert('Please enter some text');
                return;
            }
            
            if (!templateId) {
                alert('Please select a platform');
                return;
            }
            
            const generateBtn = document.getElementById('generateBtn');
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text,
                        templateId,
                        backgroundColor,
                        textColor,
                        fontSize
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to generate image');
                }
                
                // Check if response is SVG
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('image/svg+xml')) {
                    // Handle SVG - convert to data URL for better browser compatibility
                    const svgText = await response.text();
                    currentImageBlob = new Blob([svgText], { type: 'image/svg+xml' });
                    
                    // Create data URL for SVG
                    const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
                    
                    // Display SVG as image with data URL
                    const previewArea = document.getElementById('previewArea');
                    previewArea.innerHTML = \`<img src="\${svgDataUrl}" alt="Generated image" class="max-w-full h-auto rounded-lg shadow-lg" style="max-height: 400px;">\`;
                } else {
                    // Handle other image formats (PNG, etc.)
                    const blob = await response.blob();
                    currentImageBlob = blob;
                    
                    // Display image
                    const imageUrl = URL.createObjectURL(blob);
                    const previewArea = document.getElementById('previewArea');
                    previewArea.innerHTML = \`<img src="\${imageUrl}" alt="Generated image" class="max-w-full h-auto rounded-lg shadow-lg">\`;
                }
                
                // Show download button
                document.getElementById('downloadSection').classList.remove('hidden');
                
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to generate image. Please try again.');
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate Image';
            }
        });

        // SVG Download functionality
        document.getElementById('downloadSvgBtn').addEventListener('click', () => {
            if (currentImageBlob) {
                const url = URL.createObjectURL(currentImageBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`slidesnap-\${Date.now()}.svg\`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });

        // PNG Download functionality (convert SVG to PNG)
        document.getElementById('downloadPngBtn').addEventListener('click', async () => {
            if (currentImageBlob && currentImageBlob.type === 'image/svg+xml') {
                try {
                    // Convert SVG to PNG using Canvas
                    const svgText = await currentImageBlob.text();
                    
                    // Create a new blob with proper SVG namespace
                    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    
                    // Create an image element to load the SVG
                    const img = new Image();
                    img.onload = () => {
                        // Create canvas with same dimensions as SVG
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width || 1080;
                        canvas.height = img.height || 1080;
                        
                        // Set white background
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Draw the SVG image onto canvas
                        ctx.drawImage(img, 0, 0);
                        
                        // Convert canvas to PNG blob and download
                        canvas.toBlob((pngBlob) => {
                            const pngUrl = URL.createObjectURL(pngBlob);
                            const a = document.createElement('a');
                            a.href = pngUrl;
                            a.download = \`slidesnap-\${Date.now()}.png\`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(pngUrl);
                            URL.revokeObjectURL(svgUrl);
                        }, 'image/png');
                    };
                    
                    img.onerror = () => {
                        alert('Failed to convert SVG to PNG. Please try downloading as SVG instead.');
                        URL.revokeObjectURL(svgUrl);
                    };
                    
                    img.src = svgUrl;
                } catch (error) {
                    console.error('PNG conversion failed:', error);
                    alert('Failed to convert to PNG. Please try downloading as SVG instead.');
                }
            }
        });
    </script>
</body>
</html>`);
});

export default app;