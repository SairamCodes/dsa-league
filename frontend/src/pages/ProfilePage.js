import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Card from "../components/Card";
import client from "../api/client";
import Avatar from "../components/Avatar";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    client.get("/users/me").then((res) => setProfile(res.data));
  }, []);

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card title="Profile Overview">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar src={profile?.profile_picture} name={profile?.full_name} size={5} />
              <div>
                <button onClick={async()=>{
                  const {getAvatarUrl} = await import('../utils/avatar')
                  const pic = getAvatarUrl(profile?.username || profile?.email || profile?.full_name)
                  try{ await client.put('/users/me/avatar',{profile_picture: pic}); const res = await client.get('/users/me'); setProfile(res.data)}catch(e){console.error(e)}
                }} className="text-sm text-accent mt-2">Change Avatar</button>
              </div>
              <div>
                <p className="text-sm text-white/70">{profile?.role === "admin" ? "Admin" : "Member"}</p>
                <p className="text-3xl font-semibold">{profile?.full_name ?? "Loading..."}</p>
                <p className="text-sm text-white/60">{profile?.college}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Item label="Username" value={profile?.username} />
              <Item label="Email" value={profile?.email} />
              <Item label="Current Score" value={profile?.current_score} />
              <Item label="Weekly Score" value={profile?.weekly_score} />
              <Item label="Monthly Score" value={profile?.monthly_score} />
              <Item label="Total Problems" value={profile?.total_problems} />
            </div>
          </div>
        </Card>
        <Card title="Performance Stats">
          <div className="grid gap-4 sm:grid-cols-2">
            <Item label="Easy" value={profile?.easy_count} />
            <Item label="Medium" value={profile?.medium_count} />
            <Item label="Hard" value={profile?.hard_count} />
            <Item label="Avg. Time" value={`${profile?.average_time.toFixed(1) ?? "0.0"} min`} />
            <Item label="Favorite Pattern" value={profile?.favorite_pattern ?? "-"} />
            <Item label="Strongest Pattern" value={profile?.strongest_pattern ?? "-"} />
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function Item({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-surface2 p-4">
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value ?? "-"}</p>
    </div>
  );
}
