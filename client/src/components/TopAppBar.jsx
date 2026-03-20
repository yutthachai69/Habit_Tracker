export default function TopAppBar({ title, avatarSrc }) {
  return (
    <header className="bg-[#ddffe2] dark:bg-emerald-950 flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
          {avatarSrc ? (
            <img src={avatarSrc} alt="User" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-sm">person</span>
            </div>
          )}
        </div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-[#006a2b] dark:text-emerald-50">
          {title}
        </h1>
      </div>
      <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#bef5c9]/50 dark:hover:bg-emerald-800/50 transition-colors active:scale-95 duration-200 ease-in-out text-[#006a2b] dark:text-[#72fe8f]">
        <span className="material-symbols-outlined">calendar_today</span>
      </button>
    </header>
  )
}
