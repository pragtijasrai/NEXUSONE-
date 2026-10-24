import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import * as users from '../models/userModel.js';
const sign = (u) => jwt.sign({ sub: u.id, role: u.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const publicUser = ({ id, name, email, role, status }) => ({ id, name, email, role, status });
export async function register({ name, email, password, role }) {
  if (await users.findByEmail(email)) throw new AppError(409, 'Email already registered', 'EMAIL_TAKEN');
  const user = await users.create({ name, email, role, passwordHash: await bcrypt.hash(password, 12) });
  return { user: publicUser(user), token: sign(user) };
}
export async function login({ email, password }) {
  const user = await users.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new AppError(401, 'Invalid email or password', 'BAD_CREDENTIALS');
  if (user.status !== 'active') throw new AppError(403, 'Account deactivated', 'DEACTIVATED');
  return { user: publicUser(user), token: sign(user) };
}
