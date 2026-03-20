import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavBar from '../components/BottomNavBar'
import { createHabit } from '../api'

const frequencies = [
  { id: 'everyday', label: 'ทุกวัน', icon: 'check_circle' },
  { id: 'weekdays', label: 'วันธรรมดา', icon: 'calendar_view_week' },
  { id: 'custom', label: 'เลือกวัน', icon: 'date_range' },
]

const weekDays = [
  { id: 0, label: 'อา' },
  { id: 1, label: 'จ' },
  { id: 2, label: 'อ' },
  { id: 3, label: 'พ' },
  { id: 4, label: 'พฤ' },
  { id: 5, label: 'ศ' },
  { id: 6, label: 'ส' },
]

export default function AddHabitPage() {
  const navigate = useNavigate()
  const [habitName, setHabitName] = useState('')
  const [frequency, setFrequency] = useState('everyday')
  const [customDays, setCustomDays] = useState([1, 2, 3, 4, 5])
  const [goal, setGoal] = useState(1)
  const [reminders, setReminders] = useState(['08:00'])
  const [loading, setLoading] = useState(false)

  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [syncType, setSyncType] = useState('steps')

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '/api'
    fetch(`${apiBase}/auth/status`)
      .then(res => res.json())
      .then(data => setIsGoogleConnected(data.connected))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!habitName.trim()) return

    let finalFrequency = frequency
    if (frequency === 'custom') {
      if (customDays.length === 0) {
        alert('กรุณาเลือกวันที่ต้องการทำอย่างน้อย 1 วัน')
        return
      }
      finalFrequency = customDays.sort((a,b)=>a-b).join(',')
    }

    setLoading(true)
    try {
      await createHabit({
        name: habitName.trim(),
        frequency: finalFrequency,
        goal: Number(goal),
        // Join the array into a comma-separated string for the backend (e.g., "08:00,12:00")
        // Filter out empty strings just in case
        reminderTime: reminders.filter((r) => r).join(','),
        isSynced: isSynced,
        syncType: isSynced ? syncType : 'steps'
      })
      navigate('/')
    } catch (err) {
      console.error('Failed to create habit:', err)
      alert(err.message || 'Error creating habit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#ddffe2] dark:bg-emerald-950 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#bef5c9]/50 transition-colors text-[#006a2b]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-[#006a2b] dark:text-emerald-50">
            สร้างนิสัยใหม่
          </h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#bef5c9]/50 transition-colors text-[#006a2b] active:scale-95 duration-200">
          <span className="material-symbols-outlined">calendar_today</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        <div className="space-y-10">
          {/* Hero Illustration */}
          <div className="relative w-full h-48 rounded-[32px] overflow-hidden bg-surface-container">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-primary opacity-20"
                style={{ fontSize: '160px', fontVariationSettings: "'FILL' 1" }}
              >
                self_improvement
              </span>
            </div>
            <div className="absolute bottom-6 left-6">
              <span className="bg-surface-container-lowest/80 backdrop-blur-md px-4 py-1.5 rounded-full text-primary font-label text-sm font-medium">
                ตั้งสติก่อนเริ่ม
              </span>
            </div>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Habit Name */}
            <section className="space-y-3">
              <label className="font-headline text-lg font-bold text-on-surface-variant px-1">
                สร้างนิสัยอะไรดี?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="เช่น นั่งสมาธิวันละ 10 นาที"
                  className="w-full h-16 px-6 rounded-2xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-300 text-lg placeholder:text-on-surface-variant/40 outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                </div>
              </div>
            </section>

            {/* Frequency Selection */}
            <section className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <label className="font-headline text-lg font-bold text-on-surface-variant">ความถี่</label>
                <span className="text-xs font-label text-on-surface-variant/60 uppercase tracking-widest">
                  ความสม่ำเสมอคือหัวใจสำคัญ
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {frequencies.map((f) => {
                  const isActive = frequency === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFrequency(f.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all active:scale-95 border-2 ${
                        isActive
                          ? 'bg-primary-container text-on-primary-container border-primary/10'
                          : 'bg-surface-container-lowest text-on-surface-variant border-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined mb-1 ${!isActive && 'opacity-20'}`}
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {f.icon}
                      </span>
                      <span className="font-label text-xs font-semibold">{f.label}</span>
                    </button>
                  )
                })}
              </div>

              {frequency === 'custom' && (
                <div className="mt-4 p-4 bg-surface-container-low rounded-2xl flex justify-between">
                  {weekDays.map(day => {
                    const isSelected = customDays.includes(day.id)
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) setCustomDays(customDays.filter(d => d !== day.id))
                          else setCustomDays([...customDays, day.id])
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-label text-sm font-bold transition-all ${
                          isSelected ? 'bg-primary text-on-primary shadow-md ring-2 ring-primary-container/50 scale-110' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-lowest'
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Goal Bento Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {isGoogleConnected && (
                <section className="p-6 rounded-[28px] bg-primary-container/20 space-y-4 border border-primary/20 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-xl">watch</span>
                      <label className="font-headline font-bold">เชื่อมนิสัยนี้กับ Google Fit 🏃‍♂️</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSynced(!isSynced)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${isSynced ? 'bg-primary' : 'bg-outline-variant'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${isSynced ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {isSynced && (
                    <div className="pt-2">
                      <label className="text-sm font-label text-on-surface-variant mb-3 block">ดึงข้อมูลตัวไหนมาเช็คอัตโนมัติ?</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className={`flex-1 flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-colors ${syncType === 'steps' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>
                          <input type="radio" name="syncType" checked={syncType === 'steps'} onChange={() => { setSyncType('steps'); setGoal(10000); }} className="accent-primary w-5 h-5 hidden" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${syncType === 'steps' ? 'border-primary' : 'border-outline-variant'}`}>
                            {syncType === 'steps' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-label font-bold text-on-surface">จำนวนก้าว (Steps)</span>
                          </div>
                        </label>
                        <label className={`flex-1 flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-colors ${syncType === 'distance' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>
                          <input type="radio" name="syncType" checked={syncType === 'distance'} onChange={() => { setSyncType('distance'); setGoal(3000); }} className="accent-primary w-5 h-5 hidden" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${syncType === 'distance' ? 'border-primary' : 'border-outline-variant'}`}>
                            {syncType === 'distance' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-label font-bold text-on-surface">ระยะทาง (Distance) เมตร</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Daily Goal */}
              <section className="p-6 rounded-[28px] bg-surface-container-low space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-xl">flag</span>
                  <label className="font-headline font-bold">เป้าหมายต่อวัน</label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-20 h-12 rounded-xl bg-surface-container-lowest border-none text-center font-bold text-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                  <span className="font-label text-on-surface-variant font-medium">ครั้ง</span>
                </div>
              </section>

              {/* Reminders */}
              <section className="p-6 rounded-[28px] bg-secondary-container/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-secondary">
                    <span className="material-symbols-outlined text-xl">notifications_active</span>
                    <label className="font-headline font-bold">เวลาแจ้งเตือน</label>
                  </div>
                  {reminders.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setReminders([...reminders, '12:00'])}
                      className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:bg-secondary transition-colors hover:text-on-secondary"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {reminders.map((time, idx) => (
                    <div key={idx} className="flex flex-row items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newReminders = [...reminders]
                          newReminders[idx] = e.target.value
                          setReminders(newReminders)
                        }}
                        className="flex-grow h-12 px-4 rounded-xl bg-surface-container-lowest border-none font-label font-semibold focus:ring-2 focus:ring-secondary outline-none"
                      />
                      {reminders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setReminders(reminders.filter((_, i) => i !== idx))}
                          className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-error hover:bg-error-container/50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                  {reminders.length === 0 && (
                    <p className="text-sm font-label text-on-surface-variant/70 italic text-center py-2">
                      ไม่มีการแจ้งเตือน
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 rounded-full bg-primary text-on-primary font-headline text-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">add_task</span>
                {loading ? 'กำลังสร้าง...' : 'สร้างนิสัย'}
              </button>
              <p className="text-center mt-6 text-on-surface-variant/50 font-label text-xs uppercase tracking-[0.2em]">
                เริ่มทำทีละก้าว
              </p>
            </div>
          </form>
        </div>
      </main>

      <BottomNavBar />
    </div>
  )
}
