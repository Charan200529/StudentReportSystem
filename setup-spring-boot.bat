@echo off
echo 🚀 Setting up Student Management System with Spring Boot Backend
echo ================================================================

REM Check if required tools are installed
echo 📋 Checking requirements...

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed. Please install Java 17+
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker
    pause
    exit /b 1
)

mvn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Maven is not installed. Please install Maven
    pause
    exit /b 1
)

echo ✅ All requirements met!

REM Setup environment files
echo 🔧 Setting up environment files...

if not exist .env (
    copy env.example .env
    echo ✅ Created .env file from example
) else (
    echo ⚠️  .env file already exists, skipping...
)

if not exist .env.local (
    copy env.local.example .env.local
    echo ✅ Created .env.local file from example
) else (
    echo ⚠️  .env.local file already exists, skipping...
)

echo 📝 Please update .env and .env.local with your database credentials

REM Build backend
echo 🔨 Building Spring Boot backend...
cd backend

mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)

echo ✅ Backend built successfully
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend

npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed
cd ..

echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update .env with your database credentials
echo 2. Update .env.local with your API URL
echo 3. Run the application with Docker Compose: docker-compose up --build
echo.

pause
