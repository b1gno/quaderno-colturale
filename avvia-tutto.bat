@echo off
title Quaderno di Campo - Avvio Completo
color 0A

echo.
echo ============================================================
echo            QUADERNO DI CAMPO DIGITALE
echo            Avvio automatico completo
echo ============================================================
echo.

REM ===== STEP 1: Avvio MySQL di XAMPP =====
echo [1/4] Avvio MySQL...

REM Cerca il percorso di XAMPP
set XAMPP_PATH=C:\xampp
if not exist "%XAMPP_PATH%\mysql\bin\mysqld.exe" (
    set XAMPP_PATH=C:\Program Files\XAMPP
)
if not exist "%XAMPP_PATH%\mysql\bin\mysqld.exe" (
    set XAMPP_PATH=D:\xampp
)

REM Controlla se MySQL è già attivo
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo      MySQL: GIA' ATTIVO
) else (
    echo      Avvio MySQL in corso...
    start "" "%XAMPP_PATH%\mysql_start.bat"
    timeout /t 5 /nobreak >nul
    echo      MySQL: AVVIATO
)

echo.

REM ===== STEP 2: Avvio Apache (opzionale) =====
echo [2/4] Controllo Apache...

tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo      Apache: GIA' ATTIVO
) else (
    echo      Avvio Apache in corso...
    start "" "%XAMPP_PATH%\apache_start.bat"
    timeout /t 3 /nobreak >nul
    echo      Apache: AVVIATO
)

echo.

REM ===== STEP 3: Avvio server Node.js =====
echo [3/4] Avvio server Node.js...
cd backend
start "Quaderno Campo Server" cmd /k "color 0B && title Quaderno Campo - Server Backend && npm start"
timeout /t 4 /nobreak >nul
echo      Server Node.js: AVVIATO

echo.

REM ===== STEP 4: Apertura browser =====
echo [4/4] Apertura applicazione web...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo      Browser: APERTO

echo.
echo ============================================================
echo            TUTTO PRONTO!
echo ============================================================
echo.
echo   Applicazione disponibile su: http://localhost:3000
echo.
echo   NOTA: NON chiudere la finestra "Server Backend"
echo         altrimenti l'applicazione smette di funzionare
echo.
echo ============================================================
echo.
echo Premi un tasto per chiudere questa finestra...
pause >nul
