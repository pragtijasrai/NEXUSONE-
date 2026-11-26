import { Router } from 'express';
import * as c from '../controllers/lostFoundController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/',              authenticate, c.list);
r.get('/:id',           authenticate, c.getOne);
r.post('/',             authenticate, c.create);
r.patch('/:id/status',  authenticate, c.updateStatus);
r.delete('/:id',        authenticate, requireRole('admin'), c.remove);

export default r;
