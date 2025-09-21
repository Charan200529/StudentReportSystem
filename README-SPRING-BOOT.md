# Student Management System - Spring Boot Backend

A full-stack Student Management System built with React frontend, Spring Boot backend, and PostgreSQL database.

## 🏗️ Architecture

- **Frontend**: React 18 with TypeScript, Tailwind CSS
- **Backend**: Spring Boot 3.2 with Java 17
- **Database**: PostgreSQL (Neon for production)
- **Authentication**: JWT with Spring Security
- **Deployment**: Docker Compose
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or Neon account)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo>
cd student-management-system
```

### 2. Environment Configuration

Copy the environment file:
```bash
cp env.example .env
```

Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_management
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
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

### 4. Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

This will start:
- PostgreSQL database on port 5432
- Spring Boot backend on port 8080
- React frontend on port 3000

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:5432

## 🔐 Default Users

The system creates default users on startup:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | admin123 |
| Teacher | teacher@gmail.com | teacher123 |
| Student | student@gmail.com | student123 |

## 🛠️ Development Setup

### Backend Development

```bash
cd backend

# Install dependencies
mvn clean install

# Run tests
mvn test

# Start development server
mvn spring-boot:run
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signup` - Register
- `POST /api/auth/create-admin` - Create admin user

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/all` - Get all users (Admin only)
- `PUT /api/users/{id}/role` - Update user role (Admin only)
- `PUT /api/users/{id}/semester` - Update user semester (Admin only)

### Courses
- `GET /api/courses/all` - Get courses (role-based)
- `POST /api/courses` - Create course (Admin/Teacher)
- `PUT /api/courses/{id}` - Update course (Admin/Teacher)
- `DELETE /api/courses/{id}` - Delete course (Admin only)

### Assignments
- `GET /api/assignments/all` - Get assignments (role-based)
- `POST /api/assignments` - Create assignment (Admin/Teacher)
- `PUT /api/assignments/{id}` - Update assignment (Admin/Teacher)
- `DELETE /api/assignments/{id}` - Delete assignment (Admin only)

### Submissions
- `GET /api/submissions/by-assignment/{id}` - Get submissions for assignment
- `POST /api/submissions` - Submit assignment (Student)
- `PUT /api/submissions/{id}/grade` - Grade submission (Admin/Teacher)

## 🐳 Docker Commands

```bash
# Build all services
docker-compose build

# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend
```

## 🚀 CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:

1. **Test**: Runs backend and frontend tests
2. **Build**: Builds Docker images
3. **Deploy**: Deploys to AWS (placeholder)

### Pipeline Stages:
- ✅ Code checkout
- ✅ Java 17 setup
- ✅ PostgreSQL service
- ✅ Backend tests
- ✅ Node.js setup
- ✅ Frontend tests
- ✅ Docker image builds
- ✅ AWS deployment (placeholder)

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password` (Encrypted)
- `display_name`
- `role` (ADMIN, TEACHER, STUDENT, PARENT)
- `current_semester`
- `created_at`, `updated_at`

### Courses Table
- `id` (Primary Key)
- `title`, `code`, `description`
- `semester`
- `teacher_id` (Foreign Key)
- `created_at`, `updated_at`

### Assignments Table
- `id` (Primary Key)
- `title`, `description`, `instructions`
- `course_id` (Foreign Key)
- `max_points`, `due_date`
- `status` (ACTIVE, INACTIVE, COMPLETED)
- `created_by` (Foreign Key)
- `created_at`, `updated_at`

### Submissions Table
- `id` (Primary Key)
- `assignment_id` (Foreign Key)
- `student_id` (Foreign Key)
- `student_name`, `submission_text`
- `score`, `feedback`
- `status` (SUBMITTED, GRADED, OVERDUE)
- `graded_by` (Foreign Key)
- `submitted_at`, `graded_at`
- `created_at`, `updated_at`

### Enrollments Table
- `id` (Primary Key)
- `student_id` (Foreign Key)
- `course_id` (Foreign Key)
- `status` (ACTIVE, INACTIVE, COMPLETED, DROPPED)
- `enrolled_at`
- `created_at`, `updated_at`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: ADMIN, TEACHER, STUDENT, PARENT roles
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Bean validation annotations
- **SQL Injection Protection**: JPA/Hibernate ORM

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | student_management |
| `DB_USERNAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | password |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRATION` | JWT expiration (ms) | 86400000 |

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
mvn test -Dspring.profiles.active=test
```

## 📈 Monitoring & Logging

- **Application Logs**: Spring Boot logging with SLF4J
- **Database Logs**: PostgreSQL query logging
- **Docker Logs**: Container logs via `docker-compose logs`

## 🚀 Production Deployment

### AWS Deployment (Placeholder)

The CI/CD pipeline includes AWS deployment steps:

1. **ECS Cluster**: Container orchestration
2. **RDS PostgreSQL**: Managed database
3. **Application Load Balancer**: Traffic distribution
4. **CloudWatch**: Monitoring and logging

### Manual Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection credentials
   - Ensure database exists

2. **JWT Token Invalid**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Check token format

3. **Docker Build Failed**
   - Check Docker is running
   - Verify Dockerfile syntax
   - Check available disk space

4. **Frontend API Calls Failed**
   - Check backend is running on port 8080
   - Verify REACT_APP_API_URL is set
   - Check CORS configuration

### Getting Help

- Check the logs: `docker-compose logs -f`
- Verify environment variables
- Test API endpoints with Postman/curl
- Check database connectivity

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Neon Database](https://neon.tech/docs)
