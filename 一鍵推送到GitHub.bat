@echo off
chcp 65001 >nul
echo ========================================================
echo  《喵喵情緒偵探》GitHub Pages 一鍵推送部署工具
echo ========================================================
echo.
echo 正在推送程式碼至 https://github.com/Alison2004522/cat-detective.git ...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  [成功] 程式碼已成功推送至 GitHub！
    echo  請前往儲存庫 Settings -> Pages 開啟 GitHub Pages 即可上線！
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  [提示] 若出現 Repository not found，請先至 GitHub 網站：
    echo  https://github.com/new 建立名為 cat-detective 的公開儲存庫，
    echo  建立完成後再次執行本工具即可一鍵推送上線！
    echo ========================================================
)
echo.
pause
