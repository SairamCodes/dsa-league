import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Card from "../components/Card";
import client from "../api/client";

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
      console.log(err);
    }
  }

  if (!analytics || !profile) {
    return (
      <Shell>
        <h2 className="text-white text-xl">
          Loading Dashboard...
        </h2>
      </Shell>
    );
  }

  const difficultyData = {
    labels: Object.keys(
      analytics.difficulty_distribution
    ),
    datasets: [
      {
        data: Object.values(
          analytics.difficulty_distribution
        ),
        backgroundColor: [
          "#3b82f6",
          "#8b5cf6",
          "#f59e0b",
        ],
      },
    ],
  };

  const patternData = {
    labels: Object.keys(
      analytics.pattern_distribution
    ),
    datasets: [
      {
        data: Object.values(
          analytics.pattern_distribution
        ),
        backgroundColor: "#22c55e",
      },
    ],
  };

  return (
    <Shell>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">

        <div className="space-y-6">

          <Card title="Analytics">

            <div className="grid gap-5 md:grid-cols-2">

              <Info
                title="Problems Solved"
                value={analytics.problems_solved}
              />

              <Info
                title="Total Time"
                value={`${analytics.total_time} min`}
              />

              <Info
                title="Average Time"
                value={`${analytics.average_time.toFixed(1)} min`}
              />

              <Info
                title="Active Members"
                value={analytics.members_active}
              />

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

        </div>

        {/* ADMIN ONLY */}

        {profile.role === "admin" && (

          <div className="space-y-6">

            <Card title="Spotlight Metrics">

              <Info
                title="Top Performer"
                value={analytics.top_performer}
              />

              <Info
                title="Most Improved"
                value={analytics.most_improved}
              />

              <Info
                title="Strongest Member"
                value={analytics.strongest_member}
              />

              <Info
                title="Weakest Member"
                value={analytics.weakest_member}
              />

            </Card>

          </div>

        )}

      </div>

    </Shell>
  );
}

function Info({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">

      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-white">
        {value}
      </h2>

    </div>
  );
}