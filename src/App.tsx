// src/App.tsx

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SettingsProvider } from "./contexts/SettingsContext";
import { HelmetProvider } from "react-helmet-async";
import { ScrollToTop } from "./components/ScrollToTop";

// Layout
import Layout from "./components/layout/Layout";

// Components
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SonnerProvider } from "./components/ui/sonner-provider";

// Public Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));

const ServicesPage = lazy(() => import("./pages/Services"));
const AboutPage = lazy(() => import("./pages/About"));
const ContactPage = lazy(() => import("./pages/Contact"));
const ApproachPage = lazy(() => import("./pages/Approach"));

const BlogList = lazy(() => import("./pages/public/BlogList"));
const BlogPost = lazy(() => import("./pages/public/BlogPost"));

const Events = lazy(() => import("./pages/public/Events"));
const EventDetail = lazy(() => import("./pages/public/EventDetail"));

const Courses = lazy(() => import("./pages/public/Courses"));
const CourseDetail = lazy(() => import("./pages/public/CourseDetail"));

const Profile = lazy(() => import("./pages/Profile/Profile"));
const Cart = lazy(() => import("./pages/Cart"));

const TicketDetail = lazy(() => import("./pages/TicketDetail"));
const TicketCreate = lazy(() => import("./pages/TicketCreate"));

const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Stats = lazy(() => import("./pages/admin/Stats"));

const BlogListAdmin = lazy(() => import("./pages/admin/Blog/BlogList"));
const BlogCreate = lazy(() => import("./pages/admin/Blog/BlogCreate"));
const BlogEdit = lazy(() => import("./pages/admin/Blog/BlogEdit"));

const CourseListAdmin = lazy(
  () => import("./pages/admin/Courses/CourseList"),
);
const CourseCreate = lazy(
  () => import("./pages/admin/Courses/CourseCreate"),
);
const CourseEdit = lazy(() => import("./pages/admin/Courses/CourseEdit"));
const CourseEnrollments = lazy(
  () => import("./pages/admin/Courses/CourseEnrollments"),
);

const OrdersList = lazy(
  () => import("./pages/admin/Payments/OrdersList"),
);
const CouponsManager = lazy(
  () => import("./pages/admin/Copuns/CouponsManager"),
);

const EventList = lazy(
  () => import("./pages/admin/Events/EventList"),
);
const EventCreate = lazy(
  () => import("./pages/admin/Events/EventCreate"),
);
const EventEdit = lazy(
  () => import("./pages/admin/Events/EventEdit"),
);
const EventEnrollments = lazy(
  () => import("./pages/admin/Events/EventEnrollments"),
);

const EmployeeList = lazy(
  () => import("./pages/admin/Employees/EmployeeList"),
);
const EmployeeCreate = lazy(
  () => import("./pages/admin/Employees/EmployeeCreate"),
);
const EmployeeEdit = lazy(
  () => import("./pages/admin/Employees/EmployeeEdit"),
);

const UserList = lazy(
  () => import("./pages/admin/Users/UserList"),
);

const TeamList = lazy(
  () => import("./pages/admin/Team/TeamList"),
);

const PartnerList = lazy(
  () => import("./pages/admin/Partners/PartnersList"),
);
const PartnerCreate = lazy(
  () => import("./pages/admin/Partners/PartnerCreate"),
);
const PartnerEdit = lazy(
  () => import("./pages/admin/Partners/PartnerEdite"),
);

const AdminProfile = lazy(
  () => import("./pages/admin/Profile"),
);

const Settings = lazy(
  () => import("./pages/admin/Settings/Settings"),
);

const Help = lazy(
  () => import("./pages/admin/Help"),
);

const HeroList = lazy(
  () => import("./pages/admin/Hero/HeroList"),
);
const HeroCreate = lazy(
  () => import("./pages/admin/Hero/HeroCreate"),
);
const HeroEdit = lazy(
  () => import("./pages/admin/Hero/HeroEdit"),
);

// Admin Components
const TicketGroupCreate = lazy(
  () => import("./components/admin/Tickets/TicketGroupCreate"),
);
const TicketCreateAdmin = lazy(
  () => import("./components/admin/Tickets/TicketCreate"),
);
const TicketList = lazy(
  () => import("./components/admin/Tickets/TicketList"),
);
const MessageList = lazy(
  () => import("./components/admin/Messages/MessageList"),
);

// QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

// Loading fallback
function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-sm text-muted-foreground">
        در حال بارگذاری...
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <SonnerProvider />
          <SettingsProvider>
            <BrowserRouter>
              <ScrollToTop />

              <Suspense fallback={<PageLoading />}>
                <Routes>
                  {/* ============================================================
                      عمومی (با Layout)
                      ============================================================ */}

                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />

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

                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:slug" element={<CourseDetail />} />

                    <Route
                      path="/access-denied"
                      element={<AccessDenied />}
                    />

                    <Route
                      path="/tickets/create"
                      element={<TicketCreate />}
                    />

                    <Route
                      path="/tickets/:id"
                      element={<TicketDetail />}
                    />

                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* ============================================================
                      Admin
                      ============================================================ */}

                  <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                  />

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <Navigate
                          to="/admin/dashboard"
                          replace
                        />
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

                  <Route
                    path="/admin/stats"
                    element={
                      <ProtectedRoute>
                        <Stats />
                      </ProtectedRoute>
                    }
                  />

                  {/* Blog */}

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

                  {/* Events */}

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

                  {/* Payments / Coupons */}

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

                  {/* Courses */}

                  <Route
                    path="/admin/courses"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <CourseListAdmin />
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

                  {/* Employees */}

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

                  {/* Users */}

                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <UserList />
                      </ProtectedRoute>
                    }
                  />

                  {/* Team */}

                  <Route
                    path="/admin/team"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <TeamList />
                      </ProtectedRoute>
                    }
                  />

                  {/* Partners */}

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

                  {/* Tickets */}

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

                  {/* Messages */}

                  <Route
                    path="/admin/messages"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <MessageList />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Profile */}

                  <Route
                    path="/admin/profile"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Settings */}

                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Help */}

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

                  <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SettingsProvider>
      </HelmetProvider>

      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default App;
