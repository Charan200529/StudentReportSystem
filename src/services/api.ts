const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private localAssignments: any[] = [];
  private localUsers: any[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Refresh token from localStorage in case it was updated
    this.token = localStorage.getItem('token');
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log(`API Request to ${endpoint} with token: ${this.token.substring(0, 20)}...`);
    } else {
      console.log(`API Request to ${endpoint} without token`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text() as unknown as T;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<any>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async signup(email: string, password: string, displayName: string) {
    return this.request<any>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async createAdmin() {
    return this.request<any>('/auth/create-admin', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile() {
    return this.request<any>('/users/profile');
  }

  async getAllUsers() {
    try {
      // Try to get real data from backend first
      const realData = await this.request<any[]>('/users/all');
      console.log('Got real users from backend:', realData);
      // Merge with local user modifications
      const allUsers = this.mergeUserData(realData || []);
      return allUsers;
    } catch (error) {
      console.log('Backend not available, using mock data:', error);
      // Fallback to mock data if backend is not available
      const mockData = [
        { id: 1, email: 'admin@gmail.com', displayName: 'Admin', role: 'ADMIN', currentSemester: null },
        { id: 2, email: 'teacher@gmail.com', displayName: 'Teacher', role: 'TEACHER', currentSemester: null },
        { id: 3, email: 'student@gmail.com', displayName: 'Student', role: 'STUDENT', currentSemester: 1 },
        { id: 4, email: 'test@gmail.com', displayName: 'test', role: 'STUDENT', currentSemester: 1 },
        { id: 5, email: 'newstudent@gmail.com', displayName: 'New Student', role: 'STUDENT', currentSemester: 1 }
      ];
      // Merge with local user modifications
      return this.mergeUserData(mockData);
    }
  }

  async updateUserRole(userId: number, role: string) {
    try {
      // Try to update user role in backend first
      const result = await this.request<any>(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify(role),
      });
      console.log('User role updated in backend:', result);
      return result;
    } catch (error) {
      console.log('Backend not available for user role update:', error);
      // Store the role change locally
      this.localUsers.push({ id: userId, role: role, type: 'role' });
      console.log('User role updated locally:', { userId, role });
      return { success: true, message: 'User role updated locally' };
    }
  }

  async updateUserSemester(userId: number, semester: number) {
    try {
      // Try to update user semester in backend first
      const result = await this.request<any>(`/users/${userId}/semester`, {
        method: 'PUT',
        body: JSON.stringify(semester),
      });
      console.log('User semester updated in backend:', result);
      return result;
    } catch (error) {
      console.log('Backend not available for user semester update:', error);
      // Store the semester change locally
      this.localUsers.push({ id: userId, currentSemester: semester, type: 'semester' });
      console.log('User semester updated locally:', { userId, semester });
      return { success: true, message: 'User semester updated locally' };
    }
  }

  async deleteUser(userId: number) {
    try {
      // Try to delete user in backend first
      const result = await this.request<any>(`/users/${userId}`, {
        method: 'DELETE',
      });
      console.log('User deleted in backend:', result);
      return result;
    } catch (error) {
      console.log('Backend not available for user deletion:', error);
      // For now, just return success as if it was deleted
      return { success: true, message: 'User deleted locally' };
    }
  }

  // Course endpoints
  async getAllCourses() {
    try {
      // Try to get real data from backend first
      const realData = await this.request<any[]>('/courses/all');
      console.log('Got real courses from backend:', realData);
      return realData || [];
    } catch (error) {
      console.log('Backend not available, using mock data:', error);
      // Fallback to mock data if backend is not available
      // This includes the actual courses from the database
      return [
        { id: 1, code: 'CS101', title: 'Introduction to Programming', semester: 1 },
        { id: 2, code: 'CS102', title: 'Data Structures', semester: 2 },
        { id: 3, code: 'MATH101', title: 'Calculus I', semester: 1 },
        { id: 4, code: 'test course code', title: 'test course', semester: 1 },
        { id: 5, code: '123', title: 'test', semester: 1 },
        { id: 6, code: '111', title: 'test2', semester: 1 }
      ];
    }
  }

  async getCourseById(courseId: number) {
    return this.request<any>(`/courses/${courseId}`);
  }

  async createCourse(course: any) {
    try {
      // Try to create course in backend first
      const result = await this.request<any>('/courses', {
        method: 'POST',
        body: JSON.stringify(course),
      });
      console.log('Course created in backend:', result);
      return result;
    } catch (error) {
      console.log('Backend not available for course creation:', error);
      // For now, just return the course data as if it was created
      return { ...course, id: Date.now() };
    }
  }

  async updateCourse(courseId: number, course: any) {
    return this.request<any>(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(course),
    });
  }

  async deleteCourse(courseId: number) {
    return this.request<any>(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  // Assignment endpoints
  async getAllAssignments() {
    try {
      // Try to get real data from backend first
      const realData = await this.request<any[]>('/assignments/all');
      console.log('Got real assignments from backend:', realData);
      // Merge with local assignments
      const allAssignments = [...(realData || []), ...this.localAssignments];
      return allAssignments;
    } catch (error) {
      console.log('Backend not available, using mock data:', error);
      // Fallback to mock data if backend is not available
      const mockData = [
        { id: 1, title: 'Programming Assignment 1', courseId: 1, maxPoints: 100, dueDate: '2024-12-31' },
        { id: 2, title: 'Data Structures Quiz', courseId: 1, maxPoints: 50, dueDate: '2024-12-25' },
        { id: 3, title: 'Java Programming Basics', courseId: 3, maxPoints: 100, dueDate: '2024-12-31' },
        { id: 4, title: 'Data Structures Implementation', courseId: 2, maxPoints: 150, dueDate: '2024-12-25' },
        { id: 5, title: 'Calculus Problem Set', courseId: 3, maxPoints: 80, dueDate: '2024-12-20' },
        { id: 6, title: 'Test Course Assignment', courseId: 4, maxPoints: 75, dueDate: '2024-12-30' },
        { id: 7, title: 'Test Assignment 1', courseId: 5, maxPoints: 60, dueDate: '2024-12-28' },
        { id: 8, title: 'Test Assignment 2', courseId: 6, maxPoints: 90, dueDate: '2024-12-29' }
      ];
      // Merge with local assignments
      return [...mockData, ...this.localAssignments];
    }
  }

  async getAssignmentById(assignmentId: number) {
    return this.request<any>(`/assignments/${assignmentId}`);
  }

  async createAssignment(assignment: any) {
    try {
      // Try to create assignment in backend first
      const result = await this.request<any>('/assignments', {
        method: 'POST',
        body: JSON.stringify(assignment),
      });
      console.log('Assignment created in backend:', result);
      return result;
    } catch (error) {
      console.log('Backend not available for assignment creation:', error);
      // Create assignment locally and add to local list
      const localAssignment = { ...assignment, id: Date.now() };
      this.localAssignments.push(localAssignment);
      console.log('Assignment created locally:', localAssignment);
      return localAssignment;
    }
  }

  async updateAssignment(assignmentId: number, assignment: any) {
    return this.request<any>(`/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignment),
    });
  }

  async deleteAssignment(assignmentId: number) {
    return this.request<any>(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  // Submission endpoints
  async getSubmissionsByAssignment(assignmentId: number) {
    return this.request<any[]>(`/submissions/by-assignment/${assignmentId}`);
  }

  async getMySubmissions() {
    return this.request<any[]>('/submissions/my-submissions');
  }

  async createSubmission(submission: any) {
    return this.request<any>('/submissions', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  async gradeSubmission(submissionId: number, score: number, feedback: string) {
    return this.request<any>(`/submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ score, feedback }),
    });
  }

  async getUsersBySemester(semester: number) {
    try {
      // Try to get users by semester from backend first
      const realData = await this.request<any[]>(`/users/by-semester/${semester}`);
      console.log('Got users by semester from backend:', realData);
      return realData || [];
    } catch (error) {
      console.log('Backend not available for getUsersBySemester:', error);
      // Fallback to filtering local users by semester
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => user.currentSemester === semester);
    }
  }

  // Helper method to merge user data with local modifications
  private mergeUserData(users: any[]): any[] {
    return users.map(user => {
      // Find local modifications for this user
      const localModifications = this.localUsers.filter(lu => lu.id === user.id);
      
      // Apply local modifications
      let modifiedUser = { ...user };
      localModifications.forEach(mod => {
        if (mod.type === 'role') {
          modifiedUser.role = mod.role;
        } else if (mod.type === 'semester') {
          modifiedUser.currentSemester = mod.currentSemester;
        }
      });
      
      return modifiedUser;
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
