// User roles
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

// User interface
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  roles: UserRole[];
  currentSemester?: number; // 1-8 for BTech etc.
  parentOf?: string[]; // Array of student UIDs
  teacherCourses?: string[]; // Array of course IDs
  createdAt: Date;
  updatedAt: Date;
}

// Course interface
export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  teacherUid: string;
  term: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment status
export type EnrollmentStatus = 'ACTIVE' | 'DROPPED' | 'PENDING';

// Enrollment interface
export interface Enrollment {
  id: string;
  courseId: string;
  studentUid: string;
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Assignment interface
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  dueAt: Date;
  maxPoints: number;
  attachments: string[]; // File URLs or references
  createdAt: Date;
  updatedAt: Date;
}

// Submission interface
export interface Submission {
  id: string;
  assignmentId: string;
  studentUid: string;
  files: string[]; // File URLs or references
  submittedAt: Date;
  score?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
}

// Announcement interface
export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  message: string;
  postedAt: Date;
  postedBy: string;
}

// Audit log interface
export interface AuditLog {
  id: string;
  actorUid: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  before?: any;
  after?: any;
}

// Parent-Student link interface
export interface ParentStudentLink {
  id: string;
  parentUid: string;
  studentUid: string;
  verified: boolean;
  createdAt: Date;
}

// Course summary for performance optimization
export interface CourseSummary {
  id: string;
  title: string;
  code: string;
  teacherUid: string;
  studentCount: number;
  assignmentCount: number;
  lastActivity: Date;
}

// User course role for quick access
export interface UserCourseRole {
  uid: string;
  courseId: string;
  role: 'TEACHER' | 'STUDENT';
  enrolledAt: Date;
}

// Form data interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  displayName: string;
}

export interface CourseFormData {
  title: string;
  code: string;
  description: string;
  term: string;
}

export interface AssignmentFormData {
  title: string;
  instructions: string;
  dueAt: string;
  maxPoints: number;
}

export interface SubmissionFormData {
  files: File[];
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  startAfter?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextPage?: any;
}
