import React from 'react'

export default function RecentActivity({entries}){
  return (
    <div className="space-y-4">
      {entries.map(e=> (
        <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700">
          <div>
            <div className="text-white font-semibold">Solved {e.problem_name}</div>
            <div className="text-slate-400 text-sm">{e.difficulty} • {new Date(e.date).toLocaleDateString()}</div>
          </div>
          <div className="text-green-400 font-bold">+{e.score}</div>
        </div>
      ))}
      {entries.length===0 && <div className="text-slate-400">No recent activity</div>}
    </div>
  )
}
