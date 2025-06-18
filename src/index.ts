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
                                      class="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"></textarea>
                            
                            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                                    <select id="colorTheme" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="light">Light (White/Black)</option>
                                        <option value="dark">Dark (Black/White)</option>
                                        <option value="blue">Blue Theme</option>
                                        <option value="green">Green Theme</option>
                                        <option value="purple">Purple Theme</option>
                                        <option value="red">Red Theme</option>
                                        <option value="orange">Orange Theme</option>
                                        <option value="custom">Custom Colors</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                                    <input type="range" id="fontSize" min="20" max="100" value="48" class="w-full">
                                    <span id="fontSizeValue" class="text-sm text-gray-600">48px</span>
                                </div>
                            </div>
                            
                            <div id="customColors" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                                    <input type="color" id="bgColor" value="#ffffff" class="w-full h-10 border border-gray-300 rounded-lg">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                                    <input type="color" id="textColor" value="#000000" class="w-full h-10 border border-gray-300 rounded-lg">
                                </div>
                            </div>
                            
                            <p class="text-sm text-gray-500 mt-6 text-center">Generates instantly as you type</p>
                        </form>
                    </div>
                    
                    <!-- Preview Section -->
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-2xl font-semibold mb-4">Preview</h2>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-96 flex items-start justify-center overflow-auto max-h-[600px]">
                            <div id="previewArea">
                                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-gray-500">Your generated image will appear here</p>
                                <p class="text-sm text-gray-400 mt-2">Type some text to generate automatically</p>
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
        let generateTimeout = null;
        
        // Color theme presets
        const colorThemes = {
            light: { bg: '#ffffff', text: '#000000' },
            dark: { bg: '#000000', text: '#ffffff' },
            blue: { bg: '#1e40af', text: '#ffffff' },
            green: { bg: '#059669', text: '#ffffff' },
            purple: { bg: '#7c3aed', text: '#ffffff' },
            red: { bg: '#dc2626', text: '#ffffff' },
            orange: { bg: '#ea580c', text: '#ffffff' },
            custom: { bg: '#ffffff', text: '#000000' }
        };

        // Auto-generate function with instant text generation
        function scheduleGenerateInstant() {
            const text = document.getElementById('textInput').value.trim();
            if (!text) {
                // Clear preview if no text
                const previewArea = document.getElementById('previewArea');
                previewArea.innerHTML = \`
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="text-gray-500">Your generated image will appear here</p>
                    <p class="text-sm text-gray-400 mt-2">Type some text to generate instantly</p>
                \`;
                document.getElementById('downloadSection').classList.add('hidden');
                return;
            }
            
            // Generate immediately
            generateImage();
        }
        
        // Auto-generate function with small debouncing for controls
        function scheduleGenerateDebounced() {
            const text = document.getElementById('textInput').value.trim();
            if (!text) return;
            
            // Clear existing timeout
            if (generateTimeout) {
                clearTimeout(generateTimeout);
            }
            
            // Set new timeout for debounced generation
            generateTimeout = setTimeout(generateImage, 100);
        }

        document.addEventListener('DOMContentLoaded', () => {
            // Set up event listeners for auto-generation
            document.getElementById('textInput').addEventListener('input', scheduleGenerateInstant);
            document.getElementById('fontSize').addEventListener('input', scheduleGenerateDebounced);
            document.getElementById('colorTheme').addEventListener('change', applyColorTheme);
            
            // Set up custom color inputs
            document.getElementById('bgColor').addEventListener('input', scheduleGenerateDebounced);
            document.getElementById('textColor').addEventListener('input', scheduleGenerateDebounced);
            
            // Apply initial color theme
            applyColorTheme();
        });

        // Color theme handling
        function applyColorTheme() {
            const theme = document.getElementById('colorTheme').value;
            const customColorsDiv = document.getElementById('customColors');
            
            if (theme === 'custom') {
                customColorsDiv.classList.remove('hidden');
            } else {
                customColorsDiv.classList.add('hidden');
                const colors = colorThemes[theme];
                document.getElementById('bgColor').value = colors.bg;
                document.getElementById('textColor').value = colors.text;
                scheduleGenerateInstant();
            }
        }

        // Font size slider
        document.getElementById('fontSize').addEventListener('input', (e) => {
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        });

        // Image generation function
        async function generateImage() {
            const text = document.getElementById('textInput').value.trim();
            if (!text) return;
            
            const backgroundColor = document.getElementById('bgColor').value;
            const textColor = document.getElementById('textColor').value;
            const fontSize = parseInt(document.getElementById('fontSize').value);
            
            // Use article template for general purpose
            const templateId = 'article';
            
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
                
                // Handle SVG response
                const svgText = await response.text();
                currentImageBlob = new Blob([svgText], { type: 'image/svg+xml' });
                
                // Create data URL for SVG
                const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
                
                // Display SVG as image with data URL
                const previewArea = document.getElementById('previewArea');
                previewArea.innerHTML = \`<img src="\${svgDataUrl}" alt="Generated image" class="max-w-full h-auto rounded-lg shadow-lg">\`;
                
                // Show download button
                document.getElementById('downloadSection').classList.remove('hidden');
                
            } catch (error) {
                console.error('Error:', error);
                const previewArea = document.getElementById('previewArea');
                previewArea.innerHTML = \`<p class="text-red-500">Error generating image. Please try again.</p>\`;
            }
        }

        // Prevent form submission
        document.getElementById('textForm').addEventListener('submit', (e) => {
            e.preventDefault();
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