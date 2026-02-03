@echo off
echo Stopping all Node.js processes (Server)...
taskkill /F /IM node.exe
echo.
echo Regenerating Prisma Client...
call npx prisma generate
echo.
echo ========================================================
echo FIXED! You can now restart your server with 'npm run dev'
echo ========================================================
pause
