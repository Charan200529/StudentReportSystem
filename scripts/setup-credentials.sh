#!/bin/bash

# Jenkins Credentials Setup Script
# This script helps configure Jenkins credentials for the Student Management System

set -e

echo "🔐 Jenkins Credentials Setup for Student Management System"
echo "=========================================================="

# Check if Jenkins is running
if ! curl -f http://localhost:8080/login > /dev/null 2>&1; then
    echo "❌ Jenkins is not running. Please start Jenkins first:"
    echo "   docker-compose -f docker-compose.jenkins.yml up -d"
    exit 1
fi

echo "✅ Jenkins is running at http://localhost:8080"

# Get Jenkins admin password
ADMIN_PASSWORD=$(docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo "admin123")

echo ""
echo "🔑 Jenkins Admin Credentials:"
echo "   URL: http://localhost:8080"
echo "   Username: admin"
echo "   Password: $ADMIN_PASSWORD"
echo ""

echo "📋 Required Credentials to Add:"
echo "================================"
echo ""
echo "1. 🔐 JWT Secret"
echo "   ID: jwt-secret"
echo "   Type: Secret text"
echo "   Value: mySecretKey123456789012345678901234567890"
echo ""
echo "2. 🗄️ Neon DB URL"
echo "   ID: neon-db-url"
echo "   Type: Secret text"
echo "   Value: jdbc:postgresql://ep-crimson-cake-adbzlxtt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require"
echo ""
echo "3. 👤 Neon DB Username"
echo "   ID: neon-db-username"
echo "   Type: Secret text"
echo "   Value: neondb_owner"
echo ""
echo "4. 🔒 Neon DB Password"
echo "   ID: neon-db-password"
echo "   Type: Secret text"
echo "   Value: npg_mUrP6RuW0YtE"
echo ""
echo "5. 🐳 Docker Registry Credentials"
echo "   ID: docker-registry-credentials"
echo "   Type: Username with password"
echo "   Username: admin"
echo "   Password: admin123"
echo "   Description: Docker Registry Authentication"
echo ""
echo "6. 📱 Slack Webhook (Optional)"
echo "   ID: slack-webhook"
echo "   Type: Secret text"
echo "   Value: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
echo ""

echo "🚀 How to Add Credentials:"
echo "=========================="
echo ""
echo "1. Open Jenkins: http://localhost:8080"
echo "2. Login with admin / $ADMIN_PASSWORD"
echo "3. Go to 'Manage Jenkins' → 'Manage Credentials'"
echo "4. Click on 'System' → 'Global credentials'"
echo "5. Click 'Add Credentials'"
echo "6. For each credential above:"
echo "   - Select the appropriate type"
echo "   - Enter the ID exactly as shown"
echo "   - Enter the value"
echo "   - Add a description"
echo "   - Click 'OK'"
echo ""

echo "🔍 Verify Credentials:"
echo "======================"
echo "After adding all credentials, you can verify them by:"
echo "1. Going to 'Manage Jenkins' → 'Manage Credentials'"
echo "2. Clicking on 'System' → 'Global credentials'"
echo "3. You should see all 6 credentials listed"
echo ""

echo "📝 Next Steps:"
echo "=============="
echo "1. Add all credentials as described above"
echo "2. Create a new Pipeline job"
echo "3. Point it to your Jenkinsfile"
echo "4. Run a test build"
echo ""

echo "✅ Credentials setup guide completed!"
echo "   Remember to keep your credentials secure and never commit them to version control."
