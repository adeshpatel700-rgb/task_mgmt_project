import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { taskService } from './task.service';
import { CreateTaskInput, UpdateTaskInput, GetTasksQuery, TaskIdParam } from './task.schemas';

export class TaskController {
  async getTasks(
    req: AuthenticatedRequest<unknown, unknown, unknown, GetTasksQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await taskService.getTasks(userId, req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(
    req: AuthenticatedRequest<TaskIdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const task = await taskService.getTaskById(req.params.id, userId);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(
    req: AuthenticatedRequest<unknown, unknown, CreateTaskInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const task = await taskService.createTask(userId, req.body);

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(
    req: AuthenticatedRequest<TaskIdParam, unknown, UpdateTaskInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const task = await taskService.updateTask(req.params.id, userId, req.body);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(
    req: AuthenticatedRequest<TaskIdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      await taskService.deleteTask(req.params.id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async toggleTaskStatus(
    req: AuthenticatedRequest<TaskIdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const task = await taskService.toggleTaskStatus(req.params.id, userId);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
