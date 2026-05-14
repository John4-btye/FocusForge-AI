import { Moon, Save, Sun, User } from 'lucide-react'
import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeContext'
import { useToast } from '../toast/ToastContext'

export default function Profile() {
  // Profile page edits account details and controls the persisted app theme.
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [form, setForm] = useState(() => ({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
  }))
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  async function handleSubmit(event) {
    // Password is optional; leaving it blank keeps the existing password hash.
    event.preventDefault()
    setStatus('')
    setError('')
    setSaving(true)

    try {
      const payload = {
        username: form.username,
        email: form.email,
      }
      if (form.password) {
        payload.password = form.password
      }

      const response = await api.patch('/me', payload)
      updateUser(response.data)
      setForm((current) => ({ ...current, password: '' }))
      setStatus('Profile updated.')
      toast.success('Profile updated.')
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to update profile.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/75">Personal settings</p>
        <h2 className="forge-page-title mt-1">Profile</h2>
        <p className="mt-1 text-sm text-slate-400">
          Customize your account details and choose how FocusForge looks while you work.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="forge-card-hot forge-hover-lift rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-orange-500/15 text-amber-300">
              <User size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-orange-50">Account details</h3>
              <p className="text-sm text-slate-400">Update the profile attached to your workspace.</p>
            </div>
          </div>

          {status && (
            <p className="mt-5 rounded-md border border-emerald-300/20 bg-emerald-950/30 p-3 text-sm text-emerald-200">
              {status}
            </p>
          )}
          {error && (
            <p className="mt-5 rounded-md border border-red-300/20 bg-red-950/40 p-3 text-sm text-red-200">
              {error}
            </p>
          )}

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
            New password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="forge-input mt-2 px-3 py-2"
              placeholder="Leave blank to keep current password"
            />
          </label>

          <button disabled={saving} className="forge-button mt-6 inline-flex items-center gap-2 px-4 py-2">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <div className="forge-card forge-hover-lift rounded-lg p-5">
          <h3 className="text-lg font-black text-orange-50">Appearance</h3>
          <p className="mt-1 text-sm text-slate-400">
            Switch between the full dark forge and a cleaner light workspace.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`rounded-lg border p-4 text-left transition ${
                theme === 'dark'
                  ? 'border-amber-300/60 bg-orange-500/12 text-orange-50 shadow-[0_0_26px_rgba(249,115,22,0.12)]'
                  : 'border-orange-200/10 bg-black/15 text-slate-300 hover:-translate-y-0.5 hover:border-orange-200/30 hover:bg-orange-500/8'
              }`}
            >
              <Moon className="mb-4 text-amber-300" size={22} />
              <p className="font-bold">Dark mode</p>
              <p className="mt-1 text-sm text-slate-400">Charcoal steel, ember glow, and high contrast.</p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`rounded-lg border p-4 text-left transition ${
                theme === 'light'
                  ? 'border-amber-400 bg-amber-100/70 text-slate-950 shadow-[0_0_26px_rgba(248,177,45,0.18)]'
                  : 'border-orange-200/10 bg-black/15 text-slate-300 hover:-translate-y-0.5 hover:border-orange-200/30 hover:bg-orange-500/8'
              }`}
            >
              <Sun className="mb-4 text-amber-300" size={22} />
              <p className="font-bold">Light mode</p>
              <p className="mt-1 text-sm text-slate-400">Warm paper, clean panels, and forge accents.</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
