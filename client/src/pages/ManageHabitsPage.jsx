import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHabits, deleteHabit } from '../api'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'

export default function ManageHabitsPage() {
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  
  // Modal & Toast State
  const [showConfirm, setShowConfirm] = useState(false)
  const [targetId, setTargetId] = useState(null)
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' })

  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
  }


  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const data = await getHabits()
      setHabits(data)
    } catch (err) {
      console.error('Failed to load habits:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setTargetId(id)
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!targetId) return
    const id = targetId
    setShowConfirm(false)
    setDeletingId(id)
    try {
      await deleteHabit(id)
      setHabits(habits.filter((h) => h._id !== id))
      showToast('ลบสำเร็จ', 'ลบนิสัยเรียบร้อยแล้ว', 'success')
    } catch (err) {
      console.error('Failed to delete habit:', err)
      showToast('เกิดข้อผิดพลาด', 'ไม่สามารถลบได้ กรุณาลองใหม่อีกครั้ง', 'error')
    } finally {
      setDeletingId(null)
      setTargetId(null)
    }
  }

  const formatFrequency = (freq) => {
    if (freq === 'everyday') return 'ทุกวัน'
    if (freq === 'weekdays') return 'วันธรรมดา'
    if (!freq) return 'ไม่ระบุ'
    return 'บางวัน'
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#ddffe2] dark:bg-emerald-950 flex justify-between items-center px-6 py-4 border-b border-surface-container/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#bef5c9]/50 transition-colors text-[#006a2b]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-[#006a2b] dark:text-emerald-50">
            จัดการนิสัย
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 px-6 max-w-2xl mx-auto w-full">
        <p className="font-label text-sm text-on-surface-variant mb-6">
          ลบนิสัยที่คุณไม่ได้ติดตามแล้ว (ประวัติของนิสัยนั้นจะถูกลบทิ้งด้วย)
        </p>

        {loading ? (
          <div className="text-center py-10 text-on-surface-variant animate-pulse">กำลังโหลด...</div>
        ) : habits.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-outline-variant/30 rounded-3xl">
            <p className="text-on-surface-variant">ไม่มีนิสัยในระบบ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit._id}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined">{habit.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg">{habit.name}</h3>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
                      {formatFrequency(habit.frequency)} • เป้าหมาย {habit.goal} ครั้ง
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteClick(habit._id)}
                  disabled={deletingId === habit._id}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-error hover:bg-error-container/80 transition-colors disabled:opacity-50"
                  aria-label="Delete habit"
                >
                  {deletingId === habit._id ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">delete</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        show={showConfirm}
        title="ลบนิสัยนี้?"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบนิสัยนี้? ข้อมูลประวัติทั้งหมดจะถูกลบไปด้วยและไม่สามารถกู้คืนได้"
        confirmText="ใช่, ลบเลย"
        cancelText="ยกเลิก"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <Toast
        show={toast.show}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  )
}
