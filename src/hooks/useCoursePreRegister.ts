// src/hooks/useCoursePreRegister.ts
import { useState } from "react";
import { enrollmentsAPI, type CoursePreRegisterData } from "../lib/api/enrollments";

export function useCoursePreRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const preRegister = async (data: CoursePreRegisterData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await enrollmentsAPI.preRegister(data);
      setSuccess(true);
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.detail || "خطا در ثبت اطلاعات";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { preRegister, loading, error, success };
}