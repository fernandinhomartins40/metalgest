param(
  [Parameter(Mandatory = $true)]
  [string]$Method,

  [Parameter(Mandatory = $false)]
  [string]$ParamsJson = '{}',

  [Parameter(Mandatory = $false)]
  [string]$Tool,

  [Parameter(Mandatory = $false)]
  [string]$ArgumentsJson = '{}'
)

$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot '..\vscode-mcp.json'
$envFiles = @(
  (Join-Path $PSScriptRoot '..\.env.mcp.local'),
  (Join-Path $PSScriptRoot '..\.env.local'),
  (Join-Path $PSScriptRoot '..\.env')
)

function Import-DotEnvFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path $Path)) {
    return
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()

    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) {
      return
    }

    $separatorIndex = $line.IndexOf('=')
    if ($separatorIndex -lt 1) {
      return
    }

    $name = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim()

    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if (-not [string]::IsNullOrWhiteSpace($name) -and -not [Environment]::GetEnvironmentVariable($name)) {
      [Environment]::SetEnvironmentVariable($name, $value)
    }
  }
}

function Resolve-EnvPlaceholder {
  param(
    [AllowNull()]
    [string]$Value
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $Value
  }

  if ($Value -match '^\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}$') {
    $envName = $Matches[1]
    $resolvedValue = [Environment]::GetEnvironmentVariable($envName)

    if ([string]::IsNullOrWhiteSpace($resolvedValue)) {
      throw "Environment variable $envName is not set"
    }

    return $resolvedValue
  }

  return $Value
}

$envFiles | ForEach-Object { Import-DotEnvFile -Path $_ }

if (-not (Test-Path $configPath)) {
  throw "MCP config file not found at $configPath"
}

$config = Get-Content $configPath | ConvertFrom-Json
$server = $config.servers.ultrazend

if (-not $server) {
  throw 'UltraZend server config not found in vscode-mcp.json'
}

$apiKey = Resolve-EnvPlaceholder -Value $server.headers.'x-api-key'

if (-not $apiKey) {
  throw 'UltraZend x-api-key is missing in vscode-mcp.json'
}

$params =
  if ($Tool) {
    [pscustomobject]@{
      name = $Tool
      arguments = $ArgumentsJson | ConvertFrom-Json
    }
  } else {
    $ParamsJson | ConvertFrom-Json
  }
$headers = @{
  'x-api-key' = $apiKey
  'Content-Type' = 'application/json'
  'Accept' = 'application/json, text/event-stream'
}

$body = @{
  jsonrpc = '2.0'
  id = [guid]::NewGuid().ToString()
  method = $Method
  params = $params
} | ConvertTo-Json -Depth 10

try {
  $response = Invoke-WebRequest -UseBasicParsing -Uri $server.url -Method Post -Headers $headers -Body $body
  Write-Output $response.Content
} catch {
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $content = $reader.ReadToEnd()
    Write-Output $content
    exit 1
  }

  throw
}
