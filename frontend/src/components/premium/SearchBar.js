import React from 'react'

export default function SearchBar({value, onChange}){
  return (
    <div className="relative">
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder="Search by username or full name..." className="w-full px-4 py-2 rounded-lg bg-surface/40 border border-slate-700 placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  )
}
