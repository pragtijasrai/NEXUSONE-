/**
 * Timetable controller — thin HTTP layer over timetableModel.
 *
 * Endpoints:
 *   GET /timetable    — student's weekly class schedule
 *   GET /attendance   — student's per-subject attendance summary + history
 *   GET /courses      — student's enrolled courses with faculty info
 */

import * as tt from '../models/timetableModel.js';
import { asyncHandler } from '../utils/AppError.js';

export const getTimetable = asyncHandler(async (req, res) => {
  const sessions = await tt.getStudentTimetable(req.user.sub);
  res.json({
    success: true,
    message: 'Timetable retrieved',
    data: { sessions },
  });
});

export const getAttendance = asyncHandler(async (req, res) => {
  const result = await tt.getStudentAttendance(req.user.sub);
  res.json({
    success: true,
    message: 'Attendance retrieved',
    data: result,
  });
});

export const getCourses = asyncHandler(async (req, res) => {
  const courses = await tt.getStudentCourses(req.user.sub);
  res.json({
    success: true,
    message: 'Courses retrieved',
    data: { courses },
  });
});
