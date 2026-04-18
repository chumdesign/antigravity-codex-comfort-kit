[CmdletBinding()]
param(
    [switch]$Status,
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"
$installerPath = Join-Path $PSScriptRoot "install-antigravity-codex-comfort.ps1"

if (-not (Test-Path -LiteralPath $installerPath)) {
    throw "Installer not found: $installerPath"
}

$params = @{
    FilePath = $installerPath
}

if ($Status) {
    $params["ArgumentList"] = @("-Status")
}

if ($Uninstall) {
    $params["ArgumentList"] = @("-Uninstall")
}

& powershell -ExecutionPolicy Bypass @params
