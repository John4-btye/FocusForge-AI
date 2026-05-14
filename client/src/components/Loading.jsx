export default function Loading({ label = 'Loading...' }) {
  // Full-screen loading state used while auth/session data is being restored.
  return (
    <div className="forge-bg grid min-h-screen place-items-center text-slate-300">
      <div className="forge-card-hot rounded-lg px-5 py-4">
        {label}
      </div>
    </div>
  )
}
