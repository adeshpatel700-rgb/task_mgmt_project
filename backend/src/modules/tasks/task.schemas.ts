import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const getTasksQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default('20')
    .transform(Number)
    .pipe(z.number().int().positive().max(100)),
  cursor: z.string().uuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  search: z.string().optional(),
});

export const taskIdParamSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
