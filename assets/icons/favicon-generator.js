// Simple SVG to PNG converter using Canvas API
// Run this in a browser console on any page that loads the SVG files

function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

function convertSVGToPNG(svgPath, size, filename) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = size;
            canvas.height = size;
            
            // Fill with white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, size, size);
            
            // Draw the SVG
            ctx.drawImage(img, 0, 0, size, size);
            
            const dataUrl = canvas.toDataURL('image/png');
            downloadDataUrl(dataUrl, filename);
            resolve(dataUrl);
        };
        
        img.onerror = reject;
        
        // Load the SVG
        fetch(svgPath)
            .then(response => response.text())
            .then(svgText => {
                const blob = new Blob([svgText], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(blob);
                img.src = url;
            })
            .catch(reject);
    });
}

// Convert the required favicon files
async function generateFavicons() {
    console.log('Starting favicon generation...');
    
    try {
        // Generate 16x16 favicon
        await convertSVGToPNG('assets/icons/favicon-16.svg', 16, 'favicon-16.png');
        console.log('✅ Generated favicon-16.png');
        
        // Generate 32x32 favicon  
        await convertSVGToPNG('assets/icons/favicon-32.svg', 32, 'favicon-32.png');
        console.log('✅ Generated favicon-32.png');
        
        // Generate 180x180 Apple touch icon
        await convertSVGToPNG('assets/icons/apple-touch-icon.svg', 180, 'apple-touch-icon.png');
        console.log('✅ Generated apple-touch-icon.png');
        
        console.log('🎉 All favicons generated! Upload them to assets/icons/ folder');
        
    } catch (error) {
        console.error('❌ Error generating favicons:', error);
    }
}

// Instructions
console.log(`
🔧 Favicon Generator Instructions:
1. Open your site: http://localhost:8080
2. Paste this entire script into browser console
3. Run: generateFavicons()
4. Download the generated PNG files
5. Upload them to assets/icons/ folder
6. Rename favicon-16.png to favicon.ico
`);

// Auto-run if you want
// generateFavicons();
