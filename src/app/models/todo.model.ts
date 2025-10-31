export type TodoStatusFilter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  dueDate?: string;
}
