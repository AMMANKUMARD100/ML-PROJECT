@echo off
title VoiceDetect Desktop Application
echo ========================================================
echo       Starting VoiceDetect Desktop Application...
echo       Works Offline and Online!
echo ========================================================
cd /d "%~dp0"
py -3.12 launch_desktop.py
pause
