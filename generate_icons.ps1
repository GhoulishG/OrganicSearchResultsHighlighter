Add-Type -AssemblyName System.Drawing

# Create icons directory if it doesn't exist
$iconsDir = Join-Path $pwd "icons"
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Force -Path $iconsDir
}

function Create-Icon($size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Clear background with transparent
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Draw background gradient circle
    $rect = New-Object System.Drawing.Rectangle(0, 0, ($size - 1), ($size - 1))
    $colorStart = [System.Drawing.Color]::FromArgb(255, 59, 130, 246) # #3b82f6
    $colorEnd = [System.Drawing.Color]::FromArgb(255, 29, 78, 216)   # #1d4ed8
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $colorStart, $colorEnd, 45.0)
    
    $margin = [Math]::Max(1, [Math]::Round($size * 0.06))
    $innerRect = New-Object System.Drawing.Rectangle($margin, $margin, ($size - 2 * $margin), ($size - 2 * $margin))
    $g.FillEllipse($brush, $innerRect)
    
    # Add a thin semi-transparent white ring
    $penColor = [System.Drawing.Color]::FromArgb(120, 255, 255, 255)
    $penWidth = [Math]::Max(1, [Math]::Round($size * 0.04))
    $pen = New-Object System.Drawing.Pen($penColor, $penWidth)
    $g.DrawEllipse($pen, $innerRect)
    
    # Add highlighter slash stroke across the back of the text (pastel blue)
    $highlightColor = [System.Drawing.Color]::FromArgb(140, 208, 225, 253) # #d0e1fd with opacity
    $highlightBrush = New-Object System.Drawing.SolidBrush($highlightColor)
    
    $pt1 = New-Object System.Drawing.PointF(($size * 0.28), ($size * 0.65))
    $pt2 = New-Object System.Drawing.PointF(($size * 0.72), ($size * 0.35))
    $strokePenWidth = [Math]::Max(2, [Math]::Round($size * 0.18))
    $strokePen = New-Object System.Drawing.Pen($highlightBrush, $strokePenWidth)
    $strokePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $strokePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($strokePen, $pt1, $pt2)
    
    # Draw letter 'G' in font
    $fontName = "Arial"
    # Choose bold font weight
    $fontSize = $size * 0.42
    $font = New-Object System.Drawing.Font($fontName, $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    # Shift slightly right and down for perfect optical centering of G
    $textRect = New-Object System.Drawing.RectangleF(($size * 0.02), ($size * 0.02), $size, $size)
    $g.DrawString("G", $font, $textBrush, $textRect, $format)
    
    # Clean up
    $strokePen.Dispose()
    $pen.Dispose()
    $brush.Dispose()
    $highlightBrush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    $format.Dispose()
    $g.Dispose()
    
    # Save to file
    $path = Join-Path $iconsDir "icon$size.png"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created $path"
}

Create-Icon 16
Create-Icon 48
Create-Icon 128
