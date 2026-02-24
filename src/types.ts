export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  isOptimistic?: boolean;
}

export type Filter = 'all' | 'active' | 'completed';

export type FormState = {
  error: string | null;
  lastAdded: string | null;
};
