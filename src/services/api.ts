const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

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

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
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
    return this.request<any[]>('/users/all');
  }

  async updateUserRole(userId: number, role: string) {
    return this.request<any>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify(role),
    });
  }

  async updateUserSemester(userId: number, semester: number) {
    return this.request<any>(`/users/${userId}/semester`, {
      method: 'PUT',
      body: JSON.stringify(semester),
    });
  }

  async deleteUser(userId: number) {
    return this.request<any>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Course endpoints
  async getAllCourses() {
    return this.request<any[]>('/courses/all');
  }

  async getCourseById(courseId: number) {
    return this.request<any>(`/courses/${courseId}`);
  }

  async createCourse(course: any) {
    return this.request<any>('/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
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
    return this.request<any[]>('/assignments/all');
  }

  async getAssignmentById(assignmentId: number) {
    return this.request<any>(`/assignments/${assignmentId}`);
  }

  async createAssignment(assignment: any) {
    return this.request<any>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
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
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
