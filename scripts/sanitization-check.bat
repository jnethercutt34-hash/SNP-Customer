@echo off
REM ─── SNP-Customer Sanitization Audit (Windows) ─────────────────────────────
REM Checks source files for leaked internal details.
REM Usage: scripts\sanitization-check.bat
REM Exit code: 0 = clean, 1 = violations found

echo ═══════════════════════════════════════════════════════
echo  SNP-Customer Sanitization Audit
echo ═══════════════════════════════════════════════════════
echo.

set VIOLATIONS=0

echo Checking vendor part numbers...
for %%P in (VSC8504 VM1502 Virtium Microchip Marvell Xilinx Lattice) do (
  findstr /S /N /C:"%%P" src\*.ts src\*.tsx >nul 2>&1
  if not errorlevel 1 (
    echo   X Found '%%P':
    findstr /S /N /C:"%%P" src\*.ts src\*.tsx
    set /a VIOLATIONS+=1
  )
)

echo Checking customer names...
for %%N in (customer-a-pleo customer-b-pleo customer-c-pleo fms-irad) do (
  findstr /S /N /C:"%%N" src\*.ts src\*.tsx >nul 2>&1
  if not errorlevel 1 (
    echo   X Found '%%N':
    findstr /S /N /C:"%%N" src\*.ts src\*.tsx
    set /a VIOLATIONS+=1
  )
)
REM Check customer name strings specifically (quoted)
for %%N in ("ABE" "J2" "JL" "FMS") do (
  findstr /S /N /C:"customerName: %%N" /C:"\"%%~N\"" src\*.ts src\*.tsx >nul 2>&1
  if not errorlevel 1 (
    echo   X Found customer name %%N:
    findstr /S /N /C:"customerName: %%N" /C:"\"%%~N\"" src\*.ts src\*.tsx
    set /a VIOLATIONS+=1
  )
)

echo Checking internal doc numbers...
for %%D in (SNP-HW- SNP-ICD- SNP-IDD- SNP-SUM- ECO- ECN- DCN-) do (
  findstr /S /N /C:"%%D" src\*.ts src\*.tsx >nul 2>&1
  if not errorlevel 1 (
    echo   X Found '%%D':
    findstr /S /N /C:"%%D" src\*.ts src\*.tsx
    set /a VIOLATIONS+=1
  )
)

echo Checking fault codes...
findstr /S /N /C:"ERR_0x" src\*.ts src\*.tsx >nul 2>&1
if not errorlevel 1 (
  echo   X Found internal fault codes:
  findstr /S /N /C:"ERR_0x" src\*.ts src\*.tsx
  set /a VIOLATIONS+=1
)

echo Checking GDMS references...
findstr /S /N /C:"GDMS" src\*.ts src\*.tsx >nul 2>&1
if not errorlevel 1 (
  echo   X Found GDMS references:
  findstr /S /N /C:"GDMS" src\*.ts src\*.tsx
  set /a VIOLATIONS+=1
)

echo.
echo ═══════════════════════════════════════════════════════
if "%VIOLATIONS%"=="0" (
  echo   CLEAN - No sanitization violations found.
  echo ═══════════════════════════════════════════════════════
  exit /b 0
)
echo   FAILED - %VIOLATIONS% violation groups found.
echo   Fix before customer demo!
echo ═══════════════════════════════════════════════════════
exit /b 1
