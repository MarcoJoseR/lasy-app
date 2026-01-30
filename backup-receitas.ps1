# ============================================
# Script PowerShell de backup PostgreSQL/Supabase
# ============================================

# Caminho do pg_dump (ajuste caso esteja em outro lugar)
$pgDump = "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"

# URL de conexão (remova a senha da URL, ela será definida via variável)
$pgUrl = "postgres://postgres@db.supabase.co:5432/postgres"

# Define a senha como variável de ambiente para não precisar digitar
$env:PGPASSWORD = "senha123"

# Caminho do backup
$backupFolder = "H:\Backup_Supabase"
$backupFile = Join-Path $backupFolder "receitas_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').backup"

# Cria a pasta de backup caso não exista
if (-not (Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder | Out-Null
    Write-Host "📂 Pasta de backup criada: $backupFolder"
}

# Teste rápido de conexão usando pg_isready
$pgIsReady = "C:\Program Files\PostgreSQL\16\bin\pg_isready.exe"
Write-Host "🔌 Testando conexão com o banco..."
& $pgIsReady --dbname=$pgUrl

# Executa o dump da tabela receitas
Write-Host "💾 Iniciando backup da tabela 'receitas'..."
& $pgDump `
    --table=receitas `
    --file=$backupFile `
    --format=custom `
    --blobs `
    --verbose `
    --dbname=$pgUrl

Write-Host "✅ Backup concluído!"
Write-Host "Arquivo salvo em: $backupFile"

# Limpa a variável de ambiente por segurança
Remove-Item Env:PGPASSWORD
