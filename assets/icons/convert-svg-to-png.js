#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertSvgToPng() {
  console.log('🎨 Converting SVG favicons to PNG...\n');
  
  const conversions = [
    { input: 'favicon-16.svg', output: 'favicon-16.png', size: 16 },
    { input: 'favicon-32.svg', output: 'favicon-32.png', size: 32 },
    { input: 'apple-touch-icon.svg', output: 'apple-touch-icon.png', size: 180 }
  ];

  for (const conversion of conversions) {
    try {
      const inputPath = path.join(__dirname, conversion.input);
      const outputPath = path.join(__dirname, conversion.output);
      
      if (!fs.existsSync(inputPath)) {
        console.log(`❌ Source file not found: ${conversion.input}`);
        continue;
      }

      // Convert SVG to PNG using Sharp
      await sharp(inputPath)
        .resize(conversion.size, conversion.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: ${conversion.output} (${conversion.size}x${conversion.size})`);
    } catch (error) {
      console.error(`❌ Failed to convert ${conversion.input}:`, error.message);
    }
  }

  // Create favicon.ico from favicon-16.png
  try {
    const favicon16Path = path.join(__dirname, 'favicon-16.png');
    const faviconIcoPath = path.join(__dirname, 'favicon.ico');
    
    if (fs.existsSync(favicon16Path)) {
      // Sharp can output ICO format
      await sharp(favicon16Path)
        .resize(16, 16)
        .png()
        .toFile(faviconIcoPath.replace('.ico', '-temp.png'));
      
      // Copy the 16px PNG as ICO (browsers accept PNG in ICO containers)
      fs.copyFileSync(favicon16Path, faviconIcoPath);
      
      console.log('✅ Generated: favicon.ico');
    }
  } catch (error) {
    console.error('❌ Failed to create favicon.ico:', error.message);
  }

  console.log('\n🚀 Favicon conversion complete!');
  console.log('\nNext steps:');
  console.log('1. Verify generated PNG files in assets/icons/');
  console.log('2. Test favicons in different browsers');
  console.log('3. Run npm run check-status to verify');
}

convertSvgToPng().catch(console.error);
