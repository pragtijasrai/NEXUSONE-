import { z } from 'zod';

export const adminUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  role:   z.enum(['student', 'faculty', 'admin', 'maintenance']).optional(),
}).strict();
