export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: 'pending' | 'completed';
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
}
