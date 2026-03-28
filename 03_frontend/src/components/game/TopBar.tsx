import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import './game.css'

interface ClockConfig {
  epoch: string
  real_hours_per_game_day: number
  starting_year: number
  starting_month: number
  starting_day: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

interface GameTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function calcGameTime(config: ClockConfig): GameTime {
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

  // Walk forward from starting date
  let year = config.starting_year
  let month = config.starting_month - 1 // 0-indexed
  let day = config.starting_day
  let daysLeft = totalGameDays

  while (daysLeft > 0) {
    const daysInCurrentMonth = DAYS_IN_MONTH[month]
    const daysRemainingInMonth = daysInCurrentMonth - day + 1

    if (daysLeft >= daysRemainingInMonth) {
      daysLeft -= daysRemainingInMonth
      month++
      day = 1
      if (month >= 12) {
        month = 0
        year++
      }
    } else {
      day += daysLeft
      daysLeft = 0
    }
  }

  return { year, month: month + 1, day, hour, minute, second }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function TopBar() {
  const [config, setConfig] = useState<ClockConfig | null>(null)
  const [time, setTime] = useState<GameTime | null>(null)

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
          <span className="clock-inline">{time.year} · {MONTH_NAMES[time.month - 1]} {time.day} · {pad(time.hour)}:{pad(time.minute)}:{pad(time.second)}</span>
        ) : (
          <span className="clock-loading">--:--:--</span>
        )}
      </span>
    </div>
  )
}
