# PowerShell script to convert SVG to ICO and PNG formats
# This script will attempt to use available Windows tools or provide instructions

Write-Host "Schedulez Favicon Generator" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

$iconsPath = Get-Location
Write-Host "Working directory: $iconsPath" -ForegroundColor White

# Check if Inkscape is available (common SVG to PNG converter)
$hasInkscape = $false
$inkscapeCmd = ""
try {
    $inkscapeCmd = (Get-Command inkscape -ErrorAction Stop).Source
    $hasInkscape = $true
    Write-Host "Inkscape found - will use for conversion" -ForegroundColor Green
} catch {
    Write-Host "Inkscape not found" -ForegroundColor Yellow
}

# Check if ImageMagick is available
$hasImageMagick = $false
try {
    $null = Get-Command magick -ErrorAction Stop
    $hasImageMagick = $true
    Write-Host "ImageMagick found - will use for conversion" -ForegroundColor Green
} catch {
    Write-Host "ImageMagick not found" -ForegroundColor Yellow
}

Write-Host ""

# SVG to PNG conversions
$svgFiles = @{
    "favicon-16" = 16
    "favicon-32" = 32
    "apple-touch-icon" = 180
}

foreach ($file in $svgFiles.GetEnumerator()) {
    $svgPath = Join-Path $iconsPath "$($file.Key).svg"
    $pngPath = Join-Path $iconsPath "$($file.Key).png"
    if (Test-Path $svgPath) {
        $size = $file.Value
        Write-Host "Processing $($file.Key)..." -ForegroundColor White
        if ($hasInkscape) {
            # Use Inkscape for high-quality conversion
            $arguments = @(
                "--export-type=png"
                "--export-width=$size"
                "--export-height=$size"
                "--export-filename=$pngPath"
                $svgPath
            )
            & $inkscapeCmd $arguments
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Created PNG with Inkscape" -ForegroundColor Green
            } else {
                Write-Host "  Failed to create PNG with Inkscape" -ForegroundColor Red
            }
        }
        elseif ($hasImageMagick) {
            # Use ImageMagick as fallback
            $arguments = @($svgPath, "-resize", "${size}x${size}", $pngPath)
            & magick $arguments
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Created PNG with ImageMagick" -ForegroundColor Green
            } else {
                Write-Host "  Failed to create PNG with ImageMagick" -ForegroundColor Red
            }
        }
        else {
            Write-Host "  Cannot convert - no conversion tool available" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  SVG file not found: $svgPath" -ForegroundColor Red
    }
}

# Create ICO file from 16x16 PNG if we have a conversion tool
$png16 = Join-Path $iconsPath "favicon-16.png"
$icoFile = Join-Path $iconsPath "favicon.ico"

if ((Test-Path $png16) -and $hasImageMagick) {
    Write-Host ""
    Write-Host "Creating favicon.ico from PNG" -ForegroundColor White
    $arguments = @($png16, $icoFile)
    & magick $arguments
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Created favicon.ico" -ForegroundColor Green
    } else {
        Write-Host "  Failed to create favicon.ico" -ForegroundColor Red
    }
}

# Update the old favicon-16.ico if we created a new ICO
$oldIco = Join-Path $iconsPath "favicon-16.ico"
if ((Test-Path $icoFile) -and (Test-Path $oldIco)) {
    Copy-Item $icoFile $oldIco -Force
    Write-Host "  Updated favicon-16.ico" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installation Instructions:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

if (-not $hasInkscape -and -not $hasImageMagick) {
    Write-Host ""
    Write-Host "No SVG conversion tools found. Please install one of:" -ForegroundColor Yellow
    Write-Host "   • Inkscape: https://inkscape.org/release/" -ForegroundColor White
    Write-Host "   • ImageMagick: https://imagemagick.org/script/download.php#windows" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use an online converter:" -ForegroundColor White
    Write-Host "   • https://convertio.co/svg-png/" -ForegroundColor White
    Write-Host "   • https://cloudconvert.com/svg-to-png" -ForegroundColor White
    Write-Host ""
    Write-Host "Convert these files manually:" -ForegroundColor White
    Write-Host "   • favicon-16.svg -> favicon-16.png (16x16)" -ForegroundColor Gray
    Write-Host "   • favicon-32.svg -> favicon-32.png (32x32)" -ForegroundColor Gray
    Write-Host "   • apple-touch-icon.svg -> apple-touch-icon.png (180x180)" -ForegroundColor Gray
    Write-Host "   • favicon-16.png -> favicon.ico (16x16)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update index.html with new favicon references" -ForegroundColor White
Write-Host "2. Update manifest.json with new icon paths" -ForegroundColor White
Write-Host "3. Test favicons in different browsers" -ForegroundColor White

Write-Host ""
Write-Host "Favicon generation complete!" -ForegroundColor Green
