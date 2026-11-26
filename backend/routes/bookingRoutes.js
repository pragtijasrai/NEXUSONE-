import { Router } from 'express';
import * as c from '../controllers/bookingController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/me',           authenticate, c.myBookings);
r.get('/',             authenticate, requireRole('admin'), c.allBookings);
r.post('/',            authenticate, c.create);
r.patch('/:id/cancel', authenticate, c.cancel);
r.patch('/:id/admin-cancel', authenticate, requireRole('admin'), c.adminCancel);

export default r;
