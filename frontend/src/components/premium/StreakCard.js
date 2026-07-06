import React from 'react'
import { motion } from 'framer-motion'

export default function StreakCard({current, longest}){
  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="rounded-2xl bg-card/60 border border-slate-700 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-300 text-sm">🔥 Current Streak</div>
          <div className="text-white text-2xl font-bold">{current} Days</div>
        </div>
        <div className="text-right">
          <div className="text-slate-300 text-sm">🏆 Longest Streak</div>
          <div className="text-white font-semibold">{longest} Days</div>
        </div>
      </div>
    </motion.div>
  )
}
