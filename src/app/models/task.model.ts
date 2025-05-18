import { User } from "./user.model";

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: 'pendiente' | 'en progreso' | 'completada';
  due_date: string; // formato ISO
  user_id: number;
  User?: User;
}
