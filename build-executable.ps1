# Script de build d'exécutable Windows pour FocusPulse
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Compilation de FocusPulse (.exe)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check node & npm
Write-Host "[1/3] Vérification de l'environnement Node.js..." -ForegroundColor Yellow
npm --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur : Node.js n'est pas disponible." -ForegroundColor Red
    exit 1
}

# Build web frontend
Write-Host "[2/3] Build du frontend React avec Vite..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build Vite." -ForegroundColor Red
    exit 1
}

# Build Electron Windows Executable
Write-Host "[3/3] Génération du binaire exécutable Windows (.exe)..." -ForegroundColor Yellow
npx electron-builder --win portable nsis

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host " BUILD RÉUSSI !" -ForegroundColor Green
    Write-Host " L'application téléchargeable est prête dans le dossier :" -ForegroundColor Green
    Write-Host " c:\Users\Tilio\OneDrive\Bureau\programe\app perso\dist-electron\" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de la génération du fichier .exe." -ForegroundColor Red
}
