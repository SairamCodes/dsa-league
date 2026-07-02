import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client, { setAuthToken } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await client.post("/auth/login", { username, password, remember_me: remember });
      const token = response.data.access_token;
      saveToken(token, remember);
      setAuthToken(token);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials or server error.");
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-surface2 p-10 shadow-soft">
      <div className="mb-8">
        <p className="text-sm uppercase text-accent mb-2">DSA League</p>
        <h1 className="text-4xl font-semibold">Login</h1>
        <p className="mt-2 text-white/70">
          Track progress, unlock achievements, and stay consistent.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-white/80">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
            placeholder="john_doe"
          />
        </label>

        <label className="block">
          <span className="text-sm text-white/80">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
            placeholder="••••••••"
          />
        </label>

        <div className="flex items-center justify-between text-sm text-white/70">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-surface2 text-accent focus:ring-accent"
            />
            Remember me
          </label>

          <button
            type="button"
            className="text-accent hover:text-accent2"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <p className="text-sm text-rose-400">{error}</p>
        )}

        <button className="w-full rounded-2xl bg-gradient-to-r from-accent to-accent2 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95">
          Sign in
        </button>

        {/* Register Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-white/70">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-accent hover:text-accent2 font-semibold"
            >
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  </div>
);
}
