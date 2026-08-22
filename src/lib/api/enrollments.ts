// src/lib/api/enrollments.ts
import api from "./axios";

// 📦 تایپ‌ها بر اساس بک‌اند
export interface Enrollment {
  id: string;
  eventId: string;
  course_id?: string;
  event: {
    id: string;
    title: string;
    slug: string;
    date: string;
    image?: string;
    price: number;
    duration?: string;
    meetingLink?: string;
  };
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "WAITING" | "ATTENDED";
  createdAt: string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "WAITING_VERIFY";
  meetingLink?: string;
  course?: {
    id: string;
    title: string;
    slug: string;
    date: string;
    image?: string;
    price: number;
    duration?: string;
    meetingLink?: string;
  };
}

// 📦 تایپ برای پیش‌ثبت‌نام (فرم پاپ‌آپ)
export interface CoursePreRegisterData {
  course_id: string;
  field_of_study?: string;
  university?: string;
  has_experience?: boolean;
  experience_level?: string;
  has_laptop?: boolean;
  os_type?: string;
  goal?: string;
  referral_source?: string;
}

// 📦 تایپ برای بروزرسانی وضعیت
export interface EnrollmentStatusUpdate {
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "WAITING";
}

// 📦 تایپ برای لینک جلسه
export interface MeetingLinkData {
  meeting_link: string;
}

export const enrollmentsAPI = {
  /**
   * 📋 دریافت لیست دوره‌های خریداری‌شده کاربر جاری
   * فقط دوره‌هایی که وضعیت CONFIRMED دارند
   * نیازمند احراز هویت
   */
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.get("/enrollments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data || [];
    } catch (error: any) {
      console.error("❌ خطا در دریافت ثبت‌نام‌ها:", error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * 📝 پیش‌ثبت‌نام در دوره (فرم پاپ‌آپ)
   * ایجاد یا بروزرسانی پیش‌ثبت‌نام با وضعیت PENDING
   * نیازمند احراز هویت
   */
  preRegister: async (data: CoursePreRegisterData): Promise<Enrollment> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.post("/enrollments/pre-register", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ خطا در پیش‌ثبت‌نام:", error);
      throw error;
    }
  },

  /**
   * 📊 دریافت لیست ثبت‌نام‌های یک دوره (فقط ادمین)
   * نیازمند احراز هویت ادمین
   */
  getCourseEnrollments: async (
    courseId: string,
    params?: { status?: string },
  ): Promise<Enrollment[]> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.get(`/enrollments/course/${courseId}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data || [];
    } catch (error: any) {
      console.error(`❌ خطا در دریافت ثبت‌نام‌های دوره ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * ✏️ بروزرسانی وضعیت ثبت‌نام (فقط ادمین)
   * PATCH /api/v1/enrollments/{id}/status
   * نیازمند احراز هویت ادمین
   */
  updateStatus: async (
    id: string,
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "WAITING",
  ): Promise<Enrollment> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.patch(
        `/enrollments/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در بروزرسانی وضعیت ${id}:`, error);
      throw error;
    }
  },

  /**
   * 🔗 ثبت لینک جلسه آنلاین (فقط ادمین)
   * POST /api/v1/enrollments/{id}/meeting-link
   * نیازمند احراز هویت ادمین
   */
  setMeetingLink: async (
    id: string,
    meetingLink: string,
  ): Promise<Enrollment> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.post(
        `/enrollments/${id}/meeting-link`,
        { meeting_link: meetingLink },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در ثبت لینک جلسه ${id}:`, error);
      throw error;
    }
  },

  /**
   * 🗑️ حذف/لغو ثبت‌نام (فقط ادمین)
   * DELETE /api/v1/enrollments/{id}
   * نیازمند احراز هویت ادمین
   */
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.delete(`/enrollments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در حذف ثبت‌نام ${id}:`, error);
      throw error;
    }
  },

  /**
   * ❌ لغو ثبت‌نام (برای کاربر)
   * PATCH /api/v1/enrollments/{id}/cancel
   * نیازمند احراز هویت
   */
  cancel: async (id: string): Promise<{ message: string }> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.patch(
        `/enrollments/${id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در لغو ثبت‌نام ${id}:`, error);
      throw error;
    }
  },

  /**
   * 💳 پرداخت برای ثبت‌نام
   * POST /api/v1/enrollments/{id}/pay
   * نیازمند احراز هویت
   */
  processPayment: async (
    enrollmentId: string,
  ): Promise<{ paymentUrl: string; status: string }> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.post(
        `/enrollments/${enrollmentId}/pay`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در پردازش پرداخت ${enrollmentId}:`, error);
      throw error;
    }
  },

  /**
   * 📋 دریافت یک ثبت‌نام خاص
   * GET /api/v1/enrollments/{id}
   * نیازمند احراز هویت
   */
  getById: async (id: string): Promise<Enrollment> => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await api.get(`/enrollments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ خطا در دریافت ثبت‌نام ${id}:`, error);
      throw error;
    }
  },

  // ============================================================
  // ⚠️ متدهای سازگاری با کدهای قبلی
  // ============================================================

  /**
   * ⚠️ سازگاری با کدهای قدیمی - استفاده از preRegister به جای create
   */
  create: async (data: {
    courseId: string;
    formData?: {
      field_of_study?: string;
      university?: string;
      has_experience?: boolean;
      experience_level?: string;
      has_laptop?: boolean;
      os_type?: string;
      goal?: string;
      referral_source?: string;
    };
  }): Promise<Enrollment> => {
    const preRegisterData: CoursePreRegisterData = {
      course_id: data.courseId,
      field_of_study: data.formData?.field_of_study || "",
      university: data.formData?.university || "",
      has_experience: data.formData?.has_experience || false,
      experience_level: data.formData?.experience_level || "",
      has_laptop: data.formData?.has_laptop || false,
      os_type: data.formData?.os_type || "",
      goal: data.formData?.goal || "",
      referral_source: data.formData?.referral_source || "",
    };
    return enrollmentsAPI.preRegister(preRegisterData);
  },

  /**
   * ⚠️ سازگاری با کدهای قدیمی - استفاده از getCourseEnrollments
   */
  getByCourse: async (courseId: string): Promise<Enrollment[]> => {
    return enrollmentsAPI.getCourseEnrollments(courseId);
  },

  /**
   * ⚠️ سازگاری با کدهای قدیمی - استفاده از getMyEnrollments
   */
  getMyCourses: async (): Promise<Enrollment[]> => {
    return enrollmentsAPI.getMyEnrollments();
  },
};
