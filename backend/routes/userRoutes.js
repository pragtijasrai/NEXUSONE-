/**
 * User management routes — admin only.
 *
 * GET    /users          — paginated list with filters
 * GET    /users/:id      — single user
 * PATCH  /users/:id      — update status / role
 * DELETE /users/:id      — delete user
 *
 * Syllabus:
 *   - CRUD REST API (Syllabus C)
 *   - Role-based authorization (Syllabus D)
 *   - Pagination (Syllabus C & G)
 */

import { Router } from 'express';
import * as c from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminUpdateSchema } from '../validators/userValidator.js';

const r = Router();

/* All user management routes require authentication + admin role */
r.use(authenticate, requireRole('admin'));

r.get('/',    c.list);
r.get('/:id', c.getOne);
r.patch('/:id', validate(adminUpdateSchema), c.update);
r.delete('/:id', c.remove);

export default r;
