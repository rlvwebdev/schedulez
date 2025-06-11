# PowerShell script to convert SVG to ICO and PNG formats
# This script will attempt to use available Windows tools or provide instructions

Write-Host "🎨 Schedulez Favicon Generator" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$iconPath = "c:\Users\rlvas\Schedulez\schedulez\assets\icons"
$svgFiles = @(
    @{Name="favicon-16"; Size=16},
    @{Name="favicon-32"; Size=32},
    @{Name="apple-touch-icon"; Size=180}
)

# Check if Inkscape is available (common SVG to PNG converter)
$inkscapeExists = $false
try {
    $null = Get-Command inkscape -ErrorAction Stop
    $inkscapeExists = $true
    Write-Host "✅ Inkscape found - will use for conversion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Inkscape not found" -ForegroundColor Yellow
}

# Check if ImageMagick is available
$magickExists = $false
try {
    $null = Get-Command magick -ErrorAction Stop
    $magickExists = $true
    Write-Host "✅ ImageMagick found - will use for conversion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ImageMagick not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Processing SVG files in: $iconPath" -ForegroundColor White

foreach ($svg in $svgFiles) {
    $svgFile = Join-Path $iconPath "$($svg.Name).svg"
    $pngFile = Join-Path $iconPath "$($svg.Name).png"
    
    if (Test-Path $svgFile) {
        $sizeText = "$($svg.Size)x$($svg.Size)"
        Write-Host "🔄 Processing $($svg.Name).svg ($sizeText)" -ForegroundColor White
        
        if ($inkscapeExists) {
            # Use Inkscape for high-quality conversion
            $cmd = "inkscape --export-type=png --export-width=$($svg.Size) --export-height=$($svg.Size) --export-filename=""$pngFile"" ""$svgFile"""
            Invoke-Expression $cmd
            Write-Host "  ✅ Created PNG with Inkscape" -ForegroundColor Green
        }
        elseif ($magickExists) {
            # Use ImageMagick as fallback
            $cmd = "magick ""$svgFile"" -resize $($svg.Size)x$($svg.Size) ""$pngFile"""
            Invoke-Expression $cmd
            Write-Host "  ✅ Created PNG with ImageMagick" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠️  Cannot convert - no conversion tool available" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ SVG file not found: $svgFile" -ForegroundColor Red
    }
}

# Create ICO file from 16x16 PNG if we have a conversion tool
$png16 = Join-Path $iconPath "favicon-16.png"
$icoFile = Join-Path $iconPath "favicon.ico"

if ((Test-Path $png16) -and $magickExists) {
    Write-Host ""
    Write-Host "🔄 Creating favicon.ico from PNG" -ForegroundColor White
    $cmd = "magick `"$png16`" `"$icoFile`""
    Invoke-Expression $cmd
    Write-Host "  ✅ Created favicon.ico" -ForegroundColor Green
}

# Update the old favicon-16.ico if we created a new ICO
$oldIco = Join-Path $iconPath "favicon-16.ico"
if ((Test-Path $icoFile) -and (Test-Path $oldIco)) {
    Copy-Item $icoFile $oldIco -Force
    Write-Host "  ✅ Updated favicon-16.ico" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Installation Instructions:" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

if (-not $inkscapeExists -and -not $magickExists) {
    Write-Host ""
    Write-Host "⚠️  No SVG conversion tools found. Please install one of:" -ForegroundColor Yellow
    Write-Host "   • Inkscape: https://inkscape.org/release/" -ForegroundColor White
    Write-Host "   • ImageMagick: https://imagemagick.org/script/download.php#windows" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use an online converter:" -ForegroundColor White
    Write-Host "   • https://convertio.co/svg-png/" -ForegroundColor White
    Write-Host "   • https://cloudconvert.com/svg-to-png" -ForegroundColor White
    Write-Host ""
    Write-Host "Convert these files manually:" -ForegroundColor White
    Write-Host "   • favicon-16.svg → favicon-16.png (16x16)" -ForegroundColor Gray
    Write-Host "   • favicon-32.svg → favicon-32.png (32x32)" -ForegroundColor Gray
    Write-Host "   • apple-touch-icon.svg → apple-touch-icon.png (180x180)" -ForegroundColor Gray
    Write-Host "   • favicon-16.png → favicon.ico (16x16)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✨ Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update index.html with new favicon references" -ForegroundColor White
Write-Host "2. Update manifest.json with new icon paths" -ForegroundColor White
Write-Host "3. Test favicons in different browsers" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Favicon generation complete!" -ForegroundColor Green
