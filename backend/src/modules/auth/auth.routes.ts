import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from './auth.schemas';

const router = Router();

router.post(
  '/register',
  validate({ body: registerSchema }),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validate({ body: loginSchema }),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validate({ body: refreshSchema }),
  authController.refresh.bind(authController)
);

router.post(
  '/logout',
  validate({ body: refreshSchema }),
  authController.logout.bind(authController)
);

export default router;
