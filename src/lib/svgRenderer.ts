import { SocialTemplate } from './templates';

// Estimate text width for better Chinese character support
function getTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) {
    // Chinese characters are typically wider than English characters
    if (/[\u4e00-\u9fff]/.test(char)) {
      width += fontSize * 1.0; // Full width for Chinese characters
    } else {
      width += fontSize * 0.6; // Standard width for English characters
    }
  }
  return width;
}

export interface SVGRenderOptions {
  text: string;
  template: SocialTemplate;
  customBackgroundColor?: string;
  customTextColor?: string;
  customFontSize?: number;
}

export class SVGRenderer {
  static createImageFromText(options: SVGRenderOptions): string {
    const { text, template, customBackgroundColor, customTextColor, customFontSize } = options;
    
    const width = template.width;
    let height = template.height;
    const backgroundColor = customBackgroundColor || template.backgroundColor;
    const textColor = customTextColor || template.textColor;
    const fontSize = customFontSize || template.fontSize;
    const padding = template.padding;
    
    // Calculate text area
    const textAreaWidth = width - (padding * 2);
    let textAreaHeight = height - (padding * 2);
    
    // Improved text wrapping with Chinese character support and paragraph breaks
    const lines: string[] = [];
    
    // Split text by paragraphs first (handle \n)
    const paragraphs = text.split('\n');
    
    // Detect if text contains Chinese characters
    const hasChinese = /[\u4e00-\u9fff]/.test(text);
    
    // Different character width estimation for Chinese vs English
    const avgCharWidth = hasChinese ? fontSize * 1.0 : fontSize * 0.7;
    const maxCharsPerLine = Math.floor(textAreaWidth / avgCharWidth);
    
    // Process each paragraph
    for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex++) {
      const paragraph = paragraphs[paragraphIndex].trim();
      
      // Add smaller gap for paragraph breaks (except for first paragraph)
      if (paragraphIndex > 0) {
        lines.push(''); // Empty line for paragraph spacing
      }
      
      // Skip empty paragraphs
      if (!paragraph) {
        continue;
      }
      
      let currentLine = '';
      
      if (hasChinese) {
        // For Chinese text: break by character, not by words
        for (let i = 0; i < paragraph.length; i++) {
          const char = paragraph[i];
          const testLine = currentLine + char;
          
          // Check if adding this character would exceed the line width
          if (getTextWidth(testLine, fontSize) <= textAreaWidth || currentLine === '') {
            currentLine = testLine;
          } else {
            // Character doesn't fit, start new line
            lines.push(currentLine);
            currentLine = char;
          }
        }
      } else {
        // For English text: break by words
        const words = paragraph.split(' ');
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          
          // Check if adding this word would exceed the line width
          if (testLine.length <= maxCharsPerLine || currentLine === '') {
            currentLine = testLine;
          } else {
            // Word doesn't fit, start new line
            lines.push(currentLine);
            currentLine = word;
            
            // If single word is too long, break it
            if (word.length > maxCharsPerLine) {
              while (currentLine.length > maxCharsPerLine) {
                lines.push(currentLine.substring(0, maxCharsPerLine - 1) + '-');
                currentLine = currentLine.substring(maxCharsPerLine - 1);
              }
            }
          }
        }
      }
      
      // Add the last line of the paragraph if it exists
      if (currentLine) {
        lines.push(currentLine);
      }
    }
    
    // Calculate dynamic height if enabled
    if (template.dynamicHeight) {
      const lineHeight = fontSize * template.lineHeight;
      
      // Calculate height with reduced paragraph spacing
      let requiredTextHeight = 0;
      lines.forEach(line => {
        if (line === '') {
          // Empty line: half line height for paragraph spacing
          requiredTextHeight += lineHeight * 0.5;
        } else {
          // Regular line: full line height
          requiredTextHeight += lineHeight;
        }
      });
      
      const requiredTotalHeight = requiredTextHeight + (padding * 2);
      
      // Apply min/max height constraints
      const minHeight = template.minHeight || template.height;
      const maxHeight = template.maxHeight || template.height * 3;
      
      height = Math.max(minHeight, Math.min(maxHeight, requiredTotalHeight));
      textAreaHeight = height - (padding * 2);
    }
    
    // For dynamic height templates, show ALL lines. For fixed templates, limit lines.
    let displayLines: string[];
    
    if (template.dynamicHeight) {
      // Dynamic height: show all lines, no truncation
      displayLines = lines;
    } else {
      // Fixed height: limit lines and add ellipsis if needed
      const maxLines = template.maxLines || Math.floor(textAreaHeight / (fontSize * template.lineHeight));
      displayLines = lines.slice(0, maxLines);
      
      // Add ellipsis if text was truncated
      if (lines.length > maxLines && displayLines.length > 0) {
        const lastLineIndex = displayLines.length - 1;
        const lastLine = displayLines[lastLineIndex];
        
        // If last line is too long with ellipsis, truncate it
        if (lastLine.length + 3 > maxCharsPerLine) {
          displayLines[lastLineIndex] = lastLine.substring(0, maxCharsPerLine - 4) + '...';
        } else {
          displayLines[lastLineIndex] = lastLine + '...';
        }
      }
    }
    
    // Calculate vertical positioning (top-aligned for dynamic height, centered for fixed)
    const totalTextHeight = displayLines.length * fontSize * template.lineHeight;
    const startY = template.dynamicHeight 
      ? padding + fontSize  // Top-aligned for articles
      : padding + (textAreaHeight - totalTextHeight) / 2 + fontSize; // Centered for posts
    
    // Generate SVG with reduced paragraph spacing
    const svgLines: string[] = [];
    let currentY = startY;
    
    displayLines.forEach((line) => {
      if (line === '') {
        // Empty line for paragraph spacing - use smaller gap (half line height)
        currentY += (fontSize * template.lineHeight) * 0.5;
        svgLines.push(`    <!-- Paragraph spacing -->`);
      } else {
        // Regular text line
        svgLines.push(`    <text x="${padding}" y="${currentY}" fill="${textColor}" font-family="${template.fontFamily}" font-size="${fontSize}px">${escapeXml(line)}</text>`);
        currentY += fontSize * template.lineHeight;
      }
    });
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <g>
${svgLines.join('\n')}
  </g>
</svg>`;
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}