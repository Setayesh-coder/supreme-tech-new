// src/components/layout/Layout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "../sections/Footer";
import { statsAPI } from "../../lib/api";

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    // ثبت بازدید صفحه
    const trackPageView = async () => {
      try {
        await statsAPI.trackView({ path: location.pathname });
      } catch (error) {
        // خطا را نادیده بگیر (برای کاربر مهم نیست)
        console.debug("View tracking skipped:", error);
      }
    };
    trackPageView();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
