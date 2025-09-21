import { User, UserRole } from '@/types';

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user || !Array.isArray(user.roles)) return false;
  return user.roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user || !Array.isArray(user.roles)) return false;
  return roles.some(role => user.roles!.includes(role));
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(user: User | null, roles: UserRole[]): boolean {
  if (!user || !Array.isArray(user.roles)) return false;
  return roles.every(role => user.roles!.includes(role));
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'ADMIN');
}

/**
 * Check if a user is a teacher
 */
export function isTeacher(user: User | null): boolean {
  return hasRole(user, 'TEACHER');
}

/**
 * Check if a user is a student
 */
export function isStudent(user: User | null): boolean {
  return hasRole(user, 'STUDENT');
}

/**
 * Check if a user is a parent
 */
export function isParent(user: User | null): boolean {
  return hasRole(user, 'PARENT');
}

/**
 * Check if a user can access admin features
 */
export function canAccessAdmin(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN']);
}

/**
 * Check if a user can manage courses
 */
export function canManageCourses(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'TEACHER']);
}

/**
 * Check if a user can view course content
 */
export function canViewCourseContent(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']);
}

/**
 * Check if a user can create assignments
 */
export function canCreateAssignments(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'TEACHER']);
}

/**
 * Check if a user can grade submissions
 */
export function canGradeSubmissions(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'TEACHER']);
}

/**
 * Check if a user can manage enrollments
 */
export function canManageEnrollments(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'TEACHER']);
}

/**
 * Check if a user can view audit logs
 */
export function canViewAuditLogs(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'TEACHER']);
}

/**
 * Get the highest priority role for a user
 */
export function getHighestRole(user: User | null): UserRole | null {
  if (!user || !Array.isArray(user.roles) || user.roles.length === 0) return null;
  
  const rolePriority: Record<UserRole, number> = {
    'ADMIN': 4,
    'TEACHER': 3,
    'STUDENT': 2,
    'PARENT': 1,
  };

  return user.roles.reduce((highest, current) => {
    return rolePriority[current] > rolePriority[highest] ? current : highest;
  });
}

/**
 * Check if a user can access a specific resource based on ownership
 */
export function canAccessResource(
  user: User | null, 
  resourceOwnerId: string, 
  requiredRoles: UserRole[] = []
): boolean {
  if (!user) return false;
  
  // Check if user has required roles
  if (requiredRoles.length > 0 && !hasAnyRole(user, requiredRoles)) {
    return false;
  }
  
  // Admin can access everything
  if (isAdmin(user)) return true;
  
  // User can access their own resources
  if (user.uid === resourceOwnerId) return true;
  
  return false;
}

/**
 * Check if a teacher can access a specific course
 */
export function canTeacherAccessCourse(
  user: User | null, 
  courseTeacherId: string
): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (isAdmin(user)) return true;
  
  // Teacher can access their own courses
  if (isTeacher(user) && user.uid === courseTeacherId) return true;
  
  return false;
}

/**
 * Check if a parent can access student data
 */
export function canParentAccessStudent(
  user: User | null, 
  studentId: string
): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (isAdmin(user)) return true;
  
  // Parent can access linked student data
  if (isParent(user) && user.parentOf?.includes(studentId)) return true;
  
  return false;
}
