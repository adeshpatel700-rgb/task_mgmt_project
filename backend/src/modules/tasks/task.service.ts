import { TaskStatus, Task } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateTaskInput, UpdateTaskInput, GetTasksQuery } from './task.schemas';

interface GetTasksResult {
  tasks: Task[];
  nextCursor: string | null;
  hasMore: boolean;
}

export class TaskService {
  async getTasks(userId: string, query: GetTasksQuery): Promise<GetTasksResult> {
    const { limit, cursor, status, search } = query;

    // Build where clause
    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Fetch tasks with cursor pagination
    const tasks = await prisma.task.findMany({
      where,
      take: limit + 1, // Fetch one extra to determine if there are more
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1, // Skip the cursor itself
      }),
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Determine if there are more results
    const hasMore = tasks.length > limit;
    const resultsToReturn = hasMore ? tasks.slice(0, limit) : tasks;
    const nextCursor = hasMore ? resultsToReturn[resultsToReturn.length - 1].id : null;

    return {
      tasks: resultsToReturn,
      nextCursor,
      hasMore,
    };
  }

  async getTaskById(taskId: string, userId: string): Promise<Task> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    return task;
  }

  async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
        userId,
      },
    });

    return task;
  }

  async updateTask(taskId: string, userId: string, input: UpdateTaskInput): Promise<Task> {
    // Check if task exists and belongs to user
    await this.getTaskById(taskId, userId);

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: input,
    });

    return task;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    // Check if task exists and belongs to user
    await this.getTaskById(taskId, userId);

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  }

  async toggleTaskStatus(taskId: string, userId: string): Promise<Task> {
    const task = await this.getTaskById(taskId, userId);

    // Cycle through statuses: TODO -> IN_PROGRESS -> DONE -> TODO
    let newStatus: TaskStatus;
    switch (task.status) {
      case TaskStatus.TODO:
        newStatus = TaskStatus.IN_PROGRESS;
        break;
      case TaskStatus.IN_PROGRESS:
        newStatus = TaskStatus.DONE;
        break;
      case TaskStatus.DONE:
        newStatus = TaskStatus.TODO;
        break;
      default:
        newStatus = TaskStatus.TODO;
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: newStatus,
      },
    });

    return updatedTask;
  }
}

export const taskService = new TaskService();
