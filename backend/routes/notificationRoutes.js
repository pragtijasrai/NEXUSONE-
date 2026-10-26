import { Router } from 'express';
import * as c from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const r = Router();

r.get('/',               authenticate, c.list);
r.patch('/read-all',     authenticate, c.markAllRead);
r.patch('/:id/read',     authenticate, c.markRead);

export default r;
