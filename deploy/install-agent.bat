@echo off
echo ========================================
echo PC Succession Agent Installer
echo ========================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer must be run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Set variables
set INSTALL_DIR=C:\Program Files\PCSuccession
set SERVICE_NAME=PCSuccessionAgent
set AGENT_URL=https://github.com/nickbeentjes/PCSuccession/releases/latest/download/agent.zip

echo Installing PC Succession Agent...
echo.

:: Create installation directory
echo Creating installation directory...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Download agent (if URL provided, otherwise copy from current directory)
echo Downloading agent files...
if exist "agent.zip" (
    echo Using local agent.zip
    powershell -Command "Expand-Archive -Path 'agent.zip' -DestinationPath '%INSTALL_DIR%' -Force"
) else if exist "..\agent\PCSuccessionAgent\bin\Release" (
    echo Copying from local build...
    xcopy /E /I /Y "..\agent\PCSuccessionAgent\bin\Release\*" "%INSTALL_DIR%\"
) else (
    echo ERROR: No agent files found!
    echo Please build the agent first or provide agent.zip
    pause
    exit /b 1
)

:: Configure agent
echo Configuring agent...
set /p API_URL="Enter API Server URL (default: https://api.pcsuccession.local): "
if "%API_URL%"=="" set API_URL=https://api.pcsuccession.local

set /p COMPANY_ID="Enter Company ID (optional): "

:: Create configuration file
(
echo {
echo   "ApiUrl": "%API_URL%",
echo   "CompanyId": "%COMPANY_ID%",
echo   "MonitoringEnabled": true,
echo   "AutoStart": true
echo }
) > "%INSTALL_DIR%\config.json"

:: Install as Windows Service
echo Installing Windows Service...
sc create %SERVICE_NAME% binPath= "%INSTALL_DIR%\PCSuccessionAgent.exe --service" start= auto DisplayName= "PC Succession Agent"

:: Start the service
echo Starting service...
sc start %SERVICE_NAME%

:: Create start menu shortcut
echo Creating shortcuts...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\PC Succession Agent.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\PCSuccessionAgent.exe'; $Shortcut.Save()"

:: Add to startup (run system tray app)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "PCSuccessionAgent" /t REG_SZ /d "%INSTALL_DIR%\PCSuccessionAgent.exe" /f

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo The PC Succession Agent is now installed and running.
echo You can access it from the system tray icon.
echo.
echo Installation Directory: %INSTALL_DIR%
echo Service Name: %SERVICE_NAME%
echo API Server: %API_URL%
echo.
pause

