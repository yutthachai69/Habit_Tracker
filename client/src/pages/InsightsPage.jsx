import { useState, useEffect } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import { getMonthStats } from '../api'

export default function InsightsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const currentMonthStr = today.toISOString().slice(0, 7) // YYYY-MM

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await getMonthStats(currentMonthStr)
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fallback data if API is loading or fails
  const weeklyBars = stats?.weekly || [
    { day: 'จันทร์', pct: 0, isToday: false },
    { day: 'อังคาร', pct: 0, isToday: false },
    { day: 'พุธ', pct: 0, isToday: false },
    { day: 'พฤหัสบดี', pct: 0, isToday: false },
    { day: 'ศุกร์', pct: 0, isToday: false },
    { day: 'เสาร์', pct: 0, isToday: false },
    { day: 'อาทิตย์', pct: 0, isToday: true },
  ]

  const habitPerformance = stats?.habitPerformance || []
  
  // Calculate average weekly completion
  const avgWeekly = weeklyBars.length > 0 
    ? Math.round(weeklyBars.reduce((sum, b) => sum + b.pct, 0) / weeklyBars.length)
    : 0

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen pb-32">
      <TopAppBar title="ข้อมูลเชิงลึก" />

      <main className="px-6 mt-6 space-y-10">
        {/* Hero Streak Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-6 rounded-[32px] flex flex-col justify-between h-64 relative overflow-hidden group shadow-sm border border-outline-variant/5">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl group-hover:bg-primary-container/40 transition-colors duration-500" />
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label text-[10px] font-semibold tracking-wider uppercase mb-4 shadow-sm">
                ความก้าวหน้าตอนนี้
              </span>
              <h2 className="font-headline text-5xl font-extrabold text-primary">
                {loading ? '...' : `ทำต่อเนื่อง ${stats?.streak || 0} วัน`} 🔥
              </h2>
            </div>
            <p className="font-label text-sm text-on-surface-variant">
              ทุกวันมีความหมาย รักษานิสัยที่ดีต่อไป
            </p>
          </div>

          {/* Average Completion Metric */}
          <div className="bg-secondary-container p-6 rounded-[32px] flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-secondary-container">ค่าเฉลี่ยความสำเร็จ</h3>
              <p className="font-label text-xs text-on-secondary-container/70">ผลงานช่วง 7 วันที่ผ่านมา</p>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-headline text-6xl font-extrabold text-on-secondary-container">
                {loading ? '--' : avgWeekly}<span className="text-2xl opacity-60">%</span>
              </span>
              <div className="pb-2">
                <span className="material-symbols-outlined text-on-secondary-container">
                  {avgWeekly > 50 ? 'trending_up' : 'trending_flat'}
                </span>
              </div>
            </div>
            <div className="w-full bg-on-secondary-container/10 h-2 rounded-full overflow-hidden mt-4">
              <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: `${avgWeekly}%` }} />
            </div>
          </div>
        </section>

        {/* Weekly Bar Chart */}
        <section className="bg-surface-container-lowest p-8 rounded-[40px] shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">ความสำเร็จรายสัปดาห์</h2>
              <p className="font-label text-sm text-on-surface-variant">ภาพรวมนิสัยทั้งหมด</p>
            </div>
            <div className="text-right">
              <span className="font-headline text-xl font-bold text-primary">{avgWeekly}%</span>
              <p className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">เฉลี่ย</p>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyBars.map(({ day, pct, isToday }, idx) => (
              <div key={`${day}-${idx}`} className="flex-1 flex flex-col items-center gap-3">
                <div
                  className={`w-full rounded-t-2xl transition-all duration-700 relative group ${isToday ? 'bg-primary' : 'bg-surface-container-low hover:bg-primary-container'}`}
                  style={{ height: `${Math.max(pct, 5)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {pct}%
                  </div>
                </div>
                <span className={`font-label text-[10px] ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Habit Performance */}
        <section className="space-y-4">
          <h2 className="font-headline text-xl font-bold">สถิตินิสัย (เดือนนี้)</h2>
          
          <div className="bg-surface-container rounded-[32px] overflow-hidden p-2">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant animate-pulse">กำลังโหลดสถิติ...</div>
            ) : habitPerformance.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">ยังไม่พบข้อมูล</div>
            ) : (
              habitPerformance.map((h, i) => (
                <div
                  key={h._id}
                  className={`bg-surface-container-lowest p-5 rounded-[24px] flex items-center justify-between shadow-sm border border-outline-variant/5 ${i < habitPerformance.length - 1 ? 'mb-2' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined">{h.icon || 'star'}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-sm">{h.name}</h4>
                      <p className="font-label text-xs text-on-surface-variant">ความสำเร็จประจำเดือน</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-label text-xs font-bold ${
                    h.pct >= 80 ? 'bg-primary-container text-on-primary-container' : 
                    h.pct >= 50 ? 'bg-tertiary-container text-on-tertiary-container' : 
                    'bg-surface-container-low text-on-surface-variant'
                  }`}>
                    {h.pct}%
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
