@echo off
title EchoMesh Demo Server
color 0A

:: ─── Auto-elevate to Administrator (needed for firewall rule) ───
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo  Requesting Administrator access for firewall setup...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo.
echo  ======================================================
echo     EchoMesh - Offline Disaster Response Mesh Network
echo  ======================================================
echo.

:: ─── Step 1: Open Firewall for port 4000 ───
echo  [1/3] Opening Firewall for port 4000...
netsh advfirewall firewall delete rule name="EchoMesh Port 4000" >nul 2>&1
netsh advfirewall firewall add rule name="EchoMesh Port 4000" dir=in action=allow protocol=TCP localport=4000 >nul 2>&1
echo        Firewall rule added!

:: ─── Step 2: Build frontend ───
echo  [2/3] Building frontend...
cd /d "%~dp0frontend"
call npm run build
cd /d "%~dp0"

:: ─── Step 3: Start Server ───
echo  [3/3] Starting EchoMesh server...
echo.
echo  ======================================================
echo    JUDGE DEMO - PHONE CONNECT KARNE KE STEPS:
echo  ======================================================
echo.
echo   STEP 1: Laptop mein Mobile Hotspot ON karo:
echo           Settings - Network and Internet - Mobile Hotspot
echo.
echo   STEP 2: Phone se laptop ka WiFi Hotspot join karo
echo           (hotspot naam aur password Settings mein milega)
echo.
echo   STEP 3: Phone ke browser mein open karo:
echo.
echo           http://192.168.137.1:4000
echo.
echo   NOTE: Internet ki zarurat NAHI - fully offline works!
echo         Decentralized mesh network - no central server!
echo.
echo  ======================================================
echo.
node router.js
pause
