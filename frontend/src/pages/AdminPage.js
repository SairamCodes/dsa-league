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

    if (!window.confirm("Reset this user's password?"))
      return;

    try {

      await client.put(
        `/admin/members/${id}/reset-password`
      );

      alert("Password reset successfully.");

    } catch (err) {

      alert(
        err.response?.data?.detail ||
        "Unable to reset password."
      );

    }

  }

  async function deleteUser(id) {

    if (!window.confirm("Delete this user permanently?"))
      return;

    try {

      await client.delete(
        `/admin/members/${id}`
      );

      setMembers(
        members.filter((m) => m.id !== id)
      );

      alert("User deleted successfully.");

    } catch (err) {

      alert(
        err.response?.data?.detail ||
        "Unable to delete user."
      );

    }

  }

  return (

    <Shell>

      <div className="space-y-6">

        <Card title="Members">

          <div className="space-y-3">

            {members.map((member) => (

              <div
                key={member.id}
                className="rounded-xl border border-slate-700 bg-slate-800 p-4 flex items-center justify-between"
              >

                <div>

                  <h3 className="text-lg font-semibold text-white">
                    {member.full_name}
                  </h3>

                  <p className="text-slate-400">
                    {member.username}
                  </p>

                  <p className="text-cyan-400">
                    {member.role}
                  </p>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={() => resetPassword(member.id)}
                    className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400"
                  >
                    Reset Password
                  </button>

                  {member.role !== "admin" && (

                    <button
                      onClick={() => deleteUser(member.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                    >
                      Delete
                    </button>

                  )}

                </div>

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

                  <h3 className="font-bold text-white">
                    {entry.problem_name}
                  </h3>

                  <p className="mt-1 text-slate-400">
                    {entry.platform} • {entry.pattern}
                  </p>

                  <div className="mt-4 flex gap-3">

                    <button
                      onClick={() => approve(entry.id)}
                      className="rounded-lg bg-green-500 px-4 py-2 font-semibold text-black hover:bg-green-400"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(entry.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
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