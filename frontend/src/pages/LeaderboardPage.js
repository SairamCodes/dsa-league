import { useEffect, useState } from "react";
import client from "../api/client";
import Shell from "../components/Shell";
import Card from "../components/Card";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const response = await client.get("/reports/leaderboard");
      setLeaders(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  function medal(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏅";
  }

  return (
    <Shell>

      <Card title="🏆 DSA League Leaderboard">

        <div className="space-y-4">

          {leaders.map((user) => (

            <div
              key={user.id}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-5 hover:border-cyan-500 transition"
            >

              <div className="flex items-center gap-5">

                <div className="text-4xl">
                  {medal(user.rank)}
                </div>

                <div>

                  <h2 className="text-xl font-bold text-white">
                    #{user.rank} {user.full_name}
                  </h2>

                  <p className="text-slate-400">
                    @{user.username}
                  </p>

                  <p className="text-slate-500 text-sm">
                    {user.college}
                  </p>

                </div>

              </div>

              <div className="text-right">

                <h2 className="text-2xl font-bold text-cyan-400">
                  ⭐ {user.score}
                </h2>

                <p className="text-slate-300">
                  📚 {user.problems_solved} Problems
                </p>

                <p className="text-slate-500">
                  ⏱ {user.total_time} min
                </p>

              </div>

            </div>

          ))}

        </div>

      </Card>

    </Shell>
  );
}