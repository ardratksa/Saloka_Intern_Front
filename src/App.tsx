import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Auth
import LoginPage from '@/pages/auth/LoginPage'
import QrScanPage from '@/pages/auth/QrScanPage'

// Admin
import AdminLayout from '@/layouts/AdminLayout'
import AdminDashboard from '@/pages/admin/dashboard/AdminDashboard'
import MasterPeriode from '@/pages/admin/master/MasterPeriode'
import MasterTipe from '@/pages/admin/master/MasterTipe'
import MasterLokasi from '@/pages/admin/master/MasterLokasi'
import MasterJobPage from '@/pages/admin/master/MasterJob'
import AdminReport from '@/pages/admin/report/AdminReport'

// Staff
import StaffLayout from '@/layouts/StaffLayout'
import ChecklistPage from '@/pages/staff/ChecklistPage'
import IssuePage from '@/pages/staff/IssuePage'
import ScReportPage from '@/pages/staff/ScReportPage'
import WeeklyReportPage from '@/pages/staff/WeeklyReportPage'
import WorkPlanPage from '@/pages/staff/WorkPlanPage'

// kalau nanti ada profile page tinggal aktifkan
// import ProfilePage from '@/pages/staff/ProfilePage'

/* ───────────────────────────────────────────── */
/* Guards */
/* ───────────────────────────────────────────── */

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuthStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin()) {
    return <Navigate to="/checklist" replace />
  }

  return <>{children}</>
}

function RequireStaff({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuthStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // admin dipaksa ke dashboard admin
  if (isAdmin()) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}

/* ───────────────────────────────────────────── */
/* App */
/* ───────────────────────────────────────────── */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/scan" element={<QrScanPage />} />

        {/* ── ADMIN ───────────────────────── */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />

          <Route
            path="master/periode"
            element={<MasterPeriode />}
          />

          <Route
            path="master/tipe"
            element={<MasterTipe />}
          />

          <Route
            path="master/lokasi"
            element={<MasterLokasi />}
          />

          <Route
            path="master/job"
            element={<MasterJobPage />}
          />

          <Route
            path="report"
            element={<AdminReport />}
          />
        </Route>

        {/* ── STAFF ───────────────────────── */}
        <Route
          path="/"
          element={
            <RequireStaff>
              <StaffLayout />
            </RequireStaff>
          }
        >
          <Route
            index
            element={<Navigate to="/checklist" replace />}
          />

          <Route
            path="checklist"
            element={<ChecklistPage />}
          />

          <Route
            path="issues"
            element={<IssuePage />}
          />

          <Route
            path="sc-report"
            element={<ScReportPage />}
          />

          <Route
            path="work-plan"
            element={<WorkPlanPage />}
          />

          <Route
            path="weekly-report"
            element={<WeeklyReportPage />}
          />

          {/* aktifkan kalau sudah ada halaman profile */}
          {/*
          <Route
            path="profile"
            element={<ProfilePage />}
          />
          */}
        </Route>

        {/* fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}