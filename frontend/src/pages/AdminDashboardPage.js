import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import Card from "../components/Card";
import client from "../api/client";
import {
  Users,
  Trophy,
  Flame,
  Star,
  CalendarDays,
  TrendingUp,
  Award,
  School,
  BarChart3,
  Zap,
  Target,
  UserPlus,
  Activity,
  Search,
  Settings,
  FileText,
  Crown,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  async function load() {
    setError(null);
    try {
      const res = await client.get("/reports/admin/overview");
      setOverview(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin dashboard.");
    }
  }

  if (error) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <h2 className="text-rose-400 text-2xl font-bold">Error</h2>
          <p className="text-slate-300">{error}</p>
          <button onClick={load} className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 hover:bg-cyan-500 transition">Retry</button>
        </div>
      </Shell>
    );
  }

  if (!overview) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-[70vh]">
          <h2 className="text-white text-2xl font-bold animate-pulse">Loading Admin Dashboard...</h2>
        </div>
      </Shell>
    );
  }

  // Chart data
  const diffColors = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
  const diffData = {
    labels: Object.keys(overview.difficulty_distribution || {}),
    datasets: [{
      data: Object.values(overview.difficulty_distribution || {}),
      backgroundColor: Object.keys(overview.difficulty_distribution || {}).map(k => diffColors[k] || "#6366f1"),
    }],
  };

  const patternData = {
    labels: Object.keys(overview.pattern_distribution || {}),
    datasets: [{
      label: "Problems",
      data: Object.values(overview.pattern_distribution || {}),
      backgroundColor: "#06b6d4",
      borderRadius: 6,
    }],
  };

  const collegeDist = overview.college_distribution || {};
  const collegeData = {
    labels: Object.keys(collegeDist),
    datasets: [{
      label: "Members",
      data: Object.values(collegeDist),
      backgroundColor: "#8b5cf6",
      borderRadius: 6,
    }],
  };

  const dailySub = overview.daily_submissions_chart || {};
  const sortedDays = Object.keys(dailySub).sort();
  const dailyData = {
    labels: sortedDays.map(d => d.slice(5)),
    datasets: [{
      label: "Submissions",
      data: sortedDays.map(d => dailySub[d]),
      borderColor: "#06b6d4",
      backgroundColor: "rgba(6,182,212,0.15)",
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }],
  };

  const regTrend = overview.registration_trend || {};
  const sortedRegDays = Object.keys(regTrend).sort();
  const regData = {
    labels: sortedRegDays.map(d => d.slice(5)),
    datasets: [{
      label: "New Members",
      data: sortedRegDays.map(d => regTrend[d]),
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139,92,246,0.15)",
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }],
  };

  const chartOpts = { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: "#94a3b8" } }, x: { ticks: { color: "#94a3b8" } } } };

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Platform Manager</p>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-slate-400">Monitor, analyze, and manage the DSA League platform.</p>
        </div>

        {/* ====== OVERVIEW CARDS ====== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={<Users size={20} />} label="Total Members" value={overview.total_members} color="cyan" />
          <StatCard icon={<Activity size={20} />} label="Active Today" value={overview.active_users_today} color="green" />
          <StatCard icon={<Target size={20} />} label="Total Problems" value={overview.total_problems} color="violet" />
          <StatCard icon={<Star size={20} />} label="Total Points" value={overview.total_score} color="amber" />
          <StatCard icon={<Trophy size={20} />} label="Highest Score" value={overview.highest_score} color="yellow" />
          <StatCard icon={<Flame size={20} />} label="Highest Streak" value={overview.highest_current_streak} color="orange" />
          <StatCard icon={<TrendingUp size={20} />} label="Longest Streak" value={overview.highest_longest_streak} color="rose" />
          <StatCard icon={<UserPlus size={20} />} label="New Today" value={overview.new_registrations_today} color="emerald" />
          <StatCard icon={<School size={20} />} label="Total Colleges" value={overview.total_colleges} color="indigo" />
          <StatCard icon={<Award size={20} />} label="Achievements" value={overview.total_achievements} color="pink" />
        </div>

        {/* ====== MONITORING SECTION ====== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MonitorCard emoji="🔥" label="Most Active" value={overview.most_active_member} />
          <MonitorCard emoji="🏆" label="Highest Ranked" value={overview.highest_ranked_member} />
          <MonitorCard emoji="📈" label="Fastest Growing" value={overview.fastest_growing_member} />
          <MonitorCard emoji="⭐" label="Most Consistent" value={overview.most_consistent_member} />
          <MonitorCard emoji="💯" label="Highest Score Today" value={`${overview.highest_score_today_user} (${overview.highest_score_today_val})`} />
          <MonitorCard emoji="📅" label="Today's Submissions" value={overview.today_submissions} />
          <MonitorCard emoji="📅" label="Weekly Submissions" value={overview.weekly_submissions} />
          <MonitorCard emoji="📅" label="Monthly Submissions" value={overview.monthly_submissions} />
          <MonitorCard emoji="🏫" label="Top College" value={overview.top_college} />
          <MonitorCard emoji="🧠" label="Most Solved Pattern" value={overview.most_solved_pattern} />
          <MonitorCard emoji="⚡" label="Most Solved Difficulty" value={overview.most_solved_difficulty} />
        </div>

        {/* ====== CHARTS ====== */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Daily Submissions (Last 30 Days)">
            {sortedDays.length > 0 ? <Line data={dailyData} options={chartOpts} /> : <Empty />}
          </Card>
          <Card title="Registration Trend (Last 30 Days)">
            {sortedRegDays.length > 0 ? <Line data={regData} options={chartOpts} /> : <Empty />}
          </Card>
          <Card title="Difficulty Distribution">
            {Object.keys(overview.difficulty_distribution || {}).length > 0 ? <Pie data={diffData} /> : <Empty />}
          </Card>
          <Card title="Pattern Distribution">
            {Object.keys(overview.pattern_distribution || {}).length > 0 ? <Bar data={patternData} options={chartOpts} /> : <Empty />}
          </Card>
          <Card title="College Distribution">
            {Object.keys(collegeDist).length > 0 ? <Bar data={collegeData} options={chartOpts} /> : <Empty />}
          </Card>
        </div>

        {/* ====== MEMBER MANAGEMENT QUICK ACCESS ====== */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recently Registered */}
          <Card title="Recently Registered">
            {(overview.recent_registrations || []).length > 0 ? (
              <ul className="space-y-3">
                {overview.recent_registrations.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white font-semibold">{m.full_name}</span>
                      <span className="text-slate-400 ml-2">@{m.username}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ""}</span>
                  </li>
                ))}
              </ul>
            ) : <Empty />}
          </Card>

          {/* Recently Active */}
          <Card title="Recently Active">
            {(overview.recent_active || []).length > 0 ? (
              <ul className="space-y-3">
                {overview.recent_active.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white font-semibold">{m.full_name}</span>
                      <span className="text-slate-400 ml-2">@{m.username}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{m.last_active ? new Date(m.last_active).toLocaleDateString() : ""}</span>
                  </li>
                ))}
              </ul>
            ) : <Empty />}
          </Card>

          {/* Inactive Members */}
          <Card title="No Recent Activity (7d)">
            {(overview.inactive_members || []).length > 0 ? (
              <ul className="space-y-3">
                {overview.inactive_members.slice(0, 5).map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white font-semibold">{m.full_name}</span>
                      <span className="text-slate-400 ml-2">@{m.username}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{m.college || "-"}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-400 text-sm">All members are active 🎉</p>}
          </Card>
        </div>

        {/* ====== QUICK ACTIONS ====== */}
        <Card title="Quick Actions">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionBtn icon={<Users size={16} />} label="View All Members" to="/admin" />
            <ActionBtn icon={<Search size={16} />} label="Search Members" to="/admin" />
            <ActionBtn icon={<Crown size={16} />} label="View Leaderboard" to="/admin" />
            <ActionBtn icon={<FileText size={16} />} label="View Reports" to="/admin" />
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    green: "border-green-500/30 bg-green-500/5 text-green-400",
    violet: "border-violet-500/30 bg-violet-500/5 text-violet-400",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    yellow: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
    orange: "border-orange-500/30 bg-orange-500/5 text-orange-400",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-400",
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    indigo: "border-indigo-500/30 bg-indigo-500/5 text-indigo-400",
    pink: "border-pink-500/30 bg-pink-500/5 text-pink-400",
  };
  const cls = colors[color] || colors.cyan;

  return (
    <div className={`rounded-2xl border p-5 transition-all hover:scale-[1.02] ${cls}`}>
      <div className="flex items-center gap-2 mb-3 opacity-80">{icon}<span className="text-xs uppercase tracking-wider">{label}</span></div>
      <p className="text-3xl font-bold text-white">{value ?? "--"}</p>
    </div>
  );
}

function MonitorCard({ emoji, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4 hover:border-cyan-500/40 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{emoji}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-semibold text-white truncate">{value ?? "-"}</p>
    </div>
  );
}

function ActionBtn({ icon, label, to }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/50 px-5 py-4 text-sm text-white hover:border-cyan-500/40 hover:bg-slate-800 transition-all">
      {icon}
      {label}
    </Link>
  );
}

function Empty() {
  return <p className="text-slate-500 text-sm py-4 text-center">No data available yet.</p>;
}
