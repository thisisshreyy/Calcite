Add-Type -AssemblyName System.Drawing
$srcPath = (Resolve-Path "public/Calcite-logo.png").Path
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$sizes = @{
  "mipmap-mdpi" = 48
  "mipmap-hdpi" = 72
  "mipmap-xhdpi" = 96
  "mipmap-xxhdpi" = 144
  "mipmap-xxxhdpi" = 192
}

foreach ($folder in $sizes.Keys) {
  $size = $sizes[$folder]
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($src, 0, 0, $size, $size)
  $g.Dispose()

  $dir = Join-Path "android/app/src/main/res" $folder
  $targetSquare = Join-Path $dir "ic_launcher.png"
  $targetRound = Join-Path $dir "ic_launcher_round.png"
  $targetForeground = Join-Path $dir "ic_launcher_foreground.png"

  $bmp.Save($targetSquare, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Save($targetRound, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Save($targetForeground, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "Generated $folder icons at ${size}x${size}"
}

$src.Dispose()
Write-Host "Icon generation completed successfully."
