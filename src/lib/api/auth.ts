// src/lib/api/auth.ts
import api from "./axios";

export const authAPI = {
  // ============================================================
  // 📱 OTP (یکسان برای همه)
  // ============================================================

  /**
   * 📱 ارسال کد OTP به شماره همراه
   * POST /api/v1/users/request-otp
   */
  requestOTP: async (phone: string) => {
    try {
      const response = await api.post("/users/request-otp", { phone });
      console.log("✅ کد OTP ارسال شد:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در ارسال OTP:", error);
      throw error;
    }
  },

  /**
   * ✅ تایید کد OTP و ورود/ثبت‌نام
   * POST /api/v1/users/verify-otp
   */
  verifyOTP: async (phone: string, code: string) => {
    try {
      const response = await api.post("/users/verify-otp", { phone, code });
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("phone", phone);
      }
      console.log("✅ OTP تایید شد:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در تایید OTP:", error);
      throw error;
    }
  },

  /**
   * 🔄 بازیابی/تغییر رمز عبور با OTP
   * POST /api/v1/users/reset-password-otp
   */
  resetPasswordWithOTP: async (
    phone: string,
    code: string,
    newPassword: string,
  ) => {
    try {
      const response = await api.post("/users/reset-password-otp", {
        phone,
        code,
        new_password: newPassword,
      });
      console.log("✅ رمز عبور با OTP تغییر کرد:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در تغییر رمز با OTP:", error);
      throw error;
    }
  },

  // ============================================================
  // 👤 کاربر عادی
  // ============================================================

  /**
   * 📝 ثبت‌نام کاربر جدید با رمز عبور
   * POST /api/v1/users/register
   */
  registerUser: async (data: {
    phone: string;
    name: string;
    password: string;
    email?: string;
  }) => {
    try {
      const response = await api.post("/users/register", data);
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("phone", data.phone);
      }
      console.log("✅ ثبت‌نام موفق:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در ثبت‌نام:", error);
      throw error;
    }
  },

  /**
   * 🔑 ورود کاربر عادی با رمز عبور
   * POST /api/v1/users/login
   */
  loginUser: async (data: { phone: string; password: string }) => {
    try {
      const response = await api.post("/users/login", data);
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("phone", data.phone);
      }
      console.log("✅ ورود موفق:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در ورود:", error);
      throw error;
    }
  },

  // ============================================================
  // 👤 پروفایل
  // ============================================================

  getProfile: async () => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      console.error("❌ خطا در دریافت پروفایل:", error);
      throw error;
    }
  },

  updateProfile: async (data: any) => {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "province",
      "birthDate",
      "gender",
      "avatar",
    ];
    const filteredData: any = {};

    for (const key of allowedFields) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
        filteredData[key] = data[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return { message: "هیچ تغییری اعمال نشد" };
    }

    try {
      const response = await api.patch("/users/me", filteredData);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در بروزرسانی پروفایل:", error);
      throw error;
    }
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    try {
      const response = await api.post("/users/me/change-password", data);
      return response.data;
    } catch (error) {
      console.error("❌ خطا در تغییر رمز عبور:", error);
      throw error;
    }
  },

  // ============================================================
  // 🚪 خروج
  // ============================================================

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("phone");
    window.location.href = "/login";
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
