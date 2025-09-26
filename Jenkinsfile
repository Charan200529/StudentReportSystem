pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'student-management-system'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${IMAGE_NAME}-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${IMAGE_NAME}-backend"
        
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        BRANCH_NAME = "${env.BRANCH_NAME}"
        
        JWT_SECRET = credentials('jwt-secret')
        NEON_DB_PASSWORD = credentials('neon-db-password')
        NEON_DB_USERNAME = credentials('neon-db-username')
        NEON_DB_URL = credentials('neon-db-url')

        SLACK_TOKEN = credentials('SLACK_TOKEN_ID')  
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = bat(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    if (env.BRANCH_NAME in ['main','master']) {
                        env.ENVIRONMENT = 'production'
                        env.DOCKER_TAG = 'latest'
                    } else if (env.BRANCH_NAME == 'develop') {
                        env.ENVIRONMENT = 'staging'
                        env.DOCKER_TAG = 'staging'
                    } else {
                        env.ENVIRONMENT = 'development'
                        env.DOCKER_TAG = "${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}"
                    }
                    echo "Building for environment: ${env.ENVIRONMENT}"
                    echo "Docker tag: ${env.DOCKER_TAG}"
                }
            }
        }

       
    }
    
    post {
        always {
            node {
                cleanWs() 
                bat 'docker system prune -f || true'
            }
        }
        success {
            node {
                slackSend(
                    channel: '#deployments',
                    color: 'good',
                    tokenCredentialId: 'SLACK_TOKEN_ID',  
                    message: "✅ Deployment successful!\nBranch: ${env.BRANCH_NAME}\nCommit: ${env.GIT_COMMIT_SHORT}\nBuild: ${env.BUILD_NUMBER}"
                )
            }
        }
        failure {
            node {
                slackSend(
                    channel: '#deployments',
                    color: 'danger',
                    tokenCredentialId: 'SLACK_TOKEN_ID',
                    message: "❌ Deployment failed!\nBranch: ${env.BRANCH_NAME}\nCommit: ${env.GIT_COMMIT_SHORT}\nBuild: ${env.BUILD_NUMBER}\nCheck: ${env.BUILD_URL}"
                )
            }
        }
    }
}
