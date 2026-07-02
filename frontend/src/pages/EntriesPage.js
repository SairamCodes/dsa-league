import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Card from "../components/Card";
import client from "../api/client";

const platforms = [
  "LeetCode",
  "GeeksForGeeks",
  "CodeChef",
  "Codeforces",
  "AtCoder",
];

const patterns = [
  "Arrays",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Prefix Sum",
  "Binary Search",
  "Sorting",
  "Stack",
  "Queue",
  "Linked List",
  "Recursion",
  "Backtracking",
  "Trees",
  "BST",
  "Heap",
  "Trie",
  "Graph",
  "BFS",
  "DFS",
  "Topological Sort",
  "Union Find",
  "Greedy",
  "Dynamic Programming",
  "Bit Manipulation",
  "Math",
];

const difficulties = [
  "Easy",
  "Medium",
  "Hard",
];

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);

  const [form, setForm] = useState({
    platform: "LeetCode",
    problem_number: "",
    problem_name: "",
    problem_link: "",
    pattern: "Arrays",
    difficulty: "Easy",
    time_taken: "",
    solved: true,
    without_solution: false,
    revision: false,
    notes: "",
  });

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const res = await client.get("/entries/mine");
      setEntries(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await client.post("/entries/submit", {
        ...form,
        time_taken: Number(form.time_taken),
      });

      setEntries([res.data, ...entries]);

      setForm({
        platform: "LeetCode",
        problem_number: "",
        problem_name: "",
        problem_link: "",
        pattern: "Arrays",
        difficulty: "Easy",
        time_taken: "",
        solved: true,
        without_solution: false,
        revision: false,
        notes: "",
      });

    } catch (err) {
      console.log(err.response?.data);
    }
  }

  return (
    <Shell>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">

        <Card title="New Entry">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <Input
              label="Problem Number"
              value={form.problem_number}
              onChange={(v) =>
                setForm({
                  ...form,
                  problem_number: v,
                })
              }
            />

            <Input
              label="Problem Name"
              value={form.problem_name}
              onChange={(v) =>
                setForm({
                  ...form,
                  problem_name: v,
                })
              }
            />

            <Input
              label="Problem Link"
              value={form.problem_link}
              onChange={(v) =>
                setForm({
                  ...form,
                  problem_link: v,
                })
              }
            />

            <Select
              label="Platform"
              value={form.platform}
              options={platforms}
              onChange={(v) =>
                setForm({
                  ...form,
                  platform: v,
                })
              }
            />

            <Select
              label="Pattern"
              value={form.pattern}
              options={patterns}
              onChange={(v) =>
                setForm({
                  ...form,
                  pattern: v,
                })
              }
            />

            <Select
              label="Difficulty"
              value={form.difficulty}
              options={difficulties}
              onChange={(v) =>
                setForm({
                  ...form,
                  difficulty: v,
                })
              }
            />

            <Input
              label="Time Taken (minutes)"
              type="number"
              value={form.time_taken}
              onChange={(v) =>
                setForm({
                  ...form,
                  time_taken: v,
                })
              }
            />

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <h3 className="text-white font-semibold mb-3">
                Options
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-white">
                  <input
                    type="checkbox"
                    checked={form.solved}
                    onChange={(e)=>
                      setForm({
                        ...form,
                        solved:e.target.checked
                      })
                    }
                    className="h-5 w-5"
                  />
                  Solved
                </label>
                <label className="flex items-center gap-3 text-white">
                  <input
                    type="checkbox"
                    checked={form.without_solution}
                    onChange={(e)=>
                      setForm({
                        ...form,
                        without_solution:e.target.checked
                      })
                    }
                    className="h-5 w-5"
                  />
                  Solved Without Solution
                </label>
                <label className="flex items-center gap-3 text-white">
                  <input
                    type="checkbox"
                    checked={form.revision}
                    onChange={(e)=>
                      setForm({
                        ...form,
                        revision:e.target.checked
                      })
                    }
                    className="h-5 w-5"
                  />
                  Revision
                </label>
              </div>
            </div>

            <textarea
              rows={5}
              placeholder="Notes..."
              className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white p-3 resize-none outline-none focus:border-cyan-400"
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
            />

            <button
              className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black hover:bg-cyan-400"
            >
              Submit Entry
            </button>

          </form>

        </Card>

        <Card title="Recent Entries">

          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">

            {entries.map((entry) => (

              <div
                key={entry.id}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-5 hover:border-cyan-500 transition"
              >

                <h3 className="font-bold text-white">
                  {entry.problem_name}
                </h3>

                <p className="text-slate-400">

                  {entry.platform} • {entry.pattern} •{" "}
                  {entry.difficulty}

                </p>

                <div className="mt-3 flex justify-between">
                  <span className="text-cyan-400 font-semibold">Score : {entry.score}</span>
                  <span className="text-slate-400">{entry.difficulty}</span>
                </div>

              </div>

            ))}

          </div>

        </Card>

      </div>

    </Shell>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label className="text-white block mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white p-3 outline-none focus:border-cyan-400"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <div>
      <label className="text-white block mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white p-3 outline-none focus:border-cyan-400"
      >
        {options.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}