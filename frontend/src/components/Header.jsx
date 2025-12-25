import { Activity, Menu, X } from 'lucide-react';

export default function Header({ jobsCount, onToggleJobs, onToggleSidebar, sidebarOpen, onLogoClick }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Frosted glass effect */}
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-2xl border-b border-brand-500/[0.08]" />
      
      <div className="relative flex items-center justify-between px-4 md:px-6 py-2.5">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-xl hover:bg-brand-500/10 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-surface-400" />
          ) : (
            <Menu className="w-5 h-5 text-surface-400" />
          )}
        </button>

        {/* Logo - Clickable to go to dashboard */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          {/* Logo Image */}
          <img 
            src="/logo.png" 
            alt="OptiNexus" 
            className="w-11 h-11 object-contain"
          />
          <div className="text-left">
            <h1 className="font-display text-xl font-bold tracking-tight">
              {/* dark-slate-grey 200 → 400 for "Opti" - good contrast on dark bg */}
              <span 
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to right, #c6d2ca, #a9bcaf, #8da595)' }}
              >
                Opti
              </span>
              {/* ivory 300 → 500 for "Nexus" - lime green accent */}
              <span 
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to right, #c8de87, #b6d35f, #a4c837)' }}
              >
                Nexus
              </span>
            </h1>
            {/* dry-sage 400 for tagline - muted olive */}
            <p className="text-[11px] font-medium tracking-wide hidden sm:block" style={{ color: '#acab86' }}>
              Optimize every digital asset
            </p>
          </div>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Jobs button */}
          <button
            onClick={onToggleJobs}
            className="relative p-2.5 rounded-xl bg-surface-800/50 border border-brand-500/10 hover:bg-surface-800/80 hover:border-brand-500/20 transition-all duration-300 group"
          >
            <Activity className="w-5 h-5 text-surface-400 group-hover:text-brand-400 transition-colors duration-300" />
            {jobsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full text-[10px] font-semibold flex items-center justify-center text-surface-950 shadow-lg shadow-brand-500/25 animate-pulse-soft">
                {jobsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
