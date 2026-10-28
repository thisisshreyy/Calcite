Add-Type -AssemblyName System.Drawing
$srcPath = (Resolve-Path "public/Calcite-logo.png").Path
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#0B0812"))

$densities = @{
  "mipmap-mdpi"    = @{ icon = 48;  foreground = 108 }
  "mipmap-hdpi"    = @{ icon = 72;  foreground = 162 }
  "mipmap-xhdpi"   = @{ icon = 96;  foreground = 216 }
  "mipmap-xxhdpi"  = @{ icon = 144; foreground = 324 }
  "mipmap-xxxhdpi" = @{ icon = 192; foreground = 432 }
}

foreach ($folder in $densities.Keys) {
  $info = $densities[$folder]
  $iconSize = $info.icon
  $fgSize = $info.foreground
  $dir = Join-Path "android/app/src/main/res" $folder

  # 1. Generate Legacy Square & Round Icon (with dark background)
  $bmpIcon = New-Object System.Drawing.Bitmap $iconSize, $iconSize
  $gIcon = [System.Drawing.Graphics]::FromImage($bmpIcon)
  $gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gIcon.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gIcon.FillRectangle($bgBrush, 0, 0, $iconSize, $iconSize)
  $pad = [int]($iconSize * 0.10)
  $inner = $iconSize - (2 * $pad)
  $gIcon.DrawImage($src, $pad, $pad, $inner, $inner)
  $gIcon.Dispose()

  $bmpIcon.Save((Join-Path $dir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmpIcon.Save((Join-Path $dir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmpIcon.Dispose()

  # 2. Generate Adaptive Foreground Icon (transparent, padded inside Android 108dp safe zone)
  $bmpFg = New-Object System.Drawing.Bitmap $fgSize, $fgSize
  $gFg = [System.Drawing.Graphics]::FromImage($bmpFg)
  $gFg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gFg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $fgPad = [int]($fgSize * 0.18)
  $fgInner = $fgSize - (2 * $fgPad)
  $gFg.DrawImage($src, $fgPad, $fgPad, $fgInner, $fgInner)
  $gFg.Dispose()

  $bmpFg.Save((Join-Path $dir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmpFg.Dispose()

  Write-Host "Generated $folder icons (Icon: ${iconSize}x${iconSize}, Foreground: ${fgSize}x${fgSize})"
}

$bgBrush.Dispose()
$src.Dispose()
Write-Host "Native Android icons generated successfully!"
