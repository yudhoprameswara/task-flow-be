import mongoose, { Schema } from 'mongoose';
import { ITaskDocument, TaskStatus } from '../types/interfaces';

const TASK_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'done'];

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Status must be one of: pending, in-progress, done',
      },
      default: 'pending',
    },
    deadline: {
      type: Date,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ user_id: 1, status: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITaskDocument>('Task', TaskSchema);
