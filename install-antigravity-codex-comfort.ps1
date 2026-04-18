[CmdletBinding()]
param(
    [string]$ExtensionRoot,
    [string]$ExtensionsBasePath = "C:\Users\user\.antigravity\extensions",
    [string]$CssSourcePath,
    [string]$JsSourcePath,
    [switch]$Uninstall,
    [switch]$Status
)

$ErrorActionPreference = "Stop"

function Get-ScriptDirectory {
    if ($PSScriptRoot) {
        return $PSScriptRoot
    }

    if ($MyInvocation.MyCommand.Path) {
        return (Split-Path -Parent $MyInvocation.MyCommand.Path)
    }

    return (Get-Location).Path
}

function Resolve-LatestExtensionRoot {
    param(
        [Parameter(Mandatory)]
        [string]$BasePath
    )

    if (-not (Test-Path -LiteralPath $BasePath)) {
        throw "Extensions base path not found: $BasePath"
    }

    $candidates = foreach ($dir in (Get-ChildItem -LiteralPath $BasePath -Directory -Filter "openai.chatgpt-*")) {
        if ($dir.Name -match '^openai\.chatgpt-(?<version>\d+(?:\.\d+)+)') {
            try {
                [pscustomobject]@{
                    FullName = $dir.FullName
                    Version = [version]$Matches["version"]
                    LastWriteTime = $dir.LastWriteTime
                }
            } catch {
            }
        }
    }

    if (-not $candidates) {
        throw "No openai.chatgpt-* extensions found under $BasePath"
    }

    return ((($candidates | Sort-Object Version, LastWriteTime -Descending | Select-Object -First 1).FullName) + "\webview")
}

function Assert-PathExists {
    param(
        [Parameter(Mandatory)]
        [string]$Path,
        [Parameter(Mandatory)]
        [string]$Label
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Label not found: $Path"
    }
}

$scriptDir = Get-ScriptDirectory

if (-not $ExtensionRoot) {
    $ExtensionRoot = Resolve-LatestExtensionRoot -BasePath $ExtensionsBasePath
}

if (-not $CssSourcePath) {
    $CssSourcePath = Join-Path $scriptDir "antigravity-codex-comfort.css"
}

if (-not $JsSourcePath) {
    $JsSourcePath = Join-Path $scriptDir "antigravity-codex-comfort.js"
}

$assetsDir = Join-Path $ExtensionRoot "assets"
$indexPath = Join-Path $ExtensionRoot "index.html"

$cssTargetName = "antigravity-codex-comfort.css"
$jsTargetName = "antigravity-codex-comfort.js"
$cssTargetPath = Join-Path $assetsDir $cssTargetName
$jsTargetPath = Join-Path $assetsDir $jsTargetName

$indexBackupPath = "$indexPath.bak"
$cssBackupPath = "$cssTargetPath.bak"
$jsBackupPath = "$jsTargetPath.bak"

$styleStartMarker = "<!-- antigravity-codex-comfort:style:start -->"
$styleEndMarker = "<!-- antigravity-codex-comfort:style:end -->"
$scriptStartMarker = "<!-- antigravity-codex-comfort:script:start -->"
$scriptEndMarker = "<!-- antigravity-codex-comfort:script:end -->"
$legacyStartMarker = "<!-- antigravity-codex-comfort:start -->"
$legacyEndMarker = "<!-- antigravity-codex-comfort:end -->"

$styleBlock = @"
$styleStartMarker
    <link rel="stylesheet" crossorigin href="./assets/$cssTargetName">
    $styleEndMarker
"@

$scriptBlock = @"
$scriptStartMarker
    <script defer src="./assets/$jsTargetName"></script>
    $scriptEndMarker
"@

