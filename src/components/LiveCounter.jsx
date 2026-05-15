import { useEffect, useState } from 'react'

function getTimeDiff(startDate, startTime) {
  if (!startDate) return null
  const start = new Date(`${startDate}T${startTime || '00:00'}:00`)
  const now = new Date()
  const diff = now - start
  if (diff < 0) return null

  const totalSeconds = Math.floor(diff / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)
  const years = Math.floor(totalDays / 365)
  const months = Math.floor((totalDays % 365) / 30)
  const days = totalDays % 30

  return { years, months, days, hours, minutes, seconds }
}

export default function LiveCounter({ startDate, startTime, dark = false }) {
  const [diff, setDiff] = useState(() => getTimeDiff(startDate, startTime))

  useEffect(() => {
    setDiff(getTimeDiff(startDate, startTime))
    const id = setInterval(() => setDiff(getTimeDiff(startDate, startTime)), 1000)
    return () => clearInterval(id)
  }, [startDate, startTime])

  if (!diff) return null

  const items = [
    { label: 'Anos', value: diff.years },
    { label: 'Meses', value: diff.months },
    { label: 'Dias', value: diff.days },
    { label: 'Horas', value: diff.hours },
    { label: 'Minutos', value: diff.minutes },
    { label: 'Segundos', value: diff.seconds },
  ]

  if (dark) {
    return (
      <div className="grid grid-cols-3 gap-2 mt-3">
        {items.map(({ label, value }) => (
          <div key={label} className="rounded-xl py-3 text-center" style={{ background: '#1a1a26' }}>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mt-4">
      <p className="text-xs font-semibold text-gray-400 text-center mb-3 uppercase tracking-wide">
        Uau, vocês estão juntos há
      </p>
      <div className="grid grid-cols-3 gap-2">
        {items.map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl py-3 text-center border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
