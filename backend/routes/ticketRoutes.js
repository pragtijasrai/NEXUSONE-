import { Router } from 'express';
import * as c from '../controllers/ticketController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/',    authenticate, c.list);
r.get('/:id', authenticate, c.getOne);
r.post('/',                    authenticate, c.create);
r.patch('/:id/status',         authenticate, c.updateStatus);
r.patch('/:id/assign',         authenticate, requireRole('admin'), c.assign);

export default r;
