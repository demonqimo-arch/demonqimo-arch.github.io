import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AddTaskSheet } from './components/AddTaskSheet'
import { BottomNav } from './components/BottomNav'
import { MonthlyBackdrop } from './components/MonthlyBackdrop'
import { useSelectedDate } from './hooks/useSelectedDate'
import { useTaskStore } from './store/TaskStore'
import { AllTasksView } from './views/AllTasksView'
import { DayView } from './views/DayView'
import { MonthView } from './views/MonthView'
import { WeekView } from './views/WeekView'
import { YearView } from './views/YearView'

function Shell() {
  const [addOpen, setAddOpen] = useState(false)
  const { dateIso } = useSelectedDate()
  const { addTask } = useTaskStore()

  return (
    <div className="relative mx-auto min-h-screen max-w-md pb-24">
      <MonthlyBackdrop />
      <Routes>
        <Route path="/" element={<Navigate to="/day" replace />} />
        <Route path="/day" element={<DayView />} />
        <Route path="/week" element={<WeekView />} />
        <Route path="/month" element={<MonthView />} />
        <Route path="/year" element={<YearView />} />
        <Route path="/all" element={<AllTasksView />} />
      </Routes>

      <button
        onClick={() => setAddOpen(true)}
        aria-label="新增待办"
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform active:scale-95"
      >
        <Plus size={26} />
      </button>

      <AddTaskSheet open={addOpen} defaultDateIso={dateIso} onClose={() => setAddOpen(false)} onSubmit={addTask} />

      <BottomNav />
    </div>
  )
}

export default function App() {
  return <Shell />
}
