# Jenkins Pipeline Configuration

## Pipeline Triggers
- **SCM Polling**: Every 5 minutes
- **Webhook**: GitHub push events
- **Manual**: On-demand execution

## Build Parameters
- **Branch**: Git branch to build
- **Environment**: Target environment (dev/staging/prod)
- **Docker Tag**: Custom Docker image tag

## Environment Variables
```bash
# Build Configuration
BUILD_NUMBER=${env.BUILD_NUMBER}
BRANCH_NAME=${env.BRANCH_NAME}
GIT_COMMIT_SHORT=${env.GIT_COMMIT_SHORT}

# Docker Configuration
DOCKER_REGISTRY=your-registry.com
IMAGE_NAME=student-management-system
FRONTEND_IMAGE=${DOCKER_REGISTRY}/${IMAGE_NAME}-frontend
BACKEND_IMAGE=${DOCKER_REGISTRY}/${IMAGE_NAME}-backend

# Environment-specific Configuration
ENVIRONMENT=${env.ENVIRONMENT}
DOCKER_TAG=${env.DOCKER_TAG}
```

## Credentials Required
1. **jwt-secret**: JWT signing secret
2. **neon-db-password**: Neon DB password
3. **neon-db-username**: Neon DB username
4. **neon-db-url**: Neon DB connection URL
5. **docker-registry-credentials**: Docker registry auth
6. **github-credentials**: GitHub access token
7. **slack-webhook**: Slack notification webhook

## Notification Channels
- **Slack**: #deployments channel
- **Email**: Build notifications
- **Webhook**: Custom integrations

## Security Scanning
- **Trivy**: Docker image vulnerability scanning
- **SonarQube**: Code quality analysis
- **ESLint**: Frontend code linting

## Deployment Strategy
- **Blue-Green**: Zero-downtime deployments
- **Rolling**: Gradual rollout
- **Manual Approval**: Production deployments
