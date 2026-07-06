import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Auth
import LoginPage from '@/pages/auth/LoginPage'
import QrScanPage from '@/pages/auth/QrScanPage'
import LoginFromSaloka from '@/pages/auth/LoginFromSaloka'

// Admin
import AdminLayout from '@/layouts/AdminLayout'
import AdminDashboard from '@/pages/admin/dashboard/AdminDashboard'
import MasterPeriode from '@/pages/admin/master/MasterPeriode'
import MasterTipe from '@/pages/admin/master/MasterTipe'
import MasterLokasi from '@/pages/admin/master/MasterLokasi'
import MasterJobPage from '@/pages/admin/master/MasterJob'
import MasterIssue from '@/pages/admin/master/MasterIssue'
import AdminReport from '@/pages/admin/report/AdminReport'
import ReportIssue from '@/pages/admin/report/ReportIssue'
import WorkProgramReportPage from '@/pages/admin/report/WorkProgramReportPage'
import ProgramKerjaPage from '@/pages/admin/program-kerja/ProgramKerja'
import OutPlanPage from '@/pages/admin/program-kerja/OutPlan'

// Staff
import StaffLayout from '@/layouts/StaffLayout'
import DashboardPage from '@/pages/staff/DashboardPage'
import ChecklistPage from '@/pages/staff/ChecklistPage'
import IssuePage from '@/pages/staff/IssuePage'
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
        <Route
          path="/auth"
          element={<LoginFromSaloka />}
        />

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
            path="master/issue"
            element={<MasterIssue />}
          />

          <Route
            path="program-kerja"
            element={<ProgramKerjaPage />}
          />

          <Route
            path="program-kerja/out-plan"
            element={<OutPlanPage />}
          />

          <Route
          path="report"
          element={<AdminReport />}
          />

          <Route
          path="report/issue"
          element={<ReportIssue />}
          />

          <Route
          path="/admin/report/work-program"
          element={<WorkProgramReportPage/>}
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
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<DashboardPage />}
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
            path="work-plan"
            element={<WorkPlanPage />}
          />

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