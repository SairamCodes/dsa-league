import React from 'react'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'

import Avatar from '../Avatar'

export default function Podium({ top }){
  return (
    <motion.div initial={{y:50, opacity:0}} animate={{y:0, opacity:1}} className="w-full bg-card/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex items-end justify-center gap-6">
        {top[1] && (
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-gradient-to-br from-slate-700 to-slate-600 p-1 shadow-soft">
              <Avatar src={top[1].profile_picture} name={top[1].full_name} size={5} />
            </div>
            <div className="mt-3 text-center text-slate-300">2</div>
            <div className="text-white font-semibold">{top[1].full_name}</div>
            <div className="text-slate-400 text-sm">{top[1].score} pts</div>
            <div className="mt-2 text-slate-300 text-xs">{top[1].college}</div>
          </div>
        )}

        {top[0] && (
          <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-yellow-300"><Crown size={28} /></div>
              <div className="rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 p-1 shadow-lg">
                <Avatar src={top[0].profile_picture} name={top[0].full_name} size={6} />
              </div>
            </div>
            <div className="mt-3 text-center text-slate-300">1</div>
            <div className="text-white text-xl font-bold">{top[0].full_name}</div>
            <div className="text-slate-400 text-sm">{top[0].score} pts</div>
            <div className="mt-2 text-slate-300 text-xs">{top[0].college}</div>
          </motion.div>
        )}

        {top[2] && (
          <div className="flex flex-col items-center">
              <div className="rounded-full bg-gradient-to-br from-amber-700 to-orange-600 p-1 shadow-soft">
              <Avatar src={top[2].profile_picture} name={top[2].full_name} size={4.5} />
            </div>
            <div className="mt-3 text-center text-slate-300">3</div>
            <div className="text-white font-semibold">{top[2].full_name}</div>
            <div className="text-slate-400 text-sm">{top[2].score} pts</div>
            <div className="mt-2 text-slate-300 text-xs">{top[2].college}</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
