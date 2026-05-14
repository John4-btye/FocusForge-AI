import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Courses from './pages/Courses'
import CourseDetails from './pages/CourseDetails'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Notes from './pages/Notes'
import Signup from './pages/Signup'
import StudySessions from './pages/StudySessions'
import Tasks from './pages/Tasks'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-100">
                <Navbar />
                <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
                  <Sidebar />
                  <main className="min-w-0 flex-1">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/courses/:id" element={<CourseDetails />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/notes" element={<Notes />} />
                      <Route path="/study-sessions" element={<StudySessions />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
