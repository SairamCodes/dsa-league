import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'
import Avatar from '../Avatar'

export default function LeaderboardCard({member}){
  const change = member.rank_change || 0
  const changeEl = change > 0 ? <span className="text-success flex items-center gap-1"><ArrowUp size={14}/>+{change}</span> : change < 0 ? <span className="text-danger flex items-center gap-1"><ArrowDown size={14}/>{change}</span> : <span className="text-slate-400">—</span>

  return (
    <motion.div whileHover={{scale:1.01}} className="flex items-center gap-4 p-4 rounded-2xl bg-card/60 border border-slate-700">
      <div className="w-12 text-center text-slate-300 font-bold">#{member.rank}</div>
      {/* avatar */}
      <div className="w-12 h-12">
        <Avatar src={member.profile_picture} name={member.full_name} size={3} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">{member.full_name}</div>
            <div className="text-slate-400 text-sm">@{member.username} • {member.college || '—'}</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">{member.score} pts</div>
            <div className="text-slate-400 text-sm">{member.problems_solved} solved</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
          <div>🔥 {member.current_streak ?? 0}</div>
          <div>🏆 {member.longest_streak ?? 0}</div>
          <div>🥇 {member.total_badges ?? 0}</div>
          <div>{changeEl}</div>
        </div>
      </div>
    </motion.div>
  )
}
