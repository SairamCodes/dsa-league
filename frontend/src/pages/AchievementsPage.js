import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Card from "../components/Card";
import client from "../api/client";

export default function AchievementsPage() {

  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    try {
      const res = await client.get("/users/me/achievements");
      setAchievements(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Shell>

      <Card title="🏆 My Achievements">

        {achievements.length === 0 ? (

          <p className="text-slate-400">
            No achievements unlocked yet.
          </p>

        ) : (

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {achievements.map((achievement) => (

              <div
                key={achievement.id}
                className="rounded-xl border border-yellow-500 bg-slate-800 p-5"
              >

                <h2 className="text-xl font-bold text-yellow-400">
                  🏅 {achievement.type}
                </h2>

                <p className="mt-2 text-slate-400">
                  Unlocked on
                </p>

                <p className="text-white">
                  {new Date(
                    achievement.awarded_at
                  ).toLocaleDateString()}
                </p>

              </div>

            ))}

          </div>

        )}

      </Card>

    </Shell>
  );
}