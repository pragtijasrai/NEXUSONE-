/**
 * Timetable service — API calls for student academic schedule.
 *
 * Endpoints:
 *   GET /timetable    — weekly class schedule
 *   GET /attendance   — per-subject attendance summary + history
 *   GET /courses      — enrolled courses
 */

import { api } from './apiClient.js';

export const getTimetable  = () => api('/timetable').then(r => r.data);
export const getAttendance  = () => api('/attendance').then(r => r.data);
export const getCourses     = () => api('/courses').then(r => r.data);
