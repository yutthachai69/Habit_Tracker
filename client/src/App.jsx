import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TodayPage from './pages/TodayPage'
import CalendarPage from './pages/CalendarPage'
import InsightsPage from './pages/InsightsPage'
import AddHabitPage from './pages/AddHabitPage'
import SettingPage from './pages/SettingsPage'
import ManageHabitsPage from './pages/ManageHabitsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/stats" element={<InsightsPage />} />
        <Route path="/add-habit" element={<AddHabitPage />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/settings/manage-habits" element={<ManageHabitsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
