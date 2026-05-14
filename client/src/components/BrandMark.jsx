import logo from '../assets/focusforge-logo.png'

export default function BrandMark({ compact = false, className = '' }) {
  // Shared brand block keeps logo/title/tagline consistent across auth and app shell.
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logo}
        alt="FocusForge AI logo"
        className={`${compact ? 'h-11 w-11' : 'h-16 w-16'} rounded-md border border-orange-300/20 object-cover shadow-[0_0_28px_rgba(249,115,22,0.22)]`}
      />
      <div>
        <p className={`${compact ? 'text-base' : 'text-xl'} font-black tracking-wide text-orange-100`}>
          Focus<span className="text-orange-400">Forge</span> AI
        </p>
        {!compact && (
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">
            Forge your academic success
          </p>
        )}
      </div>
    </div>
  )
}
