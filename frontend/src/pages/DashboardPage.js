
    import { useEffect, useState } from "react";
    import Shell from "../components/Shell";
    import Card from "../components/Card";
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

      useEffect(() => {
        loadDashboard();
      }, []);

      async function loadDashboard() {
        try {
          const [analyticsRes, profileRes] = await Promise.all([
            client.get("/reports/analytics"),
            client.get("/users/me"),
          ]);
          setAnalytics(analyticsRes.data);
          setProfile(profileRes.data);
        } catch (err) {
          console.error(err);
        }
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

          <Card>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  👋 Welcome, {profile.full_name}
                </h1>
                <p className="mt-2 text-slate-400">
                  Stay consistent. Every problem solved makes you stronger.
                </p>
              </div>

              <div className="text-slate-300 flex items-center gap-2">
                <CalendarDays size={18} />
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </Card>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">

              <Card title="Statistics">
                <div className="grid gap-5 md:grid-cols-3">

                  <Info icon={<Flame className="text-orange-400" />} title="Problems Solved" value={analytics.problems_solved} />
                  <Info icon={<Clock3 className="text-cyan-400" />} title="Average Time" value={`${analytics.average_time.toFixed(1)} min`} />
                  <Info icon={<Users className="text-green-400" />} title="Active Members" value={analytics.members_active} />
                  <Info icon={<Star className="text-yellow-400" />} title="Current Score" value={profile.current_score} />
                  <Info icon={<Trophy className="text-purple-400" />} title="Current Rank" value={`#${profile.current_rank}`} />
                  <Info icon={<Clock3 className="text-pink-400" />} title="Total Time" value={`${analytics.total_time} min`} />

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
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Card>
              </div>

              <Card title="Weekly Goal">
                <div className="w-full h-4 rounded-full bg-slate-700">
                  <div
                    className="h-4 rounded-full bg-cyan-500"
                    style={{ width: `${weeklyGoal}%` }}
                  />
                </div>

                <p className="mt-4 text-slate-300">
                  {analytics.problems_solved}/15 Problems Completed
                </p>
              </Card>

              <Card title="Daily Motivation">
                <p className="italic text-slate-300">
                  Consistency beats intensity. Solve at least one problem every day.
                </p>
              </Card>

            </div>

            {profile.role === "admin" && (
              <div className="space-y-6">
                <Card title="Admin Spotlight">
                  <Info title="Top Performer" value={analytics.top_performer} />
                  <Info title="Most Improved" value={analytics.most_improved} />
                  <Info title="Strongest Member" value={analytics.strongest_member} />
                  <Info title="Weakest Member" value={analytics.weakest_member} />
                </Card>
              </div>
            )}
          </div>

        </Shell>
      );
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
