// src/lib/api/enrollments.ts
import api from "./axios";

// 📦 تایپ‌ها بر اساس بک‌اند
// src/types/enrollment.ts
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
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
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
    const token = localStorage.getItem("token") || "";
    const response = await api.get("/enrollments/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * 📝 پیش‌ثبت‌نام در دوره (فرم پاپ‌آپ)
   * ایجاد یا بروزرسانی پیش‌ثبت‌نام با وضعیت PENDING
   * نیازمند احراز هویت
   */
  preRegister: async (data: CoursePreRegisterData): Promise<Enrollment> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post("/enrollments/pre-register", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * 📊 دریافت لیست ثبت‌نام‌های یک دوره (فقط ادمین)
   * نیازمند احراز هویت ادمین
   */
  getCourseEnrollments: async (
    courseId: string,
    params?: { status?: string },
  ): Promise<Enrollment[]> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.get(`/enrollments/course/${courseId}`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * ✏️ بروزرسانی وضعیت ثبت‌نام (فقط ادمین)
   * نیازمند احراز هویت ادمین
   */
  updateStatus: async (
    id: string,
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
  ): Promise<Enrollment> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.patch(
      `/enrollments/${id}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  /**
   * 🔗 ثبت لینک جلسه آنلاین (فقط ادمین)
   * نیازمند احراز هویت ادمین
   */
  setMeetingLink: async (
    id: string,
    meetingLink: string,
  ): Promise<Enrollment> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(
      `/enrollments/${id}/meeting-link`,
      { meeting_link: meetingLink },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  /**
   * 🗑️ حذف/لغو ثبت‌نام
   * فقط کاربر خودش می‌تواند ثبت‌نام خود را لغو کند
   * نیازمند احراز هویت
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.delete(`/enrollments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * 💳 پرداخت برای ثبت‌نام
   * نیازمند احراز هویت
   */
  processPayment: async (
    enrollmentId: string,
  ): Promise<{ paymentUrl: string; status: string }> => {
    const token = localStorage.getItem("token") || "";
    const response = await api.post(
      `/enrollments/${enrollmentId}/pay`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // ============================================================
  // ⚠️ متدهای سازگاری با کدهای قبلی
  // ============================================================

  /**
   * ⚠️ سازگاری با کدهای قدیمی - استفاده از preRegister به جای create
   * ✅ اضافه کردن formData برای ارسال فیلدهای فرم
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
    // ✅ ارسال داده‌های کامل‌تر
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
