import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(2, 'Title must be at least 2 characters')
      .max(200, 'Title must not exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),
    status: z
      .enum(['pending', 'in-progress', 'done'], {
        errorMap: () => ({ message: 'Status must be: pending, in-progress, or done' }),
      })
      .default('pending'),
    deadline: z
      .string()
      .datetime({ message: 'Deadline must be a valid ISO date string' })
      .optional()
      .or(z.literal('')),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, 'Title must be at least 2 characters')
      .max(200, 'Title must not exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),
    status: z
      .enum(['pending', 'in-progress', 'done'], {
        errorMap: () => ({ message: 'Status must be: pending, in-progress, or done' }),
      })
      .optional(),
    deadline: z
      .string()
      .datetime({ message: 'Deadline must be a valid ISO date string' })
      .optional()
      .nullable(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
