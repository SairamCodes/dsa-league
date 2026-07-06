import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EntriesPage from "./pages/EntriesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { useAuth } from "./hooks/useAuth";
import Cookies from "js-cookie";

function App() {
  const { token } = useAuth();

  // Read cached user role from cookie (set on login)
  const userRole = Cookies.get("dsa_league_role") || null;
  const isAdmin = userRole === "admin";

  return (
    <div className="min-h-screen bg-surface text-white">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Home: admin sees AdminDashboard, member sees MemberDashboard */}
        <Route
          path="/"
          element={
            token
              ? isAdmin
                ? <AdminDashboardPage />
                : <DashboardPage />
              : <Navigate to="/login" />
          }
        />

        {/* Member-only routes: redirect admin to home */}
        <Route
          path="/profile"
          element={
            token
              ? isAdmin
                ? <Navigate to="/" />
                : <ProfilePage />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/entries"
          element={
            token
              ? isAdmin
                ? <Navigate to="/" />
                : <EntriesPage />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/leaderboard"
          element={
            token
              ? isAdmin
                ? <Navigate to="/" />
                : <LeaderboardPage />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/admin"
          element={token ? <AdminPage /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;