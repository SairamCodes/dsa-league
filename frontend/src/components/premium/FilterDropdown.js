import React from 'react'

export default function FilterDropdown({options, value, onChange}){
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} className="px-3 py-2 rounded-lg bg-surface/40 border border-slate-700 text-white">
      <option value="">All Colleges</option>
      {options.map(opt=> (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}
