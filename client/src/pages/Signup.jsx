import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import BrandMark from '../components/BrandMark'

export default function Signup() {
  // Signup creates the account and immediately starts an authenticated session.
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event) {
    // Submit flow mirrors login but sends username/email/password.
    event.preventDefault()
    setError('')
    try {
      await signup(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create account')
    }
  }

  return (
    <main className="forge-bg grid min-h-screen place-items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="forge-card-hot w-full max-w-md rounded-lg p-8">
        <BrandMark />
        <div className="forge-divider-glow my-6 h-px" />
        <h1 className="text-2xl font-black text-orange-50">Create your workspace</h1>
        <p className="mt-2 text-sm text-slate-400">Build the command center for your academic goals.</p>
        {error && <p className="mt-4 rounded-md border border-red-300/20 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
        <label className="mt-6 block text-sm font-semibold text-orange-100/90">
          Username
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            className="forge-input mt-2 px-3 py-2"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-orange-100/90">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="forge-input mt-2 px-3 py-2"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-orange-100/90">
          Password
          <span className="relative mt-2 block">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="forge-input px-3 py-2 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-amber-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <button className="forge-button mt-6 w-full px-4 py-2.5">
          Sign up
        </button>
        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account? <Link className="font-semibold text-amber-300 hover:text-orange-200" to="/login">Log in</Link>
        </p>
      </form>
    </main>
  )
}
