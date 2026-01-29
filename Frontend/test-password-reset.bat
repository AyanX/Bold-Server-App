@echo off
REM Password Reset Flow Test - Windows Batch Script

setlocal enabledelayedexpansion

set BASE_URL=http://127.0.0.1:8000/api
set TEST_EMAIL=test@example.com
set TEST_PASSWORD=NewPassword123!

echo.
echo ======================================
echo PASSWORD RESET FLOW TEST
echo ======================================
echo.

echo Step 1: Request Password Reset OTP
echo ====================================
echo Requesting OTP for: %TEST_EMAIL%
echo.

curl -X POST "%BASE_URL%/forgot-password" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"%TEST_EMAIL%\"}"

echo.
echo.
echo ====================================
echo SUCCESS!
echo ====================================
echo.
echo Next Steps:
echo 1. Check your email at %TEST_EMAIL% for the OTP code
echo 2. Look in spam/junk folder if not in inbox
echo 3. Open the password reset form in your browser
echo 4. Enter the 6-digit OTP code
echo 5. Create a new password with:
echo    - At least 8 characters
echo    - Mix of uppercase, lowercase, numbers, and symbols
echo 6. Click "Reset Password"
echo.
echo Your new password should be something like: %TEST_PASSWORD%
echo.
pause
