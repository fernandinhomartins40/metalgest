$ErrorActionPreference = 'Stop'

$scriptPath = Join-Path $PSScriptRoot 'ultrazend-mcp-inspect.ps1'
$tools = @(
  'account_overview',
  'workspace_context',
  'domains_list',
  'webhooks_list',
  'settings_get'
)

$result = [ordered]@{}

foreach ($tool in $tools) {
  $output = & powershell -NoProfile -File $scriptPath -Method 'tools/call' -Tool $tool
  $result[$tool] = $output
}

$result | ConvertTo-Json -Depth 10
