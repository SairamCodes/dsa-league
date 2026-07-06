import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { setAuthToken } from "../api/client";
import client from "../api/client";
import Avatar from "./Avatar";
import Cookies from "js-cookie";

export default function Shell({ children }) {
  const navigate = useNavigate();
  const { clearToken } = useAuth();

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await client.get("/users/me");
      setUser(res.data);
      // Persist role in cookie so App.js can read it synchronously
      if (res.data?.role) {
        Cookies.set("dsa_league_role", res.data.role, { expires: 7 });
      }
    } catch (err) {
      console.log(err);
    }
  }

  function logout() {
    clearToken();
    setAuthToken(null);
    Cookies.remove("dsa_league_role");
    navigate("/login");
  }

  const isAdmin = user?.role === "admin";

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

          <nav className="flex items-center gap-6">

            {user && (
              <div className="mr-4"><Avatar src={user.profile_picture} name={user.full_name} size={2.5} /></div>
            )}

            <Link
              to="/"
              className="hover:text-cyan-400"
            >
              Dashboard
            </Link>

            {/* Member-only links */}
            {!isAdmin && (
              <>
                <Link to="/leaderboard" className="hover:text-cyan-400">Leaderboard</Link>
                <Link to="/profile" className="hover:text-cyan-400">Profile</Link>
              </>
            )}

            {user?.role === "member" && (
              <Link
                to="/entries"
                className="hover:text-cyan-400"
              >
                Entries
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="hover:text-cyan-400"
              >
                Members
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