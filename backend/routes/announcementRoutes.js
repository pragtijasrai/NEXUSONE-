import { Router } from 'express';
import * as c from '../controllers/announcementController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/',    authenticate, c.list);
r.get('/:id', authenticate, c.getOne);
r.post('/',       authenticate, requireRole('admin','faculty'), c.create);
r.patch('/:id',   authenticate, requireRole('admin','faculty'), c.update);
r.delete('/:id',  authenticate, requireRole('admin'), c.remove);

export default r;
