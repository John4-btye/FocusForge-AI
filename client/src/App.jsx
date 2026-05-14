import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import GlobalTimer from './components/GlobalTimer'
import About from './pages/About'
import Courses from './pages/Courses'
import CourseDetails from './pages/CourseDetails'
import Dashboard from './pages/Dashboard'
import AIChat from './pages/AIChat'
import Login from './pages/Login'
import Notes from './pages/Notes'
import Profile from './pages/Profile'
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
              <div className="forge-bg min-h-screen">
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
                      <Route path="/ai-chat" element={<AIChat />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/about" element={<About />} />
                    </Routes>
                  </main>
                </div>
                <GlobalTimer />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
