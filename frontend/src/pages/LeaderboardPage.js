import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Card from "../components/Card";
import client from "../api/client";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const res = await client.get("/entries/leaderboard");
      setLeaders(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Shell>
      <Card title="🏆 DSA League Leaderboard">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b border-slate-700">

                <th className="p-4 text-left text-cyan-400">
                  Rank
                </th>

                <th className="p-4 text-left text-cyan-400">
                  Username
                </th>

                <th className="p-4 text-left text-cyan-400">
                  Problems
                </th>

                <th className="p-4 text-left text-cyan-400">
                  Score
                </th>

              </tr>

            </thead>

            <tbody>

              {leaders.map((user, index) => (

                <tr
                  key={user.user_id}
                  className="border-b border-slate-800 hover:bg-slate-800"
                >

                  <td className="p-4 font-bold text-white">

                    {index + 1}

                  </td>

                  <td className="p-4 text-white">

                    {user.username}

                  </td>

                  <td className="p-4 text-cyan-400">

                    {user.problems_solved}

                  </td>

                  <td className="p-4 text-yellow-400 font-semibold">

                    {user.score}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </Card>
    </Shell>
  );
}