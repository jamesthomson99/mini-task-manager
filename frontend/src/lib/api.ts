import { AuthResponse, LoginForm, RegisterForm, Task, TaskCreate, TaskUpdate, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
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
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  // Authentication
  async register(userData: RegisterForm): Promise<User> {
    return this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.token = response.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Tasks CRUD
  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/api/tasks/');
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/api/tasks/${id}`);
  }

  async createTask(task: TaskCreate): Promise<Task> {
    return this.request<Task>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: TaskUpdate): Promise<Task> {
    return this.request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskStatus(id: string): Promise<Task> {
    return this.request<Task>(`/api/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
