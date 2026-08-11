import api from './axios';

export const coursesAPI = {
  // دریافت همه دوره‌ها
  getAll: (params?: { eventId?: string; limit?: number; page?: number; isActive?: boolean }) =>
    api.get('/courses', { params }),

  // دریافت دوره با slug
  getBySlug: (slug: string) =>
    api.get(`/courses/slug/${slug}`),

  // دریافت دوره با ID
  getById: (id: string) =>
    api.get(`/courses/${id}`),

  // دریافت دوره‌های یک رویداد
  getByEvent: (eventId: string) =>
    api.get('/courses', { params: { eventId } }),

  // ایجاد دوره جدید (ادمین)
  create: (data: any) =>
    api.post('/courses', data),

  // بروزرسانی دوره (ادمین)
  update: (id: string, data: any) =>
    api.put(`/courses/${id}`, data),

  // حذف دوره (ادمین)
  delete: (id: string) =>
    api.delete(`/courses/${id}`),

  // ثبت‌نام در دوره
  enroll: (courseId: string) =>
    api.post(`/courses/${courseId}/enroll`),

  // دریافت ثبت‌نام‌های دوره (ادمین)
  getEnrollments: (courseId: string) =>
    api.get(`/courses/${courseId}/enrollments`),
};
