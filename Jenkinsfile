pipeline {
    agent any
    
    environment {
        // Docker registry configuration
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'student-management-system'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${IMAGE_NAME}-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${IMAGE_NAME}-backend"
        
        // Build configuration
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        BRANCH_NAME = "${env.BRANCH_NAME}"
        
        // Environment variables
        JWT_SECRET = credentials('jwt-secret')
        NEON_DB_PASSWORD = credentials('neon-db-password')
        NEON_DB_USERNAME = credentials('neon-db-username')
        NEON_DB_URL = credentials('neon-db-url')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        env.ENVIRONMENT = 'production'
                        env.DOCKER_TAG = 'latest'
                    } else if (env.BRANCH_NAME == 'develop') {
                        env.ENVIRONMENT = 'staging'
                        env.DOCKER_TAG = 'staging'
                    } else {
                        env.ENVIRONMENT = 'development'
                        env.DOCKER_TAG = "${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}"
                    }
                }
                echo "Building for environment: ${env.ENVIRONMENT}"
                echo "Docker tag: ${env.DOCKER_TAG}"
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'mvn clean test'
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('.') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
                archiveArtifacts artifacts: 'backend/target/*.jar', fingerprint: true
            }
        }
        
        stage('Docker Build') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        script {
                            def frontendImage = docker.build("${FRONTEND_IMAGE}:${env.DOCKER_TAG}", "-f Dockerfile.frontend .")
                            docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                frontendImage.push()
                                frontendImage.push('latest')
                            }
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        script {
                            def backendImage = docker.build("${BACKEND_IMAGE}:${env.DOCKER_TAG}", "./backend")
                            docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                backendImage.push()
                                backendImage.push('latest')
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // Run Trivy security scan on Docker images
                    sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${FRONTEND_IMAGE}:${env.DOCKER_TAG}"
                    sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${BACKEND_IMAGE}:${env.DOCKER_TAG}"
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    sh """
                        docker-compose -f docker-compose.staging.yml down || true
                        docker-compose -f docker-compose.staging.yml pull
                        docker-compose -f docker-compose.staging.yml up -d
                    """
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    // Wait for services to be ready
                    sh 'sleep 30'
                    
                    // Run integration tests
                    sh 'npm run test:integration || true'
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    // Manual approval for production deployment
                    input message: 'Deploy to production?', ok: 'Deploy'
                    
                    sh """
                        docker-compose -f docker-compose.prod.yml down || true
                        docker-compose -f docker-compose.prod.yml pull
                        docker-compose -f docker-compose.prod.yml up -d
                    """
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            script {
                if (env.ENVIRONMENT == 'production') {
                    // Send success notification
                    slackSend(
                        channel: '#deployments',
                        color: 'good',
                        message: "✅ Production deployment successful!\n" +
                                "Branch: ${env.BRANCH_NAME}\n" +
                                "Commit: ${env.GIT_COMMIT_SHORT}\n" +
                                "Build: ${env.BUILD_NUMBER}"
                    )
                }
            }
        }
        failure {
            script {
                // Send failure notification
                slackSend(
                    channel: '#deployments',
                    color: 'danger',
                    message: "❌ Deployment failed!\n" +
                            "Branch: ${env.BRANCH_NAME}\n" +
                            "Commit: ${env.GIT_COMMIT_SHORT}\n" +
                            "Build: ${env.BUILD_NUMBER}\n" +
                            "Check: ${env.BUILD_URL}"
                )
            }
        }
        cleanup {
            // Clean up Docker images to save space
            sh 'docker system prune -f || true'
        }
    }
}
