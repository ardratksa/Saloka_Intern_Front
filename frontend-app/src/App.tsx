import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

import LoginPage from '@/pages/auth/LoginPage'
import QrScanPage from '@/pages/auth/QrScanPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ChecklistPage from '@/pages/checklist/ChecklistPage'
import IssuePage from '@/pages/issues/IssuePage'
import ScReportPage from '@/pages/sc-report/ScReportPage'
import WeeklyReportPage from '@/pages/weekly-report/WeeklyReportPage'
import WorkPlanPage from '@/pages/work-plan/WorkPlanPage'
import AdminPage from '@/pages/admin/AdminPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  if (!isAdmin()) return <Navigate to="/checklist" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/scan" element={<QrScanPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/checklist" replace />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="issues" element={<IssuePage />} />
          <Route path="sc-report" element={<ScReportPage />} />
          <Route path="work-plan" element={<WorkPlanPage />} />
          <Route
            path="weekly-report"
            element={
              <RequireAdmin>
                <WeeklyReportPage />
              </RequireAdmin>
            }
          />
          <Route
            path="admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}