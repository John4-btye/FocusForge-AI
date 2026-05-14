export default function EmptyState({ title, message }) {
  // Reusable blank-state card for pages before the user has created data.
  return (
    <div className="forge-row-hover rounded-lg border border-dashed border-orange-200/20 bg-white/[0.025] p-6 text-center">
      <h3 className="text-base font-bold text-orange-50">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{message}</p>
    </div>
  )
}