function Remove-InjectedBlock {
    param(
        [Parameter(Mandatory)]
        [string]$Html,
        [Parameter(Mandatory)]
        [string]$StartMarker,
        [Parameter(Mandatory)]
        [string]$EndMarker
    )

    $pattern = [regex]::Escape($StartMarker) + ".*?" + [regex]::Escape($EndMarker) + "\r?\n?"
    return [regex]::Replace($Html, $pattern, "", [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

function Get-InstallState {
    $indexInstalled = $false
    $cssInstalled = Test-Path -LiteralPath $cssTargetPath
    $jsInstalled = Test-Path -LiteralPath $jsTargetPath

    if (Test-Path -LiteralPath $indexPath) {
        $html = Get-Content -LiteralPath $indexPath -Raw
        $indexInstalled = $html.Contains($styleStartMarker) -and $html.Contains($scriptStartMarker)
    }

    [pscustomobject]@{
        IndexInstalled = $indexInstalled
        CssInstalled = $cssInstalled
        JsInstalled = $jsInstalled
        ExtensionRoot = $ExtensionRoot
        IndexPath = $indexPath
        CssTargetPath = $cssTargetPath
        JsTargetPath = $jsTargetPath
    }
}

function Remove-AllInjectedBlocks {
    param(
        [Parameter(Mandatory)]
        [string]$Html
    )

    $updated = Remove-InjectedBlock -Html $Html -StartMarker $legacyStartMarker -EndMarker $legacyEndMarker
    $updated = Remove-InjectedBlock -Html $updated -StartMarker $styleStartMarker -EndMarker $styleEndMarker
    $updated = Remove-InjectedBlock -Html $updated -StartMarker $scriptStartMarker -EndMarker $scriptEndMarker
    return $updated
}

Assert-PathExists -Path $ExtensionRoot -Label "Extension root"
Assert-PathExists -Path $assetsDir -Label "Assets directory"
Assert-PathExists -Path $indexPath -Label "index.html"

if ($Status) {
    Get-InstallState | Format-List
    return
}

if ($Uninstall) {
    $html = Get-Content -LiteralPath $indexPath -Raw

    if ($html.Contains($styleStartMarker) -or $html.Contains($scriptStartMarker)) {
        if (Test-Path -LiteralPath $indexBackupPath) {
            Copy-Item -LiteralPath $indexBackupPath -Destination $indexPath -Force
        } else {
            $cleanHtml = Remove-AllInjectedBlocks -Html $html
            Set-Content -LiteralPath $indexPath -Value $cleanHtml -Encoding UTF8
        }
    }

    if (Test-Path -LiteralPath $cssTargetPath) {
        Remove-Item -LiteralPath $cssTargetPath -Force
    }

    if (Test-Path -LiteralPath $jsTargetPath) {
        Remove-Item -LiteralPath $jsTargetPath -Force
    }

    Write-Host "Comfort override removed from $ExtensionRoot"
    return
}

Assert-PathExists -Path $CssSourcePath -Label "CSS source"
Assert-PathExists -Path $JsSourcePath -Label "JS source"

$currentHtml = Get-Content -LiteralPath $indexPath -Raw

if (-not (Test-Path -LiteralPath $indexBackupPath)) {
    Copy-Item -LiteralPath $indexPath -Destination $indexBackupPath -Force
}

$newHtml = Remove-AllInjectedBlocks -Html $currentHtml
$injectedBlock = "    $styleBlock`r`n    $scriptBlock`r`n"
$newHtml = $newHtml -replace "</head>", "$injectedBlock  </head>"

if ($newHtml -eq $currentHtml -and -not ($currentHtml.Contains($styleStartMarker) -or $currentHtml.Contains($scriptStartMarker))) {
    throw "Could not inject comfort assets into index.html"
}

Set-Content -LiteralPath $indexPath -Value $newHtml -Encoding UTF8

if ((Test-Path -LiteralPath $cssTargetPath) -and -not (Test-Path -LiteralPath $cssBackupPath)) {
    Copy-Item -LiteralPath $cssTargetPath -Destination $cssBackupPath -Force
}

if ((Test-Path -LiteralPath $jsTargetPath) -and -not (Test-Path -LiteralPath $jsBackupPath)) {
    Copy-Item -LiteralPath $jsTargetPath -Destination $jsBackupPath -Force
}

Copy-Item -LiteralPath $CssSourcePath -Destination $cssTargetPath -Force
Copy-Item -LiteralPath $JsSourcePath -Destination $jsTargetPath -Force

Write-Host "Comfort override installed to $ExtensionRoot"
