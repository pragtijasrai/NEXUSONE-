import * as auth from '../services/authService.js';
import { asyncHandler } from '../utils/AppError.js';
export const register = asyncHandler(async (req, res) => res.status(201).json(await auth.register(req.body)));
export const login = asyncHandler(async (req, res) => res.json(await auth.login(req.body)));
export const me = (req, res) => res.json({ user: req.user });
