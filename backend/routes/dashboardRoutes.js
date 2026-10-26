import { Router } from 'express';
import * as c from '../controllers/dashboardController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/student',     authenticate, requireRole('student'),     c.studentDashboard);
r.get('/faculty',     authenticate, requireRole('faculty'),     c.facultyDashboard);
r.get('/admin',       authenticate, requireRole('admin'),       c.adminDashboard);
r.get('/maintenance', authenticate, requireRole('maintenance'), c.maintenanceDashboard);

export default r;
