# Define a senha temporária do banco remoto
$env:PGPASSWORD="yQZxxxxJ2vg"

# Cria timestamp único para o arquivo
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Define pasta de destino do backup
$backupFolder = "H:\Backup_Lasy"

# Verifica se a pasta existe, se não, cria
if (!(Test-Path -Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder
}

# Define nome completo do arquivo de backup
$backupFile = Join-Path $backupFolder "receitas_lasy_backup_$timestamp.sql"

# Caminho do pg_dump (PostgreSQL instalado via Chocolatey)
$pgDumpPath = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

# Executa o backup remoto
& $pgDumpPath `
  -h db.xkuppdpoyqtptqdjctlx.supabase.co `
  -U postgres `
  -d postgres `
  -p 5432 `
  -F c `
  -f $backupFile

# Mensagem de conclusão
Write-Output "Backup concluído com sucesso: $backupFile"
