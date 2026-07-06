import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

export default function Heatmap({entries}){
  // entries: array of {date: '2026-07-01', count: number}
  return (
    <div>
      <CalendarHeatmap
        startDate={new Date(new Date().setFullYear(new Date().getFullYear()-1))}
        endDate={new Date()}
        values={entries}
        classForValue={value => {
          if (!value) return 'color-empty'
          if (value.count >= 5) return 'color-github-4'
          if (value.count >= 3) return 'color-github-3'
          if (value.count >= 1) return 'color-github-2'
          return 'color-github-1'
        }}
        showWeekdayLabels={true}
      />
    </div>
  )
}
