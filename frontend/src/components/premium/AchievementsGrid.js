import React from 'react'
import { motion } from 'framer-motion'

const ICONS = {
  "First Problem": "🥇",
  "10 Problems": "🏅",
  "50 Problems": "🥈",
  "100 Problems": "🏆",
  "250 Problems": "🎖️",
  "500 Problems": "🚀",
  "1000 Problems": "🌟",
  "7 Day Streak": "🔥",
  "15 Day Streak": "⚡",
  "30 Day Streak": "🏁",
  "100 Day Streak": "🏅",
  "Hashing Master": "🔐",
  "DP Master": "🧠",
  "Graph Master": "🌐",
  "Tree Master": "🌲",
  "Fast Solver": "⏱️",
  "Consistency King": "👑",
  "Weekend Warrior": "📅",
  "Monthly Champion": "🏆",
  "Weekly Champion": "🏅",
}

export default function AchievementsGrid({achievements}){
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-slate-400">No unlocked achievements yet.</div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement, index) => {
        const title = achievement.name || achievement.type || `Achievement ${index + 1}`
        const date = achievement.awarded_at
          ? new Date(achievement.awarded_at).toLocaleDateString()
          : achievement.date
        const icon = achievement.icon || ICONS[achievement.type] || "🏅"

        return (
          <motion.div
            key={`${achievement.type}-${index}`}
            whileHover={{ scale: 1.03 }}
            className="p-4 rounded-3xl border border-slate-700 bg-slate-900/80"
          >
            <div className="text-3xl">{icon}</div>
            <div className="mt-3 text-sm text-slate-400">{title}</div>
            <div className="mt-2 text-white font-semibold">Unlocked</div>
            <div className="text-xs text-slate-500">{date}</div>
          </motion.div>
        )
      })}
    </div>
  )
}
