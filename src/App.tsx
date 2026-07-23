// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
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
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";

// ادمین
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import BlogListAdmin from "./pages/admin/Blog/BlogList";
import BlogCreate from "./pages/admin/Blog/BlogCreate";
import BlogEdit from "./pages/admin/Blog/BlogEdite";
import EventList from "./pages/admin/Events/EventList";
import EventCreate from "./pages/admin/Events/EventCreate";
import UserList from "./pages/admin/Users/UserList";
import TeamList from "./pages/admin/Team/TeamList";
import HeroList from "./pages/admin/Hero/HeroList";
import Settings from "./pages/admin/Settings/Settings";
import EventEdit from "./pages/admin/Events/EventEdit";
import PartnerCreate from "./pages/admin/Partners/PartnerCreate";
import PartnerEdit from "./pages/admin/Partners/PartnerEdite";
import PartnerList from "./pages/admin/Partners/PartnersList";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AccessDenied from "./pages/AccessDenied";
import AdminProfile from "./pages/admin/Profile";
import HeroEdit from "./pages/admin/Hero/HeroEdit";
import HeroCreate from "./pages/admin/Hero/HeroCreate";
import TicketGroupCreate from "./components/admin/Tickets/TicketGroupCreate";
import TicketCreate from "./components/admin/Tickets/TicketCreate";
import TicketList from "./components/admin/Tickets/TicketList";
import MessageList from "./components/admin/Messages/MessageList";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* عمومی */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/approach" element={<ApproachPage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/accss-denied" element={<AccessDenied />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* 🔥 مسیر /admin - هدایت به لاگین یا داشبورد */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* ادمین */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <ProtectedRoute>
              <BlogListAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/create"
          element={
            <ProtectedRoute>
              <BlogCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/edit/:id"
          element={
            <ProtectedRoute>
              <BlogEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <EventList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/edit/:id"
          element={
            <ProtectedRoute>
              <EventEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/create"
          element={
            <ProtectedRoute>
              <EventCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/team"
          element={
            <ProtectedRoute>
              <TeamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hero"
          element={
            <ProtectedRoute>
              <HeroList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hero/create"
          element={
            <ProtectedRoute>
              <HeroCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hero/edit/:id"
          element={
            <ProtectedRoute>
              <HeroEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners"
          element={
            <ProtectedRoute>
              <PartnerList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners/create"
          element={
            <ProtectedRoute>
              <PartnerCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners/edit/:id"
          element={
            <ProtectedRoute>
              <PartnerEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute>
              <MessageList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute>
              <TicketList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets/create"
          element={
            <ProtectedRoute>
              <TicketCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets/create-group"
          element={
            <ProtectedRoute>
              <TicketGroupCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          }
        />

        {/* 🔥 مسیر 404 - برای هر مسیر ناشناخته */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
