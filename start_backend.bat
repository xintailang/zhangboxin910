@echo off
chcp 936 >nul
REM ============================================
REM 姓名：zhangboxin
REM 学号：24001010910
REM 时间：2026-11-19
REM 大模型：DeepSeek-V4.1-Flash
REM 说明：一键启动校园二手交易平台后台服务（端口 8910）
REM 注意：本文件以 ANSI(GBK) + CRLF 保存，避免中文乱码
REM ============================================

title 校园二手交易平台 - 后台服务

cd /d "%~dp0backend"

if not exist "node_modules" (
  echo [提示] 未检测到依赖，正在安装...
  call npm i
  if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络或 npm 源配置。
    pause
    exit /b 1
  )
)

echo 正在启动后台服务，请勿关闭本窗口...
echo 访问地址：http://localhost:8910
echo.

node server.js

echo.
echo 服务已停止。
pause
