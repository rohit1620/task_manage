export type Role = 'admin' | 'manager' | 'employee';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  department: string;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  assigned_by: string | null;
  due_date: string | null;
  completed_at: string | null;
  notes: string;
  created_at: string;
  assignee?: Profile;
  assigner?: Profile;
}

export type Page = 'dashboard' | 'tasks' | 'users' | 'profile';
