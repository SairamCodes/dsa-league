
    import { useEffect, useState } from "react";
    import Shell from "../components/Shell";
    import Card from "../components/Card";
    import Heatmap from "../components/premium/Heatmap";
    import RecentActivity from "../components/premium/RecentActivity";
    import StreakCard from "../components/premium/StreakCard";
    import AchievementsGrid from "../components/premium/AchievementsGrid";
    import client from "../api/client";
    import {
      Trophy,
      Flame,
      Star,
      Clock3,
      Users,
      CalendarDays,
    } from "lucide-react";
    import {
      Chart as ChartJS,
      ArcElement,
      BarElement,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend,
    } from "chart.js";
    import { Pie, Bar } from "react-chartjs-2";

    ChartJS.register(
      ArcElement,
      BarElement,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend
    );

    export default function DashboardPage() {
      const [analytics, setAnalytics] = useState(null);
      const [profile, setProfile] = useState(null);
      const [entries, setEntries] = useState([]);
      const [achievements, setAchievements] = useState([]);
      const [error, setError] = useState(null);

      useEffect(() => {
        loadDashboard();
      }, []);

      async function loadDashboard() {
        setError(null);
        try {
          const [analyticsRes, profileRes, achievementsRes] = await Promise.all([
            client.get("/reports/analytics"),
            client.get("/users/me"),
            client.get("/users/me/achievements"),
          ]);

          setAnalytics(analyticsRes.data);
          setProfile(profileRes.data);
          setAchievements(achievementsRes.data || []);

          try {
            const entriesRes = await client.get("/entries/mine");
            setEntries(entriesRes.data || []);
          } catch (entryErr) {
            // Admin users get 403 on /entries/mine — that's expected
            console.warn("Could not load entries:", entryErr.response?.status);
            setEntries([]);
          }
        } catch (err) {
          console.error(err);
          setError("Failed to load dashboard data. Please try again.");
        }
      }

      if (error) {
        return (
          <Shell>
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
              <h2 className="text-rose-400 text-2xl font-bold">Error</h2>
              <p className="text-slate-300">{error}</p>
              <button 
                onClick={loadDashboard}
                className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 hover:bg-cyan-500 transition"
              >
                Retry
              </button>
            </div>
          </Shell>
        );
      }

      if (!analytics || !profile) {
        return (
          <Shell>
            <div className="flex items-center justify-center h-[70vh]">
              <h2 className="text-white text-2xl font-bold">
                Loading Dashboard...
              </h2>
            </div>
          </Shell>
        );
      }

      const difficultyData = {
        labels: Object.keys(analytics.difficulty_distribution),
        datasets: [{
          data: Object.values(analytics.difficulty_distribution),
          backgroundColor: ["#22c55e","#f59e0b","#ef4444"],
        }],
      };

      const patternData = {
        labels: Object.keys(analytics.pattern_distribution),
        datasets: [{
          label: "Problems",
          data: Object.values(analytics.pattern_distribution),
          backgroundColor: "#06b6d4",
        }],
      };

      const weeklyGoal = Math.min((analytics.problems_solved / 15) * 100, 100);

      return (
        <Shell>
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">Welcome back, {profile.full_name}</h1>
                  <p className="mt-2 text-slate-400">Consistency &gt; intensity. Keep solving daily.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-slate-300 flex items-center gap-2"><CalendarDays size={18} />{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">

                <Card title="Overview">
                  <div className="grid grid-cols-2 gap-4">
                    <Info title="Current Score" value={profile.current_score} icon={<Star className="text-yellow-400"/>} />
                    <Info title="Current Rank" value={`#${profile.current_rank}`} icon={<Trophy className="text-cyan-400"/>} />
                    <Info title="Current Streak" value={`${profile.current_streak} days`} icon={<Flame className="text-orange-400"/>} />
                    <Info title="Longest Streak" value={`${profile.longest_streak} days`} icon={<Users className="text-green-400"/>} />
                  </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card title="Difficulty Distribution">
                    <Pie data={difficultyData} />
                  </Card>

                  <Card title="Pattern Distribution">
                    <Bar
                      data={patternData}
                      options={{
                        plugins: {
                          legend: { display: false },
                        },
                      }}
                    />
                  </Card>
                </div>

                <Card title="Contribution Heatmap">
                  <Heatmap entries={entries.map(e=> ({date: new Date(e.date).toISOString().slice(0,10), count:1}))} />
                </Card>

                <Card title="Recent Activity">
                  <RecentActivity entries={entries.slice(0,6)} />
                </Card>

              </div>

              <div className="space-y-6">
                <StreakCard current={profile.current_streak || 0} longest={profile.longest_streak || 0} />

                <Card title="Weekly Goal">
                  <div className="w-full h-4 rounded-full bg-slate-700">
                    <div className="h-4 rounded-full bg-primary" style={{width:`${weeklyGoal}%`}} />
                  </div>
                  <p className="mt-3 text-slate-300">{analytics.problems_solved}/15 Problems Completed</p>
                </Card>

                <Card title="Achievements">
                  <AchievementsGrid achievements={achievements} />
                </Card>
              </div>
            </div>
          </div>
        </Shell>
      )
    }

    function Info({ title, value, icon }) {
      return (
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 hover:border-cyan-500 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{title}</p>
            {icon}
          </div>

          <h2 className="mt-4 text-3xl font-bold text-white">
            {value}
          </h2>
        </div>
      );
    }
