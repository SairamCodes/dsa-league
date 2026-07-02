import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Card from "../components/Card";
import client from "../api/client";

export default function AdminPage() {
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [membersRes, entriesRes] = await Promise.all([
        client.get("/admin/members"),
        client.get("/admin/entries/pending"),
      ]);

      setMembers(membersRes.data);
      setEntries(entriesRes.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function approve(id) {
    await client.put(`/admin/entries/${id}/approve`);
    loadData();
  }

  async function reject(id) {
    await client.put(`/admin/entries/${id}/reject`);
    loadData();
  }

  async function resetPassword(id) {
    if (!window.confirm("Reset password?")) return;

    await client.put(`/admin/members/${id}/reset-password`);

    alert("Password reset successfully.");
  }

  return (
    <Shell>

      <div className="space-y-6">

        <Card title="Members">

          <div className="space-y-3">

            {members.map((member) => (

              <div
                key={member.id}
                className="rounded-xl border border-slate-700 bg-slate-800 p-4 flex justify-between items-center"
              >

                <div>

                  <h3 className="text-white font-semibold">

                    {member.full_name}

                  </h3>

                  <p className="text-slate-400">

                    {member.username}

                  </p>

                  <p className="text-cyan-400">

                    {member.role}

                  </p>

                </div>

                <button
                  onClick={() =>
                    resetPassword(member.id)
                  }
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-black font-semibold"
                >
                  Reset Password
                </button>

              </div>

            ))}

          </div>

        </Card>

        <Card title="Pending Entries">

          {entries.length === 0 ? (

            <p className="text-slate-400">

              No pending entries.

            </p>

          ) : (

            <div className="space-y-4">

              {entries.map((entry) => (

                <div
                  key={entry.id}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                >

                  <h3 className="text-white font-bold">

                    {entry.problem_name}

                  </h3>

                  <p className="text-slate-400">

                    {entry.platform} • {entry.pattern}

                  </p>

                  <div className="mt-4 flex gap-3">

                    <button
                      onClick={() =>
                        approve(entry.id)
                      }
                      className="rounded-lg bg-green-500 px-4 py-2 font-semibold text-black"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        reject(entry.id)
                      }
                      className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white"
                    >
                      Reject
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </Card>

      </div>

    </Shell>
  );
}