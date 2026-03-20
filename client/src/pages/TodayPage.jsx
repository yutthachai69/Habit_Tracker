import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import { getLogsForDate, toggleLog } from '../api'

export default function TodayPage() {
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncingHabitId, setSyncingHabitId] = useState(null)
  
  // XP & Level State
  const [xpData, setXpData] = useState({ level: 1, progressPct: 0, totalXP: 0 })
  
  // Custom Toast state
  
  // Custom Toast state
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' })
  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 4500)
  }

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchData()
    fetchXP()
  }, [])
  
  const fetchXP = async () => {
    try {
      const res = await fetch('/api/logs/xp')
      const data = await res.json()
      
      // Check for level up
      if (xpData.totalXP > 0 && data.level > xpData.level) {
        showToast('LEVEL UP! 🎈', `ยินดีด้วย! คุณเลเวลอัปเป็น Level ${data.level} แล้ว!`, 'success')
      }
      
      setXpData(data)
    } catch (err) {
      console.error('Failed to fetch XP:', err)
    }
  }

  const fetchData = async () => {
    try {
      const data = await getLogsForDate(todayStr)
      setHabits(data)
    } catch (err) {
      console.error('Failed to load habits:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (habitId) => {
    // Optimistic UI update
    setHabits((prev) =>
      prev.map((h) => (h._id === habitId ? { ...h, completed: !h.completed } : h))
    )
    try {
      await toggleLog(habitId, todayStr)
      // Refresh XP after toggle
      fetchXP()
    } catch (err) {
      console.error('Failed to toggle:', err)
      // Revert if failed
      fetchData()
    }
  }

  const handleSyncData = async (habit) => {
    setSyncingHabitId(habit._id)
    try {
      const res = await fetch(`/api/fit/sync?date=${todayStr}`)
      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการซิงค์ข้อมูล')
      const data = await res.json()
      
      const currentValue = habit.syncType === 'distance' ? data.distance : data.steps
      const goal = habit.goal

      if (currentValue >= goal) {
        if (!habit.completed) {
          // If goal reached and not yet marked completed, toggle it
          await handleToggle(habit._id)
        }
        showToast('เป้าหมายสำเร็จ! 🎉', `ยอดเยี่ยมมาก! คุณทำได้ ${currentValue.toLocaleString()} ${habit.syncType === 'distance' ? 'เมตร' : 'ก้าว'} (เป้าหมาย: ${goal.toLocaleString()})`, 'success')
      } else {
        showToast('สู้ต่อไป พยายามเข้า! 💪', `ตอนนี้คุณทำไปได้ ${currentValue.toLocaleString()} ${habit.syncType === 'distance' ? 'เมตร' : 'ก้าว'} (ขาดอีก ${(goal - currentValue).toLocaleString()})`, 'info')
      }
      // Refresh XP
      fetchXP()
    } catch (err) {
      showToast('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ Google Fit ได้ กรุณาลองใหม่', 'error')
      console.error(err)
    } finally {
      setSyncingHabitId(null)
    }
  }

  const completedCount = habits.filter((h) => h.completed).length
  const totalCount = habits.length
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 relative">
      <TopAppBar title="วันนี้" />

      {/* Custom Toast Notification */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out flex w-[90%] max-w-md ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className={`w-full p-4 rounded-[24px] shadow-2xl flex items-start gap-4 backdrop-blur-xl ${
          toast.type === 'success' ? 'bg-primary-container/95 text-on-primary-container border border-primary/20' :
          toast.type === 'error' ? 'bg-error-container/95 text-error border border-error/20' :
          'bg-secondary-container/95 text-on-secondary-container border border-secondary/20'
        }`}>
          <div className="pt-0.5">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-headline font-bold text-base leading-tight">{toast.title}</h4>
            <p className="font-label text-sm mt-1 opacity-90 leading-snug">{toast.message}</p>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="opacity-50 hover:opacity-100 transition-opacity p-1">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      <main className="px-6 py-4 space-y-10">
        {/* Life Level - Gamification Badge */}
        <section className="bg-gradient-to-br from-[#1a1a1a] to-[#333] dark:from-indigo-900 dark:to-purple-900 rounded-[32px] p-6 shadow-xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <span className="material-symbols-outlined text-8xl text-white">workspace_premium</span>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 rotate-3 group-hover:rotate-0 transition-transform">
                <span className="text-white font-black text-2xl">LV{xpData.level}</span>
              </div>
              <div>
                <h3 className="text-white font-headline font-bold text-xl tracking-tight">Life Progress</h3>
                <p className="text-white/60 font-label text-sm uppercase tracking-[0.2em] mt-0.5">สถานะ: จอมขยันมือใหม่</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-sm">
              <div className="flex justify-between items-end mb-2.5">
                <span className="text-white/80 font-label text-xs font-bold uppercase">{xpData.totalXP.toLocaleString()} Total XP</span>
                <span className="text-yellow-400 font-label text-xs font-black">Level {xpData.level + 1} เขยิบเข้ามาแล้ว!</span>
              </div>
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md p-[2px]">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  style={{ width: `${xpData.progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Today's Focus - Bento Section */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-on-surface-variant font-label text-sm uppercase tracking-widest font-semibold">
              เป้าหมายวันนี้
            </h2>
            <span className="text-primary font-bold text-lg">{completionPct}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Progress Card */}
            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-[32px] flex flex-col justify-between min-h-[220px] relative overflow-hidden group border border-outline-variant/10 shadow-sm">
              <div className="relative z-10">
                <p className="text-on-surface-variant font-label text-xs mb-2">ความก้าวหน้า</p>
                <h3 className="text-4xl font-extrabold text-on-surface leading-tight">
                  {completionPct === 100 && totalCount > 0 ? 'ครบหมดแล้ว!' : 'สู้ต่อไป!'}
                </h3>
              </div>
              <div className="mt-6 relative z-10">
                <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p className="mt-3 text-on-surface-variant font-label text-sm">
                  ทำสำเร็จแล้ว {completedCount} จาก {totalCount} รายการ
                </p>
              </div>
              {/* Abstract Background Pattern */}
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-[200px]">eco</span>
              </div>
            </div>

            {/* Empty State / Add Action */}
            {totalCount === 0 && !loading && (
              <div
                onClick={() => navigate('/add-habit')}
                className="bg-secondary-container p-6 rounded-[32px] flex flex-col justify-center items-center text-center space-y-2 cursor-pointer hover:bg-secondary-container/80 transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-4xl">add_circle</span>
                <p className="font-headline font-bold text-xl text-on-secondary-container">เพิ่มนิสัยใหม่</p>
              </div>
            )}
          </div>
        </section>

        {/* Habits List Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-on-surface-variant font-label text-sm uppercase tracking-widest font-semibold">
              รายการนิสัย
            </h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-on-surface-variant animate-pulse py-10">กำลังโหลด...</p>
            ) : habits.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-outline-variant/30 rounded-3xl">
                <p className="text-on-surface-variant mb-2">ยังไม่ได้ติดตามนิสัยไหนเลย</p>
                <button
                  onClick={() => navigate('/add-habit')}
                  className="text-primary font-bold hover:underline"
                >
                  สร้างนิสัยแรกของคุณ
                </button>
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit._id}
                  className={`${
                    habit.completed
                      ? 'bg-primary-fixed-dim text-on-primary-fixed'
                      : 'bg-surface-container-lowest border border-outline-variant/10 text-on-surface'
                  } p-5 rounded-3xl flex justify-between items-center transition-all hover:scale-[1.01] shadow-sm`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        habit.completed ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined">{habit.icon || 'check_circle'}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{habit.name}</h4>
                      <p className="text-xs opacity-70 mt-1 uppercase tracking-wider font-label">
                        {habit.frequency}
                      </p>
                    </div>
                  </div>

                  {habit.isSynced ? (
                    <button
                      onClick={() => handleSyncData(habit)}
                      disabled={syncingHabitId === habit._id}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        habit.completed
                          ? 'bg-on-primary-fixed text-white shadow-md'
                          : 'bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white shadow-sm disabled:opacity-50'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${syncingHabitId === habit._id ? 'animate-spin' : ''}`}>
                        {syncingHabitId === habit._id ? 'sync' : (habit.completed ? 'check' : 'sync')}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggle(habit._id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        habit.completed
                          ? 'bg-on-primary-fixed text-white shadow-md'
                          : 'border-2 border-outline-variant hover:bg-primary-container hover:border-primary-container text-transparent hover:text-on-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {habit.completed ? 'check' : 'done'}
                      </span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* FAB */}
      <div className="fixed right-6 bottom-28 z-50">
        <button
          onClick={() => navigate('/add-habit')}
          className="bg-primary text-on-primary w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      <BottomNavBar />
    </div>
  )
}
