import { FileText, Activity, Cloud } from 'lucide-react';

export default function Header({ jobsCount, onToggleJobs }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-white flex items-center gap-2">
              PDF-Flow
              <span className="text-[10px] font-medium text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-surface-400 hidden sm:block">Serverless Document Processing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-surface-400 bg-surface-800/50 px-3 py-1.5 rounded-lg border border-white/5">
            <Cloud className="w-3.5 h-3.5 text-brand-400" />
            <span>Powered by Vercel</span>
          </div>

          <button
            onClick={onToggleJobs}
            className="relative p-2 rounded-xl bg-surface-800/50 border border-white/5 hover:border-brand-500/30 transition-all duration-200 group"
          >
            <Activity className="w-5 h-5 text-surface-400 group-hover:text-brand-400 transition-colors" />
            {jobsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse-soft">
                {jobsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

