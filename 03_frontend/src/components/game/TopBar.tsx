import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import './game.css'

interface ClockConfig {
  epoch: string
  real_hours_per_game_day: number
  days_per_year: number
  starting_year: number
  starting_day: number
  date_format: string
}

function calcGameTime(config: ClockConfig): { year: number; day: number; hour: number; minute: number; second: number } {
  const epochMs = new Date(config.epoch).getTime()
  const nowMs = Date.now()
  const elapsedRealMs = nowMs - epochMs

  const gameHoursPerRealHour = 24 / config.real_hours_per_game_day
  const elapsedRealHours = elapsedRealMs / (1000 * 60 * 60)
  const totalGameHours = elapsedRealHours * gameHoursPerRealHour

  const totalGameDays = Math.floor(totalGameHours / 24)
  const remainingHours = totalGameHours % 24
  const hour = Math.floor(remainingHours)
  const remainingMinutes = (remainingHours - hour) * 60
  const minute = Math.floor(remainingMinutes)
  const second = Math.floor((remainingMinutes - minute) * 60)

  const absoluteDay = config.starting_day + totalGameDays
  const yearOffset = Math.floor((absoluteDay - 1) / config.days_per_year)
  const dayInYear = ((absoluteDay - 1) % config.days_per_year) + 1

  return { year: config.starting_year + yearOffset, day: dayInYear, hour, minute, second }
}

function formatTime(h: number, m: number, s: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function TopBar() {
  const [config, setConfig] = useState<ClockConfig | null>(null)
  const [time, setTime] = useState<{ year: number; day: number; hour: number; minute: number; second: number } | null>(null)

  useEffect(() => {
    apiFetch('/world-clock')
      .then(res => res.json())
      .then(setConfig)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!config) return
    const tick = () => setTime(calcGameTime(config))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [config])

  return (
    <div className="topbar">
      <span className="topbar-title">THE CAMP</span>
      <div className="topbar-resources">
        <span className="resource"><span className="dot" style={{ background: '#639922' }}></span>Food <span className="resource-val">50</span></span>
        <span className="resource"><span className="dot" style={{ background: '#185fa5' }}></span>Medicine <span className="resource-val">20</span></span>
        <span className="resource"><span className="dot" style={{ background: '#ba7517' }}></span>Morale <span className="resource-val">70</span></span>
        <span className="resource"><span className="dot" style={{ background: '#533b2a' }}></span>Population <span className="resource-val">5</span></span>
      </div>
      <span className="topbar-clock">
        {time ? (
          <span className="clock-inline">Y{time.year} · D{time.day} · {formatTime(time.hour, time.minute, time.second)}</span>
        ) : (
          <span className="clock-loading">--:--:--</span>
        )}
      </span>
    </div>
  )
}
