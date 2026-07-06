import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import Card from "../components/Card";
import client from "../api/client";
import Avatar from "../components/Avatar";

const columns = [
  { key: "index", label: "S.No" },
  { key: "avatar", label: "Avatar" },
  { key: "username", label: "Username" },
  { key: "full_name", label: "Full Name" },
  { key: "college", label: "College" },
  { key: "email", label: "Email ID" },
  { key: "total_problems", label: "Problems Solved", sortable: true },
  { key: "total_score", label: "Total Score", sortable: true },
  { key: "current_streak", label: "Current Streak" },
  { key: "longest_streak", label: "Longest Streak" },
  { key: "created_at", label: "Registered Date" },
  { key: "actions", label: "Actions" },
];

export default function AdminPage() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [sortKey, setSortKey] = useState("total_score");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [overview, setOverview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAdminData();

    const refreshOnFocus = () => loadAdminData();
    const refreshOnUpdate = () => loadAdminData();

    window.addEventListener("focus", refreshOnFocus);
    window.addEventListener("dsa-entry-submitted", refreshOnUpdate);

    const interval = setInterval(loadAdminData, 10000);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      window.removeEventListener("dsa-entry-submitted", refreshOnUpdate);
      clearInterval(interval);
    };
  }, []);

  async function loadAdminData() {
    try {
      const [membersRes, overviewRes] = await Promise.all([
        client.get("/admin/members"),
        client.get("/reports/admin/overview"),
      ]);
      setMembers(membersRes.data || []);
      setOverview(overviewRes.data || {});
      setError("");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUnauthorized(true);
      } else {
        setError("Unable to load admin data. Please refresh the page.");
      }
    }
  }

  useEffect(() => {
    if (unauthorized) {
      navigate("/");
    }
  }, [unauthorized, navigate]);

  const filteredMembers = useMemo(() => {
    return members
      .filter((member) => {
        const term = search.trim().toLowerCase();
        if (!term && !collegeFilter) return true;
        const matchesSearch =
          member.username?.toLowerCase().includes(term) ||
          member.full_name?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term) ||
          member.college?.toLowerCase().includes(term);
        const matchesCollege = collegeFilter ? member.college === collegeFilter : true;
        return matchesSearch && matchesCollege;
      })
      .sort((a, b) => {
        if (!sortKey) return 0;
        const aValue = a[sortKey] ?? 0;
        const bValue = b[sortKey] ?? 0;
        const multiplier = sortDirection === "asc" ? 1 : -1;
        return aValue > bValue ? multiplier : aValue < bValue ? -multiplier : 0;
      });
  }, [members, search, collegeFilter, sortKey, sortDirection]);

  const colleges = useMemo(
    () => [...new Set(members.map((member) => member.college).filter(Boolean))],
    [members]
  );

  const pageCount = Math.max(Math.ceil(filteredMembers.length / rowsPerPage), 1);
  const paginatedMembers = filteredMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  async function deleteUser(id) {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      await client.delete(`/admin/members/${id}`);
      setMembers((prev) => prev.filter((member) => member.id !== id));
      if (selectedMember?.id === id) {
        setSelectedMember(null);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to delete user.");
    }
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Admin Dashboard</p>
            <h1 className="text-3xl font-bold text-white">Member Management</h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              Manage members, enforce account control, and keep admin tools separate from rankings.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search username, full name, email, college"
              className="min-w-[260px] rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
            <select
              value={collegeFilter}
              onChange={(e) => {
                setCollegeFilter(e.target.value);
                setPage(0);
              }}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
            >
              <option value="">Filter by college</option>
              {colleges.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <Card>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Members</p>
              <p className="text-3xl font-semibold text-white">{overview?.total_members ?? "--"}</p>
              <p className="text-sm text-slate-400">Registered members only</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Problems</p>
              <p className="text-3xl font-semibold text-white">{overview?.total_problems ?? "--"}</p>
              <p className="text-sm text-slate-400">All member problems solved</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Score</p>
              <p className="text-3xl font-semibold text-white">{overview?.total_score ?? "--"}</p>
              <p className="text-sm text-slate-400">Aggregate member points</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active Today</p>
              <p className="text-3xl font-semibold text-white">{overview?.active_users_today ?? "--"}</p>
              <p className="text-sm text-slate-400">Members with submissions today</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">New Registrations</p>
              <p className="text-3xl font-semibold text-white">{overview?.new_registrations_today ?? "--"}</p>
              <p className="text-sm text-slate-400">New members registered today</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Highest Score</p>
              <p className="text-3xl font-semibold text-white">{overview?.highest_score ?? "--"}</p>
              <p className="text-sm text-slate-400">Top member score</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Highest Streak</p>
              <p className="text-3xl font-semibold text-white">{overview?.highest_streak ?? "--"}</p>
              <p className="text-sm text-slate-400">Longest member streak</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Colleges</p>
              <p className="text-3xl font-semibold text-white">{overview?.total_colleges ?? "--"}</p>
              <p className="text-sm text-slate-400">Distinct colleges represented</p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="overflow-x-auto rounded-3xl border border-slate-700 bg-slate-950/60">
            <table className="min-w-full divide-y divide-slate-700 text-left">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-4 text-sm font-semibold text-slate-400">
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (sortKey === column.key) {
                              setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
                            } else {
                              setSortKey(column.key);
                              setSortDirection("desc");
                            }
                          }}
                          className="inline-flex items-center gap-2"
                        >
                          {column.label}
                          <span className="text-xs text-slate-500">
                            {sortKey === column.key ? (sortDirection === "desc" ? "▼" : "▲") : "↕"}
                          </span>
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member, index) => (
                    <tr key={member.id} className="border-b border-slate-800 hover:bg-slate-900/80">
                      <td className="px-4 py-4 text-sm text-slate-300">{page * rowsPerPage + index + 1}</td>
                      <td className="px-4 py-4"><Avatar src={member.profile_picture} name={member.full_name} size={2.5} /></td>
                      <td className="px-4 py-4 text-sm text-white">{member.username}</td>
                      <td className="px-4 py-4 text-sm text-slate-300">{member.full_name}</td>
                      <td className="px-4 py-4 text-sm text-slate-300">{member.college || "-"}</td>
                      <td className="px-4 py-4 text-sm text-slate-300">{member.email}</td>
                      <td className="px-4 py-4 text-sm text-white">{member.total_problems}</td>
                      <td className="px-4 py-4 text-sm text-white">{member.total_score}</td>
                      <td className="px-4 py-4 text-sm text-slate-300">{member.current_streak}</td>
                      <td className="px-4 py-4 text-sm text-slate-300">{member.longest_streak}</td>
                      <td className="px-4 py-4 text-sm text-slate-300">{new Date(member.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="rounded-2xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                        >View</button>
                        <button
                          onClick={() => deleteUser(member.id)}
                          className="rounded-2xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                        >Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-slate-500">
                      No members match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Showing {paginatedMembers.length} of {filteredMembers.length} members</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >Previous</button>
              <span className="text-sm text-slate-300">Page {page + 1} of {pageCount}</span>
              <button
                disabled={page >= pageCount - 1}
                onClick={() => setPage((prev) => Math.min(prev + 1, pageCount - 1))}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >Next</button>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
              >
                {[10, 20, 30].map((value) => (
                  <option key={value} value={value}>{value} rows</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {selectedMember && (
          <Card title="Member Details">
            <div className="grid gap-4 lg:grid-cols-[0.6fr_1fr]">
              <div className="space-y-4 rounded-3xl border border-slate-700 bg-slate-900 p-6">
                <div className="flex items-center gap-4">
                  <Avatar src={selectedMember.profile_picture} name={selectedMember.full_name} size={4.5} />
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedMember.full_name}</h2>
                    <p className="text-slate-400">@{selectedMember.username}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div><span className="font-semibold text-white">Email:</span> {selectedMember.email}</div>
                  <div><span className="font-semibold text-white">College:</span> {selectedMember.college || "-"}</div>
                  <div><span className="font-semibold text-white">Problems Solved:</span> {selectedMember.total_problems}</div>
                  <div><span className="font-semibold text-white">Total Score:</span> {selectedMember.total_score}</div>
                  <div><span className="font-semibold text-white">Current Streak:</span> {selectedMember.current_streak}</div>
                  <div><span className="font-semibold text-white">Longest Streak:</span> {selectedMember.longest_streak}</div>
                  <div><span className="font-semibold text-white">Registered:</span> {new Date(selectedMember.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
                <h3 className="text-lg font-semibold text-white">Member Actions</h3>
                <p className="mt-2 text-slate-400">Use the controls below to manage this member account.</p>
                <button
                  onClick={() => deleteUser(selectedMember.id)}
                  className="mt-6 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-500"
                >Delete Member</button>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >Close</button>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-500 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>
        )}
      </div>
    </Shell>
  );
}
