import React, {useEffect, useState, useMemo} from 'react'
import Podium from './Podium'
import LeaderboardCard from './LeaderboardCard'
import SearchBar from './SearchBar'
import FilterDropdown from './FilterDropdown'
import { motion } from 'framer-motion'
import client from '../../api/client'

export default function Leaderboard(){
  const [tab, setTab] = useState('all')
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [college, setCollege] = useState('')

  useEffect(()=>{
    load()

    const refreshOnFocus = () => load()
    const refreshOnUpdate = () => load()

    window.addEventListener('focus', refreshOnFocus)
    window.addEventListener('dsa-entry-submitted', refreshOnUpdate)

    const interval = setInterval(load, 10000)
    return () => {
      window.removeEventListener('focus', refreshOnFocus)
      window.removeEventListener('dsa-entry-submitted', refreshOnUpdate)
      clearInterval(interval)
    }
  }, [tab])

  async function load(){
    try{
      let url = '/reports/leaderboard'
      if(tab === 'weekly') url = '/reports/weekly'
      if(tab === 'monthly') url = '/reports/monthly'

      const res = await client.get(url)
      // normalize response
      const data = res.data.leaderboard || res.data || res.data
      // if weekly/monthly return SimpleReportResponse
      const list = Array.isArray(data) ? data : (data.leaderboard || [])
      setMembers(list.map((m,i)=> ({...m, rank: m.rank || i+1})))
    }catch(e){
      console.error(e)
    }
  }

  const colleges = useMemo(()=> [...new Set(members.map(m=>m.college).filter(Boolean))], [members])

  const filtered = members.filter(m=>{
    if(college && m.college !== college) return false
    if(!search) return true
    const q = search.toLowerCase()
    return (m.username && m.username.toLowerCase().includes(q)) || (m.full_name && m.full_name.toLowerCase().includes(q))
  })

  const top = filtered.slice(0,3)
  const rest = filtered.slice(3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={()=>setTab('weekly')} className={`px-4 py-2 rounded-lg ${tab==='weekly'?'bg-primary text-black':'bg-surface/20 text-white'}`}>Weekly</button>
          <button onClick={()=>setTab('monthly')} className={`px-4 py-2 rounded-lg ${tab==='monthly'?'bg-primary text-black':'bg-surface/20 text-white'}`}>Monthly</button>
          <button onClick={()=>setTab('all')} className={`px-4 py-2 rounded-lg ${tab==='all'?'bg-primary text-black':'bg-surface/20 text-white'}`}>All Time</button>
        </div>

        <div className="flex items-center gap-3 w-1/3">
          <SearchBar value={search} onChange={setSearch} />
          <FilterDropdown options={colleges} value={college} onChange={setCollege} />
        </div>
      </div>

      <Podium top={top} />

      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-3">
        {rest.map(m=> (<LeaderboardCard key={m.id || m.user_id || m.username} member={m} />))}
      </motion.div>
    </div>
  )
}
