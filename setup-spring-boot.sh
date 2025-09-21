#!/bin/bash

echo "🚀 Setting up Student Management System with Spring Boot Backend"
echo "================================================================"

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v java &> /dev/null; then
        echo "❌ Java is not installed. Please install Java 17+"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker"
        exit 1
    fi
    
    if ! command -v mvn &> /dev/null; then
        echo "❌ Maven is not installed. Please install Maven"
        exit 1
    fi
    
    echo "✅ All requirements met!"
}

# Setup environment files
setup_environment() {
    echo "🔧 Setting up environment files..."
    
    # Copy environment examples
    if [ ! -f .env ]; then
        cp env.example .env
        echo "✅ Created .env file from example"
    else
        echo "⚠️  .env file already exists, skipping..."
    fi
    
    if [ ! -f .env.local ]; then
        cp env.local.example .env.local
        echo "✅ Created .env.local file from example"
    else
        echo "⚠️  .env.local file already exists, skipping..."
    fi
    
    echo "📝 Please update .env and .env.local with your database credentials"
}

# Build backend
build_backend() {
    echo "🔨 Building Spring Boot backend..."
    cd backend
    
    # Clean and build
    mvn clean package -DskipTests
    
    if [ $? -eq 0 ]; then
        echo "✅ Backend built successfully"
    else
        echo "❌ Backend build failed"
        exit 1
    fi
    
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    echo "📦 Installing frontend dependencies..."
    cd frontend
    
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed"
    else
        echo "❌ Frontend dependency installation failed"
        exit 1
    fi
    
    cd ..
}

# Setup database
setup_database() {
    echo "🗄️  Database setup options:"
    echo "1. Use Docker PostgreSQL (recommended for development)"
    echo "2. Use local PostgreSQL"
    echo "3. Use Neon database (cloud)"
    echo "4. Skip database setup"
    
    read -p "Choose option (1-4): " db_option
    
    case $db_option in
        1)
            echo "🐳 Starting PostgreSQL with Docker..."
            docker run --name sms-postgres -e POSTGRES_DB=student_management -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine
            echo "✅ PostgreSQL container started"
            ;;
        2)
            echo "📝 Please ensure PostgreSQL is running locally and create database 'student_management'"
            ;;
        3)
            echo "☁️  Please update .env with your Neon database credentials"
            ;;
        4)
            echo "⏭️  Skipping database setup"
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
}

# Run the application
run_application() {
    echo "🚀 Starting the application..."
    
    echo "Choose how to run the application:"
    echo "1. Docker Compose (recommended)"
    echo "2. Manual (backend + frontend separately)"
    
    read -p "Choose option (1-2): " run_option
    
    case $run_option in
        1)
            echo "🐳 Starting with Docker Compose..."
            docker-compose up --build
            ;;
        2)
            echo "🔧 Starting manually..."
            echo "Backend will run on http://localhost:8080"
            echo "Frontend will run on http://localhost:3000"
            echo ""
            echo "Starting backend..."
            cd backend
            mvn spring-boot:run &
            BACKEND_PID=$!
            cd ..
            
            echo "Starting frontend..."
            cd frontend
            npm start &
            FRONTEND_PID=$!
            cd ..
            
            echo "✅ Application started!"
            echo "Backend PID: $BACKEND_PID"
            echo "Frontend PID: $FRONTEND_PID"
            echo "Press Ctrl+C to stop both services"
            
            # Wait for user to stop
            wait
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
}

# Main execution
main() {
    echo "Starting setup process..."
    echo ""
    
    check_requirements
    echo ""
    
    setup_environment
    echo ""
    
    setup_database
    echo ""
    
    build_backend
    echo ""
    
    setup_frontend
    echo ""
    
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update .env with your database credentials"
    echo "2. Update .env.local with your API URL"
    echo "3. Run the application"
    echo ""
    
    read -p "Do you want to start the application now? (y/n): " start_now
    
    if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
        run_application
    else
        echo "👋 Setup complete! Run './setup-spring-boot.sh' again to start the application"
    fi
}

# Run main function
main
