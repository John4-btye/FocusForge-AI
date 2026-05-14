export default function Loading({ label = 'Loading...' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        {label}
      </div>
    </div>
  )
}
