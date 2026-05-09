import { Document, Types } from 'mongoose';

// ─── JWT ──────────────────────────────────────────────────────────────────────

export interface ITokenPayload {
  userId: string;
  email: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'in-progress' | 'done';

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: Date;
  user_id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskDocument extends ITask, Document {
  _id: Types.ObjectId;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  stats?: {
    total: number;
    pending: number;
    'in-progress': number;
    done: number;
  };
}
