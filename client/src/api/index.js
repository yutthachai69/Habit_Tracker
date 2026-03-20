const API_BASE = import.meta.env.VITE_API_URL || '/api'

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || 'API request failed')
  }
  return res.json()
}

// Habits
export const getHabits = () => fetch(`${API_BASE}/habits`).then(handleResponse)

export const createHabit = (data) =>
  fetch(`${API_BASE}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse)

export const updateHabit = (id, data) =>
  fetch(`${API_BASE}/habits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse)

export const deleteHabit = (id) =>
  fetch(`${API_BASE}/habits/${id}`, {
    method: 'DELETE',
  }).then(handleResponse)

// Logs
export const getLogsForDate = (date) => fetch(`${API_BASE}/logs?date=${date}`).then(handleResponse)

export const toggleLog = (habitId, date) =>
  fetch(`${API_BASE}/logs/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habitId, date }),
  }).then(handleResponse)

export const getMonthStats = (month) => fetch(`${API_BASE}/logs/stats?month=${month}`).then(handleResponse)
