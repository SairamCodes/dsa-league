import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { setAuthToken } from "../api/client";
import client from "../api/client";

export default function Shell({ children }) {
  const navigate = useNavigate();
  const { clearToken } = useAuth();

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await client.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    clearToken();
    setAuthToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      <header className="border-b border-slate-700 bg-slate-900">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

          <Link
            to="/"
            className="text-2xl font-bold text-cyan-400"
          >
            DSA League
          </Link>

          <nav className="flex items-center gap-6 text-white">

            <Link
              to="/"
              className="hover:text-cyan-400"
            >
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="hover:text-cyan-400"
            >
              Profile
            </Link>

            <Link
              to="/entries"
              className="hover:text-cyan-400"
            >
              Entries
            </Link>

            {/* Only Admin can see Leaderboard */}

            {user?.role === "admin" && (

              <Link
                to="/leaderboard"
                className="hover:text-cyan-400"
              >
                Leaderboard
              </Link>

            )}

            {/* Only Admin can see Admin Page */}

            {user?.role === "admin" && (

              <Link
                to="/admin"
                className="hover:text-cyan-400"
              >
                Admin
              </Link>

            )}

            <button
              onClick={logout}
              className="rounded-lg bg-red-500 px-4 py-2 hover:bg-red-600"
            >
              Logout
            </button>

          </nav>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-8 py-8">

        {children}

      </main>

    </div>
  );
}