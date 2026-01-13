$jsonPath = "data/quotes.json"
$json = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

$sad = @("🥀", "🖤", "🌧️", "💔", "🌑", "🕯️")
$healing = @("❤️‍🩹", "🌱", "🦋", "✨", "🩹", "🫂")
$night = @("🌙", "🌌", "🦉", "🔭", "🌫️", "💭")
$motivation = @("💪", "🔥", "🌟", "🚀", "🏆", "⚡")
$love = @("❤️", "💖", "💌", "💞", "💘", "💝")
$humor = @("😂", "🤣", "😹", "😆", "😎", "🤡")

foreach ($q in $json) {
    $cat = $q.category.ToLower()
    switch ($cat) {
        "sad" { $emoji = $sad | Get-Random }
        "healing" { $emoji = $healing | Get-Random }
        "late night" { $emoji = $night | Get-Random }
        "motivation" { $emoji = $motivation | Get-Random }
        "love" { $emoji = $love | Get-Random }
        "humor" { $emoji = $humor | Get-Random }
        default { $emoji = $sad | Get-Random }
    }

    $alreadyHas = $false
    foreach ($e in ($sad + $healing + $night + $motivation + $love + $humor)) {
        if ($q.text.EndsWith(" " + $e)) { $alreadyHas = $true; break }
    }

    if (-not $alreadyHas) { $q.text = "$($q.text) $emoji" }
}

$json | ConvertTo-Json -Depth 10 | Set-Content $jsonPath -Encoding UTF8
Write-Host "Updated quotes successfully."
