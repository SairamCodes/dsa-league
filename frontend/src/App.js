import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EntriesPage from "./pages/EntriesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-white">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={token ? <DashboardPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={token ? <ProfilePage /> : <Navigate to="/login" />}
        />

        <Route
          path="/entries"
          element={token ? <EntriesPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/leaderboard"
          element={token ? <LeaderboardPage /> : <Navigate to="/login" />}
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