import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNavBar from '../components/BottomNavBar'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'

const settingSections = [
  {
    title: 'โปรไฟล์',
    items: [
      { icon: 'person', label: 'ชื่อที่แสดง', value: 'Alex', type: 'navigate' },
      { icon: 'mail', label: 'อีเมล', value: 'alex@example.com', type: 'navigate' },
    ],
  },
  {
    title: 'การเชื่อมต่อ',
    items: [
      { icon: 'watch', label: 'Google Fit', type: 'integration' },
    ],
  },
  {
    title: 'การตั้งค่าทั่วไป',
    items: [
      { icon: 'notifications', label: 'แจ้งเตือนรายวัน', type: 'toggle', default: true },
      { icon: 'dark_mode', label: 'โหมดกลางคืน', type: 'toggle', default: false },
      { icon: 'language', label: 'ภาษา', value: 'ไทย', type: 'navigate' },
    ],
  },
  {
    title: 'ตั้งค่านิสัย',
    items: [
      { icon: 'list', label: 'จัดการนิสัย', value: '', type: 'navigate', path: '/settings/manage-habits' },
      { icon: 'restart_alt', label: 'รีเซ็ตสถิติต่อเนื่อง', value: '', type: 'navigate', danger: false },
      { icon: 'download', label: 'ส่งออกข้อมูล', value: '', type: 'navigate' },
    ],
  },
  {
    title: 'เกี่ยวกับแอป',
    items: [
      { icon: 'info', label: 'เวอร์ชัน', value: '1.0.0', type: 'info' },
      { icon: 'star', label: 'ให้คะแนนแอป', type: 'navigate' },
    ],
  },
]

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark'
  })

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-outline-variant'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

function MockToggle({ defaultOn }) {
  const [on, setOn] = useState(defaultOn ?? false)
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${on ? 'bg-primary' : 'bg-outline-variant'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${on ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)

  // Modal & Toast State
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' })

  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
  }


  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '/api'
    fetch(`${apiBase}/auth/status`)
      .then(res => res.json())
      .then(data => setIsGoogleConnected(data.connected))
      .catch(err => console.error('Failed to get auth status:', err))
  }, [])

  const handleAction = (item) => {
    if (item.type === 'navigate' && item.path) {
      navigate(item.path)
    } else if (item.label === 'ส่งออกข้อมูล') {
      import('../api').then(({ getHabits }) => {
        getHabits().then(data => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `stitch-backup-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          showToast('ส่งออกสำเร็จ', 'สำรองข้อมูลพรีเมียมเรียบร้อยแล้ว', 'success')
        }).catch(err => showToast('เกิดข้อผิดพลาด', err.message, 'error'))
      })
    } else if (item.label === 'ออกจากระบบ') {
      showToast('ออกจากระบบ', 'ออกจากระบบสำเร็จ! (ใช้งานต่อได้ปกติ)', 'info')
      setTimeout(() => navigate('/'), 1000)
    } else if (item.label === 'Google Fit') {
      if (isGoogleConnected) {
        setShowConfirm(true)
      } else {
        // In production, we need the full URL for the redirect
        const backendUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '5000').replace('5174', '5000')
        window.location.href = `${backendUrl}/auth/google`
      }
    } else if (item.label === 'ภาษา' || item.label === 'รีเซ็ตสถิติต่อเนื่อง' || item.label === 'ให้คะแนนแอป') {
      showToast('Coming Soon', 'ฟีเจอร์นี้เตรียมอัปเดตในเวอร์ชันหน้านะครับ! 🚀', 'info')
    }
  }


  const handleConfirmDisconnect = () => {
    setShowConfirm(false)
    const apiBase = import.meta.env.VITE_API_URL || '/api'
    fetch(`${apiBase}/auth/disconnect`, { method: 'POST' })
      .then(() => {
        setIsGoogleConnected(false)
        showToast('ยกเลิกแล้ว', 'ยกเลิกการเชื่อมต่อ Google Fit เรียบร้อย', 'info')
      })
      .catch(() => showToast('ข้อผิดพลาด', 'ไม่สามารถยกเลิกได้ กรุณาลองใหม่', 'error'))
  }


  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <TopAppBar title="ตั้งค่า" />

      <main className="px-6 mt-6 space-y-8 max-w-2xl mx-auto">
        {/* Profile Hero Card */}
        <div className="bg-surface-container-lowest rounded-[32px] p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center overflow-hidden flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '40px' }}>
              person
            </span>
          </div>
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">Alex</h2>
            <p className="font-label text-sm text-on-surface-variant">alex@example.com</p>
            <span className="inline-block mt-2 bg-primary-container text-on-primary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              ทำต่อเนื่อง 12 วัน 🔥
            </span>
          </div>
        </div>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold px-2 mb-3">
              {section.title}
            </h3>
            <div className="bg-surface-container-lowest rounded-[24px] overflow-hidden">
              {section.items.map((item, idx) => (
                <div
                  key={item.label}
                  onClick={() => handleAction(item)}
                  className={`flex items-center justify-between px-5 py-4 transition-colors ${
                    (item.type === 'navigate' || item.type === 'integration') ? 'cursor-pointer hover:bg-surface-container-low active:scale-[0.99]' : ''
                  } ${
                    idx < section.items.length - 1 ? 'border-b border-outline-variant/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.danger ? 'bg-error-container/20 text-error' : 'bg-surface-container text-primary'}`}>
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>
                    <span className={`font-label font-medium ${item.danger ? 'text-error' : 'text-on-surface'}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.label === 'โหมดกลางคืน' ? (
                      <ThemeToggle />
                    ) : item.type === 'toggle' ? (
                      <MockToggle defaultOn={item.default} />
                    ) : null}
                    
                    {item.type === 'navigate' && (
                      <>
                        {item.value && (
                          <span className="font-label text-sm text-on-surface-variant">{item.value}</span>
                        )}
                        <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">chevron_right</span>
                      </>
                    )}
                    {item.type === 'integration' && item.label === 'Google Fit' && (
                      <span className={`font-label text-xs px-3 py-1 rounded-full font-bold ${
                        isGoogleConnected 
                          ? 'bg-primary-container text-on-primary-container border border-primary/20' 
                          : 'bg-surface-dim text-on-surface-variant'
                      }`}>
                        {isGoogleConnected ? 'เชื่อมต่อแล้ว ✓' : 'กดเชื่อมต่อ'}
                      </span>
                    )}

                    {item.type === 'info' && (
                      <span className="font-label text-sm text-on-surface-variant">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Sign Out */}
        <button 
          onClick={() => handleAction({ label: 'ออกจากระบบ' })}
          className="w-full py-4 rounded-[24px] border-2 border-error/20 text-error font-headline font-bold text-sm hover:bg-error-container/10 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          ออกจากระบบ
        </button>
      </main>

      <BottomNavBar />

      <ConfirmModal
        show={showConfirm}
        title="ยกเลิกการเชื่อมต่อ?"
        message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเชื่อมต่อกับ Google Fit? คุณจะไม่สามารถซิงค์ข้อมูลวิ่งเข้าแอปได้"
        confirmText="ยืนยัน ยกเลิก"
        cancelText="คงไว้"
        type="danger"
        onConfirm={handleConfirmDisconnect}
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
