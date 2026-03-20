import { useState, useEffect } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import { getMonthStats, getLogsForDate } from '../api'

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function CalendarPage() {
  const [stats, setStats] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dayLogs, setDayLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)

  const today = new Date()
  const currentMonthStr = today.toISOString().slice(0, 7) // YYYY-MM
  const monthName = today.toLocaleDateString('en-US', { month: 'long' })

  // Calculate days for the calendar grid
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const prevMonthDays = Array.from({ length: firstDay }, (_, i) => {
    const d = new Date(year, month, 0).getDate() - firstDay + i + 1
    return d
  })

  useEffect(() => {
    fetchMonthStats()
  }, [])

  useEffect(() => {
    fetchDayActivity(selectedDate)
  }, [selectedDate])

  const fetchMonthStats = async () => {
    try {
      const data = await getMonthStats(currentMonthStr)
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDayActivity = async (dateStr) => {
    setLogsLoading(true)
    try {
      const data = await getLogsForDate(dateStr)
      setDayLogs(data)
    } catch (err) {
      console.error('Failed to load day logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }

  // Create a fast lookup for fully completed days
  const streakDays = new Set()
  if (stats?.dailySummary) {
    stats.dailySummary.forEach((s) => {
      if (s.fullyDone) {
        // extract 'DD' from 'YYYY-MM-DD'
        streakDays.add(parseInt(s.date.split('-')[2], 10))
      }
    })
  }

  const completedActivities = dayLogs.filter(l => l.completed)

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-32">
      <TopAppBar title="ปฏิทิน" />

      <main className="px-6 mt-8 max-w-2xl mx-auto">
        {/* Month Selector & Stats */}
        <section className="mb-8 flex justify-between items-end">
          <div>
            <p className="font-label text-sm text-on-surface-variant mb-1">ความก้าวหน้าตอนนี้</p>
            <h2 className="font-headline text-4xl font-extrabold text-on-surface">{monthName}</h2>
          </div>
          <div className="bg-surface-container-lowest px-4 py-2 rounded-xl shadow-sm border border-outline-variant/15 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-tertiary animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="font-label text-on-surface font-bold">
              ทำต่อเนื่อง {stats?.streak || 0} วัน
            </span>
          </div>
        </section>

        {/* Monthly Calendar Grid */}
        <section className="bg-surface-container rounded-[32px] p-6 mb-8 shadow-sm">
          {/* Weekday headers */}
          <div className="calendar-grid mb-4 text-center">
            {weekDays.map((d, i) => (
              <div key={i} className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>
          {/* Calendar days */}
          <div className="calendar-grid gap-2">
            {prevMonthDays.map((d) => (
              <div key={`prev-${d}`} className="aspect-square flex items-center justify-center text-on-surface-variant/30 text-sm">
                {d}
              </div>
            ))}
            {currentMonthDays.map((d) => {
              const isStreak = streakDays.has(d)
              const dateStr = `${currentMonthStr}-${String(d).padStart(2, '0')}`
              const isSelected = dateStr === selectedDate
              
              return (
                <div
                  key={d}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium cursor-pointer transition-all
                    ${isSelected
                      ? 'bg-primary text-on-primary font-bold ring-4 ring-primary-container/50 scale-110 z-10'
                      : isStreak
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                >
                  {d}
                </div>
              )
            })}
          </div>
        </section>

        {/* Selected Day Summary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-headline text-2xl font-bold">
              กิจกรรม {new Date(selectedDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
            </h3>
            <span className="font-label text-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
              สำเร็จ {completedActivities.length} รายการ
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {logsLoading ? (
              <div className="col-span-2 text-center py-10 text-on-surface-variant animate-pulse">
                กำลังโหลดกิจกรรม...
              </div>
            ) : dayLogs.length === 0 ? (
              <div className="col-span-2 text-center py-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
                <p className="text-on-surface-variant">ไม่มีนิสัยที่ต้องทำในวันนี้</p>
              </div>
            ) : (
              dayLogs.map((a, i) => (
                <div 
                  key={a._id} 
                  className={`bg-surface-container-lowest p-5 rounded-[24px] shadow-sm flex flex-col justify-between aspect-square border border-outline-variant/5 ${a.completed ? 'ring-2 ring-primary/20' : 'opacity-60 grayscale'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.completed ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined">{a.icon || 'check_circle'}</span>
                    </div>
                    {a.completed && (
                      <span
                        className="material-symbols-outlined text-primary shadow-sm rounded-full"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-headline text-lg font-bold leading-tight">{a.name}</h4>
                    <p className="font-label text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider">{a.frequency}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  )
}
