$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
  $nodeExecutable = $nodeCommand.Source
} else {
  $runtimeRoot = Join-Path $env:LOCALAPPDATA 'OpenAI/Codex/runtimes/cua_node'
  $nodeExecutable = Get-ChildItem -LiteralPath $runtimeRoot -Filter node.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}
if (!$nodeExecutable) { throw 'Node.js is unavailable. Open index.html directly or use VS Code Live Server.' }
& $nodeExecutable (Join-Path $PSScriptRoot 'serve-local.cjs')
