# Vai para a raiz do projeto
Set-Location "C:\supabase-app"

# Apaga next.config.mjs e next.config.cjs
Remove-Item -Force next.config.mjs,next.config.cjs -ErrorAction SilentlyContinue

# Apaga arquivos temporários / inválidos
Get-ChildItem -Recurse -Include *.jsinv,*.ts~,*.js~ | Remove-Item -Force -ErrorAction SilentlyContinue

# Apaga arquivos .js duplicados dentro de 'app' se houver .ts/.tsx correspondente
Get-ChildItem -Recurse -Path app -Filter *.js | ForEach-Object {
    $tsPath = $_.FullName -replace '\.js$', '.ts'
    $tsxPath = $_.FullName -replace '\.js$', '.tsx'
    if (Test-Path $tsPath -or Test-Path $tsxPath) {
        Remove-Item $_.FullName -Force
    }
}

# Apaga arquivos .js fora de node_modules/public/app/lib se forem duplicados de .ts/.tsx
# Mantém apenas essenciais
Write-Host "Limpeza concluída!"
