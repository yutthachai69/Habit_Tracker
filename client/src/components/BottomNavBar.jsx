import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', icon: 'home', label: 'หน้าแรก' },
  { path: '/calendar', icon: 'event_note', label: 'ปฏิทิน' },
  { path: '/stats', icon: 'leaderboard', label: 'สถิติ' },
  { path: '/settings', icon: 'settings', label: 'ตั้งค่า' },
]

export default function BottomNavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/20 dark:bg-emerald-950/20 glass-nav shadow-[0_-4px_24px_rgba(11,54,29,0.06)] rounded-t-[32px]">
      {navItems.map(({ path, icon, label }) => {
        const isActive = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all active:scale-90 duration-150 ${
              isActive
                ? 'bg-[#72fe8f] text-[#003914] rounded-full'
                : 'text-[#3b6447] dark:text-emerald-300/70 hover:opacity-80'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            <span className="font-['Lexend'] text-[10px] font-medium tracking-wide">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
