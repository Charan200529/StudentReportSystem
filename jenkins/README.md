# Student Management System - Jenkins CI/CD Pipeline

## Pipeline Overview
This Jenkins pipeline automates the build, test, and deployment process for the Student Management System.

## Pipeline Stages

### 1. Checkout
- Clones the repository
- Sets up Git commit information

### 2. Environment Setup
- Determines deployment environment based on branch
- Sets Docker image tags
- Configures environment variables

### 3. Code Quality
- **Frontend**: Runs ESLint for code quality
- **Backend**: Executes Maven tests

### 4. Build
- **Frontend**: Compiles TypeScript and builds React app
- **Backend**: Packages Spring Boot application

### 5. Docker Build
- Builds frontend and backend Docker images
- Pushes images to Docker registry

### 6. Security Scan
- Scans Docker images for vulnerabilities using Trivy

### 7. Deploy to Staging
- Deploys to staging environment (develop branch)
- Runs integration tests

### 8. Deploy to Production
- Manual approval required
- Deploys to production (main/master branch)

## Environment Configuration

### Development
- Triggered by: Feature branches
- Environment: development
- Docker tag: `{branch}-{commit}`

### Staging
- Triggered by: develop branch
- Environment: staging
- Docker tag: staging

### Production
- Triggered by: main/master branch
- Environment: production
- Docker tag: latest

## Required Credentials

Configure these credentials in Jenkins:

1. **jwt-secret**: JWT signing secret
2. **db-password**: Database password
3. **db-username**: Database username
4. **db-url**: Database connection URL
5. **docker-registry-credentials**: Docker registry authentication

## Notification Integration

- **Slack**: Deployment notifications
- **Email**: Build failure alerts
- **Webhook**: Custom integrations

## Security Features

- Credential management
- Docker image scanning
- Environment variable protection
- SSL/TLS support

## Monitoring

- Build metrics
- Deployment status
- Application health checks
- Performance monitoring
