# Migration Guide: Firebase to Spring Boot

This guide will help you migrate your Student Management System from Firebase to Spring Boot with PostgreSQL.

## 🎯 Overview

We're migrating from:
- **Firebase Realtime Database** → **PostgreSQL (Neon)**
- **Firebase Authentication** → **Spring Security + JWT**
- **Firebase Hosting** → **Docker + AWS**

## 📋 Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven
- PostgreSQL (or Neon account)

## 🚀 Quick Migration Steps

### 1. Run Setup Script

**Windows:**
```bash
setup-spring-boot.bat
```

**Linux/Mac:**
```bash
chmod +x setup-spring-boot.sh
./setup-spring-boot.sh
```

### 2. Environment Configuration

Update your environment files:

**`.env` (Backend):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_management
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

**`.env.local` (Frontend):**
```env
VITE_API_URL=http://localhost:8080/api
```

### 3. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database: student_management
```

#### Option B: Neon Database (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Get connection details from dashboard
4. Update `.env` with Neon credentials

### 4. Start Application

```bash
# Using Docker Compose (Recommended)
docker-compose up --build

# Or manually
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm start
```

## 🔄 Data Migration

### Current Firebase Data Structure
```
users/
  - {uid}/
    - email: "user@example.com"
    - displayName: "User Name"
    - roles: ["STUDENT"]
    - currentSemester: 1
    - createdAt: "2024-01-01T00:00:00Z"

courses/
  - {courseId}/
    - title: "Course Title"
    - code: "CS101"
    - description: "Course Description"
    - semester: 1
    - teacherId: "teacher_uid"

assignments/
  - {assignmentId}/
    - title: "Assignment Title"
    - description: "Assignment Description"
    - courseId: "course_id"
    - maxPoints: 100
    - dueDate: "2024-01-15T23:59:59Z"
    - instructions: "Assignment Instructions"
    - status: "ACTIVE"
    - createdBy: "teacher_uid"

submissions/
  - {submissionId}/
    - assignmentId: "assignment_id"
    - studentId: "student_uid"
    - studentName: "Student Name"
    - submissionText: "Submission content"
    - submittedAt: "2024-01-10T12:00:00Z"
    - status: "SUBMITTED"
    - score: null
    - feedback: null
```

### New PostgreSQL Schema

The Spring Boot application will automatically create these tables:

- `users` - User accounts and profiles
- `courses` - Course information
- `assignments` - Assignment details
- `submissions` - Student submissions
- `enrollments` - Student course enrollments

## 🔐 Authentication Changes

### Firebase Authentication → Spring Security + JWT

**Before (Firebase):**
```typescript
import { signInWithEmailAndPassword } from '@firebase/auth';
const userCredential = await signInWithEmailAndPassword(auth, email, password);
```

**After (Spring Boot):**
```typescript
import { apiService } from '@/services/api';
const response = await apiService.login(email, password);
// JWT token automatically stored
```

### Default Users

The system creates these default users on startup:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | admin123 |
| Teacher | teacher@gmail.com | teacher123 |
| Student | student@gmail.com | student123 |

## 📡 API Changes

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | POST | Login user |
| `/api/auth/signup` | POST | Register user |
| `/api/auth/create-admin` | POST | Create admin user |

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/profile` | GET | Get current user |
| `/api/users/all` | GET | Get all users (Admin) |
| `/api/users/{id}/role` | PUT | Update user role (Admin) |
| `/api/users/{id}/semester` | PUT | Update semester (Admin) |

### Course Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses/all` | GET | Get courses (role-based) |
| `/api/courses` | POST | Create course (Admin/Teacher) |
| `/api/courses/{id}` | PUT | Update course (Admin/Teacher) |
| `/api/courses/{id}` | DELETE | Delete course (Admin) |

### Assignment Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/assignments/all` | GET | Get assignments (role-based) |
| `/api/assignments` | POST | Create assignment (Admin/Teacher) |
| `/api/assignments/{id}` | PUT | Update assignment (Admin/Teacher) |
| `/api/assignments/{id}` | DELETE | Delete assignment (Admin) |

### Submission Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/submissions/by-assignment/{id}` | GET | Get submissions for assignment |
| `/api/submissions` | POST | Submit assignment (Student) |
| `/api/submissions/{id}/grade` | PUT | Grade submission (Admin/Teacher) |

## 🐳 Docker Configuration

### Services

- **postgres**: PostgreSQL database
- **backend**: Spring Boot application
- **frontend**: React application

### Environment Variables

```yaml
# Backend
DB_HOST: postgres
DB_PORT: 5432
DB_NAME: student_management
DB_USERNAME: postgres
DB_PASSWORD: password
JWT_SECRET: mySecretKey123456789012345678901234567890

# Frontend
REACT_APP_API_URL: http://localhost:8080/api
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The new CI/CD pipeline includes:

1. **Test Stage**
   - Backend unit tests
   - Frontend tests
   - Integration tests

2. **Build Stage**
   - Maven build
   - npm build
   - Docker image creation

3. **Deploy Stage**
   - AWS ECS deployment (placeholder)
   - Database migrations
   - Health checks

### Pipeline Triggers

- Push to `main` branch
- Pull requests to `main`
- Manual triggers

## 🚨 Breaking Changes

### Frontend Changes

1. **AuthContext**: Completely rewritten to use Spring Boot API
2. **API Calls**: All Firebase calls replaced with REST API calls
3. **Environment Variables**: Changed from Firebase config to API URL
4. **Authentication**: JWT tokens instead of Firebase tokens

### Backend Changes

1. **Database**: PostgreSQL instead of Firebase Realtime Database
2. **Authentication**: Spring Security instead of Firebase Auth
3. **API**: REST endpoints instead of Firebase SDK
4. **Deployment**: Docker containers instead of Firebase Hosting

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL is running
   docker ps | grep postgres
   
   # Check connection
   docker exec -it sms-postgres psql -U postgres -d student_management
   ```

2. **JWT Token Issues**
   ```bash
   # Check JWT_SECRET is set
   echo $JWT_SECRET
   
   # Verify token format
   # Should be: Bearer <token>
   ```

3. **Frontend API Calls Failed**
   ```bash
   # Check backend is running
   curl http://localhost:8080/api/auth/signin
   
   # Check CORS configuration
   # Verify REACT_APP_API_URL is set
   ```

4. **Docker Build Failed**
   ```bash
   # Check Docker is running
   docker --version
   
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild images
   docker-compose build --no-cache
   ```

### Debug Commands

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Access database
docker exec -it sms-postgres psql -U postgres -d student_management

# Test API endpoints
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}'
```

## 📊 Performance Comparison

| Aspect | Firebase | Spring Boot |
|--------|----------|-------------|
| **Database** | NoSQL (Realtime) | SQL (PostgreSQL) |
| **Authentication** | Built-in | Custom JWT |
| **Hosting** | Firebase Hosting | Docker + AWS |
| **Scaling** | Automatic | Manual |
| **Cost** | Pay-per-use | Fixed |
| **Control** | Limited | Full |

## 🎯 Benefits of Migration

1. **Cost Control**: Fixed hosting costs instead of pay-per-use
2. **Full Control**: Complete control over backend logic
3. **SQL Database**: Better for complex queries and relationships
4. **Industry Standard**: Spring Boot is widely used in enterprise
5. **CI/CD**: Better integration with modern DevOps practices
6. **Scalability**: More control over scaling strategies

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Neon Database](https://neon.tech/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🆘 Support

If you encounter issues during migration:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test API endpoints manually
4. Check database connectivity
5. Review the troubleshooting section above

---

**Happy migrating! 🚀**
