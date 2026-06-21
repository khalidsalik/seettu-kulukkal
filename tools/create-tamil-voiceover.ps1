$ErrorActionPreference = "Stop"

$base = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$scriptPath = Join-Path $base "demo\tamil-voiceover-script.txt"
$outputPath = Join-Path $base "demo\tamil-voiceover.wav"
$text = Get-Content -LiteralPath $scriptPath -Raw -Encoding UTF8

Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime] | Out-Null

function Await-WinRtOperation {
  param($Operation, [Type]$ResultType)
  $methodDefinition = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and
    $_.IsGenericMethodDefinition -and
    $_.GetParameters().Count -eq 1 -and
    $_.ReturnType.Name -eq 'Task`1' -and
    $_.GetGenericArguments().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  } | Select-Object -First 1
  $method = $methodDefinition.MakeGenericMethod($ResultType)
  $task = $method.Invoke($null, @($Operation))
  $task.Wait()
  return $task.Result
}

$synth = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::new()
$voice = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.Language -eq "ta-IN" } | Select-Object -First 1
if (-not $voice) {
  throw "Tamil ta-IN voice was not found."
}

$synth.Voice = $voice
$escapedText = [System.Security.SecurityElement]::Escape(($text -replace "\s+", " ").Trim())
$ssml = "<speak version='1.0' xml:lang='ta-IN'><voice xml:lang='ta-IN'><prosody rate='+25%'>$escapedText</prosody></voice></speak>"
$stream = Await-WinRtOperation $synth.SynthesizeSsmlToStreamAsync($ssml) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
$input = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)
$output = [System.IO.File]::Create($outputPath)
try {
  $input.CopyTo($output)
} finally {
  $output.Dispose()
  $input.Dispose()
  $stream.Dispose()
  $synth.Dispose()
}

Write-Output $outputPath
