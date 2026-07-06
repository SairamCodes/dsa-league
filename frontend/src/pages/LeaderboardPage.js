import Leaderboard from "../components/premium/Leaderboard";
import Shell from "../components/Shell";

export default function LeaderboardPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold">Leaderboard</h1>
        <Leaderboard />
      </div>
    </Shell>
  );
}