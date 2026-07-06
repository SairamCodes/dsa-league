import React from 'react'

function getInitials(name){
  if(!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if(parts.length===1) return parts[0].slice(0,2).toUpperCase()
  return (parts[0][0]+parts[parts.length-1][0]).toUpperCase()
}

function colorFromName(name){
  const colors = ['from-pink-500','from-indigo-500','from-emerald-400','from-amber-400','from-cyan-400','from-rose-400']
  let hash = 0
  for(let i=0;i<name.length;i++) hash = name.charCodeAt(i) + ((hash<<5)-hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function Avatar({src, name, size=2.5, className=''}){
  const initials = getInitials(name || '')
  const bg = colorFromName(name || initials)
  if(src){
    return <img src={src} alt={name||'avatar'} className={`rounded-full border border-white/6 object-cover ${className}`} style={{width:`${size}rem`, height:`${size}rem`}} />
  }
  return (
    <div className={`rounded-full ${className}`} style={{width:`${size}rem`, height:`${size}rem`}}>
      <div className={`w-full h-full rounded-full bg-gradient-to-br ${bg} to-slate-700 flex items-center justify-center`}>
        <span className="text-white font-bold" style={{fontSize:`${size*0.45}rem`}}>{initials}</span>
      </div>
    </div>
  )
}
