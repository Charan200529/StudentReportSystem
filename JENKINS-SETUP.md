# Jenkins CI/CD Setup for Student Management System

## Database Configuration
This project uses **Neon DB** (cloud PostgreSQL service) instead of local PostgreSQL containers. Neon DB provides:
- Automatic backups
- High availability
- Scalability
- SSL/TLS encryption
- Connection pooling

## Prerequisites
- Docker and Docker Compose installed
- Git repository access
- Basic understanding of Jenkins and CI/CD concepts

## Quick Start

### 1. Run the Setup Script
```bash
chmod +x setup-jenkins.sh
./setup-jenkins.sh
```

### 2. Start Jenkins Services
```bash
docker-compose -f docker-compose.jenkins.yml up -d
```

### 3. Access Jenkins
- URL: http://localhost:8080
- Username: admin
- Password: Check the setup script output or run: `docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`

## Pipeline Features

### Automated Stages
1. **Code Quality**: Linting and testing
2. **Build**: Frontend and backend compilation
3. **Docker Build**: Container image creation
4. **Security Scan**: Vulnerability scanning with Trivy
5. **Deploy**: Staging and production deployments
6. **Integration Tests**: End-to-end testing

### Environment Support
- **Development**: Feature branch deployments
- **Staging**: Develop branch deployments
- **Production**: Main/master branch deployments

### Security Features
- Credential management
- Docker image scanning
- SSL/TLS support
- Environment variable protection

## Configuration Files

### Jenkinsfile
Main pipeline configuration with:
- Multi-stage pipeline
- Parallel execution
- Environment-specific deployments
- Security scanning
- Notification integration

### Docker Compose Files
- `docker-compose.jenkins.yml`: Jenkins infrastructure
- `docker-compose.staging.yml`: Staging environment
- `docker-compose.prod.yml`: Production environment

### Environment Files
- `.env.jenkins`: Jenkins configuration
- `.env.staging`: Staging environment variables
- `.env.production`: Production environment variables

## Deployment Scripts

### Staging Deployment
```bash
./scripts/deploy-staging.sh
```

### Production Deployment
```bash
./scripts/deploy-production.sh
```

### Health Checks
```bash
./scripts/health-check.sh
```

### Backup
```bash
./scripts/backup.sh
```

## Monitoring and Tools

### Included Services
- **Jenkins**: CI/CD orchestration
- **SonarQube**: Code quality analysis
- **Nexus**: Artifact repository
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards

### Access URLs
- Jenkins: http://localhost:8080
- SonarQube: http://localhost:9000
- Nexus: http://localhost:8081
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## Security Considerations

### Credentials Management
Store sensitive data in Jenkins credentials:
- Database passwords
- JWT secrets
- Docker registry credentials
- SSL certificates

### Neon DB Configuration
The application is configured to use Neon DB with the following connection details:
- **URL**: `jdbc:postgresql://ep-crimson-cake-adbzlxtt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require`
- **Username**: `neondb_owner`
- **Password**: `npg_mUrP6RuW0YtE`

**Note**: Neon DB handles automatic backups, so no manual backup configuration is needed.

### SSL/TLS
Production deployments include SSL certificate configuration in Nginx.

## Troubleshooting

### Common Issues

1. **Jenkins not starting**
   - Check Docker logs: `docker logs jenkins`
   - Verify port availability
   - Check disk space

2. **Build failures**
   - Check Docker daemon status
   - Verify network connectivity
   - Review build logs in Jenkins

3. **Deployment issues**
   - Verify environment variables
   - Check service health
   - Review Docker Compose logs

### Log Locations
- Jenkins: `docker logs jenkins`
- Application: `docker logs sms-backend` or `docker logs sms-frontend`
- Database: `docker logs sms-postgres`

## Best Practices

### Code Quality
- Run linting before commits
- Maintain test coverage
- Use semantic versioning

### Deployment
- Test in staging before production
- Use blue-green deployments
- Monitor application health

### Security
- Regular security scans
- Keep dependencies updated
- Use least privilege principle

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Jenkins build logs
3. Check Docker service status
4. Verify environment configuration

## Next Steps

1. Configure your Git repository webhooks
2. Set up Slack notifications
3. Customize monitoring dashboards
4. Implement additional security measures
5. Set up automated backups
