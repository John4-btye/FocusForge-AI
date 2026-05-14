import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')

  async function handleSubmit(event) {
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
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-teal-700">FocusForge AI</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Create your workspace</h1>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="mt-6 block text-sm font-medium text-slate-700">
          Username
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <button className="mt-6 w-full rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">
          Sign up
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <Link className="font-medium text-teal-700" to="/login">Log in</Link>
        </p>
      </form>
    </main>
  )
}
