import { Router } from 'express';
import * as c from '../controllers/eventController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/',    authenticate, c.list);
r.get('/:id', authenticate, c.getOne);
r.post('/',        authenticate, requireRole('admin','faculty'), c.create);
r.patch('/:id',    authenticate, requireRole('admin','faculty'), c.update);
r.delete('/:id',   authenticate, requireRole('admin'), c.remove);
r.post('/:id/register',   authenticate, c.register);
r.delete('/:id/register', authenticate, c.unregister);

export default r;
