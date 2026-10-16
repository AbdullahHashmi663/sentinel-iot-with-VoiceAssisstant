@echo off
rem Compatibility alias. Use START_SENTINEL_HOST.bat for the host.
call "%~dp0START_SENTINEL_HOST.bat" %*
exit /b %errorlevel%
