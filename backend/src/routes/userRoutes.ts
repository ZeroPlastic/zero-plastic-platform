import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { validateBody, validateQuery } from '../utils/validators';
import {
  updateProfileSchema,
  changePasswordSchema,
  listUsersQuerySchema,
  searchUsersQuerySchema,
  updateTierSchema,
} from '../utils/schemas';

// Not seeded in the database yet — admin routes are unreachable until Role rows
// with these keys exist and are assigned via UserRole.
const ADMIN_ROLES = ['SUPER_ADMIN', 'SYSTEM_ADMIN'];

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, validateBody(updateProfileSchema), userController.updateMe);
router.post(
  '/me/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  userController.changePassword,
);

router.get(
  '/search',
  authenticate,
  requireRole(...ADMIN_ROLES),
  validateQuery(searchUsersQuerySchema),
  userController.searchUsers,
);
router.get(
  '/',
  authenticate,
  requireRole(...ADMIN_ROLES),
  validateQuery(listUsersQuerySchema),
  userController.listUsers,
);
router.get('/:userId', authenticate, requireRole(...ADMIN_ROLES), userController.getUserById);
router.post('/:userId/suspend', authenticate, requireRole(...ADMIN_ROLES), userController.suspendUser);
router.post('/:userId/activate', authenticate, requireRole(...ADMIN_ROLES), userController.activateUser);
router.patch(
  '/:userId/tier',
  authenticate,
  requireRole(...ADMIN_ROLES),
  validateBody(updateTierSchema),
  userController.setTier,
);
router.delete('/:userId', authenticate, requireRole(...ADMIN_ROLES), userController.deleteUser);

export default router;
