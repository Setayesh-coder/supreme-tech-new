// src/App.tsx - نسخه کامل با QueryClientProvider
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SettingsProvider } from "./contexts/SettingsContext";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/Toaster";

// Layouts
import Layout from "./components/layout/Layout";

// Pages - Public
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ServicesPage from "./pages/Services";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import ApproachPage from "./pages/Approach";
import BlogList from "./pages/public/BlogList";
import BlogPost from "./pages/public/BlogPost";
import Events from "./pages/public/Events";
import EventDetail from "./pages/public/EventDetail";
import CourseDetail from "./pages/public/CourseDetail";
import Profile from "./pages/Profile/Profile";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import TicketDetail from "./pages/TicketDetail";
import TicketCreate from "./pages/TicketCreate";
import AccessDenied from "./pages/AccessDenied";

// Admin
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import BlogListAdmin from "./pages/admin/Blog/BlogList";
import BlogCreate from "./pages/admin/Blog/BlogCreate";
import BlogEdit from "./pages/admin/Blog/BlogEdit";
import CourseList from "./pages/admin/Courses/CourseList";
import OrdersList from "./pages/admin/Payments/OrdersList";
import CourseCreate from "./pages/admin/Courses/CourseCreate";
import CourseEdit from "./pages/admin/Courses/CourseEdit";
import CourseEnrollments from "./pages/admin/Courses/CourseEnrollments";
import EventList from "./pages/admin/Events/EventList";
import EventCreate from "./pages/admin/Events/EventCreate";
import EventEdit from "./pages/admin/Events/EventEdit";
import EventEnrollments from "./pages/admin/Events/EventEnrollments";
import UserList from "./pages/admin/Users/UserList";
import TeamList from "./pages/admin/Team/TeamList";
import HeroList from "./pages/admin/Hero/HeroList";
import Settings from "./pages/admin/Settings/Settings";
import PartnerCreate from "./pages/admin/Partners/PartnerCreate";
import PartnerEdit from "./pages/admin/Partners/PartnerEdite";
import PartnerList from "./pages/admin/Partners/PartnersList";
import EmployeeList from "./pages/admin/Employees/EmployeeList";
import EmployeeCreate from "./pages/admin/Employees/EmployeeCreate";
import EmployeeEdit from "./pages/admin/Employees/EmployeeEdit";
import AdminProfile from "./pages/admin/Profile";
import HeroEdit from "./pages/admin/Hero/HeroEdit";
import HeroCreate from "./pages/admin/Hero/HeroCreate";
import TicketGroupCreate from "./components/admin/Tickets/TicketGroupCreate";
import TicketCreateAdmin from "./components/admin/Tickets/TicketCreate";
import TicketList from "./components/admin/Tickets/TicketList";
import MessageList from "./components/admin/Messages/MessageList";
import Help from "./pages/admin/Help";
import CouponsManager from "./pages/admin/Copuns/CouponsManager";

// Components
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// ✅ تنظیم QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقیقه
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Toaster />
        <SettingsProvider>
          <BrowserRouter>
            <Routes>
              {/* ============================================================
                عمومی (با Layout)
                ============================================================ */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/approach" element={<ApproachPage />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route path="/courses/:slug" element={<CourseDetail />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="/tickets/create" element={<TicketCreate />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* ============================================================
                Admin
                ============================================================ */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Navigate to="/admin/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* بلاگ */}
              <Route
                path="/admin/blog"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <BlogListAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/blog/create"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <BlogCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/blog/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <BlogEdit />
                  </ProtectedRoute>
                }
              />

              {/* رویدادها */}
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <EventList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/create"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <EventCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <EventEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/enrollments/:eventId"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <EventEnrollments />
                  </ProtectedRoute>
                }
              />

              {/* دوره‌ها */}
              <Route
                path="/admin/payments/orders"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <OrdersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <CouponsManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <CourseList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses/create"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <CourseCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <CourseEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses/enrollments/:courseId"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <CourseEnrollments />
                  </ProtectedRoute>
                }
              />

              {/* کارمندان */}
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <EmployeeList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees/create"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <EmployeeCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <EmployeeEdit />
                  </ProtectedRoute>
                }
              />

              {/* کاربران */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <UserList />
                  </ProtectedRoute>
                }
              />

              {/* تیم */}
              <Route
                path="/admin/team"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <TeamList />
                  </ProtectedRoute>
                }
              />

              {/* همکاران */}
              <Route
                path="/admin/partners"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PartnerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/partners/create"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PartnerCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/partners/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PartnerEdit />
                  </ProtectedRoute>
                }
              />

              {/* تیکت‌ها */}
              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <TicketList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets/create"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <TicketCreateAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets/create-group"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <TicketGroupCreate />
                  </ProtectedRoute>
                }
              />

              {/* پیام‌ها */}
              <Route
                path="/admin/messages"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <MessageList />
                  </ProtectedRoute>
                }
              />

              {/* پروفایل ادمین */}
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />

              {/* تنظیمات */}
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/help"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <Help />
                  </ProtectedRoute>
                }
              />

              {/* Hero */}
              <Route
                path="/admin/hero"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <HeroList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/hero/create"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <HeroCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/hero/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <HeroEdit />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </HelmetProvider>

      {/* React Query Devtools - فقط در محیط توسعه */}
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default App;
