#!/bin/bash

# Jenkins Setup Script for Student Management System
# This script sets up Jenkins with all necessary plugins and configurations

set -e

echo "🚀 Setting up Jenkins for Student Management System..."

# Create necessary directories
mkdir -p jenkins/{config,scripts,secrets}
mkdir -p nginx/{staging,production,ssl}
mkdir -p monitoring
mkdir -p backups

# Create environment files
cat > .env.jenkins << EOF
# Jenkins Configuration
JENKINS_ADMIN_USER=admin
JENKINS_ADMIN_PASSWORD=admin123
JENKINS_URL=http://localhost:8080

# Docker Registry
DOCKER_REGISTRY=localhost:5000
DOCKER_USERNAME=admin
DOCKER_PASSWORD=admin123

# Database Configuration (Neon DB)
NEON_DB_URL=jdbc:postgresql://ep-crimson-cake-adbzlxtt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
NEON_DB_USERNAME=neondb_owner
NEON_DB_PASSWORD=npg_mUrP6RuW0YtE

# JWT Secret
JWT_SECRET=mySecretKey123456789012345678901234567890

# Redis Configuration
REDIS_PASSWORD=redis_password_secure

# Grafana Configuration
GRAFANA_PASSWORD=grafana_password_secure

# SSL Configuration
SSL_CERT_PATH=./nginx/ssl/cert.pem
SSL_KEY_PATH=./nginx/ssl/key.pem
EOF

# Create staging environment file
cat > .env.staging << EOF
# Staging Environment Configuration
NODE_ENV=staging
VITE_API_BASE_URL=http://localhost:8082/api
SPRING_PROFILES_ACTIVE=staging
NEON_DB_URL=jdbc:postgresql://ep-crimson-cake-adbzlxtt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
NEON_DB_USERNAME=neondb_owner
NEON_DB_PASSWORD=npg_mUrP6RuW0YtE
JWT_SECRET=staging_jwt_secret_key
EOF

# Create production environment file
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com/api
SPRING_PROFILES_ACTIVE=production
NEON_DB_URL=jdbc:postgresql://ep-crimson-cake-adbzlxtt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
NEON_DB_USERNAME=neondb_owner
NEON_DB_PASSWORD=npg_mUrP6RuW0YtE
JWT_SECRET=production_jwt_secret_key_very_secure
REDIS_PASSWORD=production_redis_password_secure
GRAFANA_PASSWORD=production_grafana_password_secure
EOF

echo "✅ Environment files created"

# Create Jenkins configuration script
cat > jenkins/setup-jenkins.sh << 'EOF'
#!/bin/bash

# Wait for Jenkins to be ready
echo "⏳ Waiting for Jenkins to be ready..."
while ! curl -f http://localhost:8080/login > /dev/null 2>&1; do
    sleep 5
done

echo "✅ Jenkins is ready!"

# Get initial admin password
ADMIN_PASSWORD=$(docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo "admin123")

echo "🔑 Jenkins Admin Password: $ADMIN_PASSWORD"
echo "🌐 Jenkins URL: http://localhost:8080"
echo "👤 Username: admin"
echo "🔒 Password: $ADMIN_PASSWORD"

# Install recommended plugins
echo "📦 Installing Jenkins plugins..."
curl -X POST -u admin:$ADMIN_PASSWORD \
  -H "Content-Type: application/xml" \
  -d @jenkins/plugins.xml \
  http://localhost:8080/pluginManager/installNecessaryPlugins

echo "✅ Jenkins setup completed!"
EOF

chmod +x jenkins/setup-jenkins.sh

echo "✅ Jenkins setup script created"

# Create deployment scripts
cat > scripts/deploy-staging.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying to staging environment..."

# Load environment variables
source .env.staging

# Build and push images
docker-compose -f docker-compose.staging.yml build
docker-compose -f docker-compose.staging.yml push

# Deploy to staging
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up -d

echo "✅ Staging deployment completed!"
echo "🌐 Frontend: http://localhost:3002"
echo "🔧 Backend API: http://localhost:8082/api"
EOF

cat > scripts/deploy-production.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying to production environment..."

# Load environment variables
source .env.production

# Build and push images
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push

# Deploy to production
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Production deployment completed!"
echo "🌐 Application: https://yourdomain.com"
echo "📊 Monitoring: http://localhost:3000"
EOF

chmod +x scripts/deploy-staging.sh
chmod +x scripts/deploy-production.sh

echo "✅ Deployment scripts created"

# Create Nginx configurations
mkdir -p nginx/staging nginx/production

cat > nginx/staging.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:5173;
    }
    
    upstream backend {
        server backend:8080;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

cat > nginx/production.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:5173;
    }
    
    upstream backend {
        server backend:8080;
    }
    
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl;
        server_name yourdomain.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

echo "✅ Nginx configurations created"

# Create monitoring configuration
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'spring-boot'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/actuator/prometheus'
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

echo "✅ Monitoring configuration created"

echo "🎉 Jenkins setup completed!"
echo ""
echo "Next steps:"
echo "1. Run: docker-compose -f docker-compose.jenkins.yml up -d"
echo "2. Wait for Jenkins to start, then run: ./jenkins/setup-jenkins.sh"
echo "3. Access Jenkins at: http://localhost:8080"
echo "4. Create a new pipeline job and point it to your Jenkinsfile"
echo ""
echo "Environment files created:"
echo "- .env.jenkins (Jenkins configuration)"
echo "- .env.staging (Staging environment)"
echo "- .env.production (Production environment)"
echo ""
echo "Deployment scripts:"
echo "- scripts/deploy-staging.sh"
echo "- scripts/deploy-production.sh"
