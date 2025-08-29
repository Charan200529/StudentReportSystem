# 🚀 Quick Start Guide

Get the Student Management System running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable these services:
   - Authentication (Email/Password)
   - Realtime Database

### 3. Get Firebase Config
1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web app icon (</>)
4. Copy the config object

### 4. Environment Setup
```bash
cp env.example .env.local
```
Edit `.env.local` and paste your Firebase config values.

### 5. Deploy Security Rules
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select your project)
firebase init

# Deploy security rules
firebase deploy --only database
```

### 6. Start Development Server
```bash
npm run dev
```

🎉 **Your app is now running at http://localhost:3000!**

## 🔐 Test Accounts

### Admin User
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: ADMIN

### Teacher User
- **Email**: teacher@example.com
- **Password**: teacher123
- **Role**: TEACHER

### Student User
- **Email**: student@example.com
- **Password**: student123
- **Role**: STUDENT

## 🧪 Testing Features

### 1. Authentication
- Try logging in with different roles
- Test signup functionality
- Test password reset

### 2. Role-Based Access
- Login as Admin → Access all features
- Login as Teacher → Course management
- Login as Student → Course enrollment
- Login as Parent → Student monitoring

### 3. Core Features
- Create courses (Admin/Teacher)
- Post assignments (Teacher)
- Submit assignments (Student)
- View grades (Student/Parent)
- Manage users (Admin)

## 🚨 Common Issues

### Firebase Connection Error
- Check your `.env.local` file
- Ensure Firebase services are enabled
- Verify project ID matches

### Permission Denied
- Deploy security rules: `firebase deploy --only database`
- Check Firebase Console for rule errors

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

## 📱 Next Steps

1. **Customize**: Update branding and colors
2. **Extend**: Add new features and pages
3. **Build**: Run `npm run build` for production
4. **Scale**: Add more users and courses

## 🆘 Need Help?

- Check the [main README](README.md)
- Review Firebase documentation
- Create an issue in the repository

---

**Happy coding! 🎓**
