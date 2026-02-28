import { Router } from 'express';
import { taskController } from './task.controller';
import { authGuard } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
  taskIdParamSchema,
} from './task.schemas';

const router = Router();

// All task routes require authentication
router.use(authGuard);

router.get(
  '/',
  validate({ query: getTasksQuerySchema }),
  (req, res, next) => taskController.getTasks(req as any, res, next)
);

router.post(
  '/',
  validate({ body: createTaskSchema }),
  (req, res, next) => taskController.createTask(req as any, res, next)
);

router.get(
  '/:id',
  validate({ params: taskIdParamSchema }),
  (req, res, next) => taskController.getTaskById(req as any, res, next)
);

router.patch(
  '/:id',
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  (req, res, next) => taskController.updateTask(req as any, res, next)
);

router.delete(
  '/:id',
  validate({ params: taskIdParamSchema }),
  (req, res, next) => taskController.deleteTask(req as any, res, next)
);

router.patch(
  '/:id/toggle',
  validate({ params: taskIdParamSchema }),
  (req, res, next) => taskController.toggleTaskStatus(req as any, res, next)
);

export default router;
