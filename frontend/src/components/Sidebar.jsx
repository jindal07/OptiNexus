import { FileText, Image, Github, X } from 'lucide-react';

const categories = [
  { id: 'pdf', name: 'PDF Tools', icon: FileText, desc: 'Transform documents' },
  { id: 'image', name: 'Image Tools', icon: Image, desc: 'Optimize images' },
];

export default function Sidebar({ activeCategory, onCategoryChange, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-[60px] bottom-0 z-40
        w-64 md:w-20 
        bg-surface-950/95 md:bg-surface-950/50 
        backdrop-blur-2xl 
        border-r border-brand-500/10
        flex flex-col
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 md:hidden border-b border-brand-500/10">
          <span className="text-sm font-semibold text-white">Tools</span>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors"
          >
            <X className="w-4 h-4 text-surface-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 md:p-2 md:pt-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.id);
                  onClose?.();
                }}
                className={`
                  relative flex items-center gap-3 md:justify-center
                  px-4 py-3 md:p-3 rounded-xl
                  transition-all duration-300 group
                  ${isActive 
                    ? 'bg-brand-500/15 border border-brand-500/20' 
                    : 'hover:bg-brand-500/5 border border-transparent hover:border-brand-500/10'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 md:w-auto md:h-auto rounded-xl md:rounded-none
                  flex items-center justify-center
                  ${isActive ? 'bg-brand-500/20 md:bg-transparent' : 'bg-surface-800/50 md:bg-transparent'}
                `}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-brand-400' : 'text-surface-400 group-hover:text-brand-300'
                  }`} />
                </div>
                
                {/* Mobile: Show text */}
                <div className="md:hidden text-left">
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-surface-300'}`}>
                    {cat.name}
                  </div>
                  <div className="text-xs text-surface-500">{cat.desc}</div>
                </div>

                {/* Desktop: Tooltip */}
                <div className="hidden md:block absolute left-full ml-3 px-3 py-2 bg-surface-900 rounded-xl text-sm font-medium text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap border border-brand-500/15 shadow-xl z-50 translate-x-2 group-hover:translate-x-0">
                  {cat.name}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-surface-900 border-l border-b border-brand-500/15 rotate-45" />
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="hidden md:block absolute -left-[1px] top-1/2 -translate-y-1/2 w-[3px] h-8 bg-gradient-to-b from-brand-400 to-brand-600 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="mt-auto p-3 md:p-2 border-t border-brand-500/10 flex md:flex-col gap-2">
          <a 
            href="https://github.com/jindal07/OptiNexus" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:p-3 rounded-xl hover:bg-brand-500/10 transition-all group"
          >
            <Github className="w-4 h-4 text-surface-500 group-hover:text-brand-400 transition-colors" />
            <span className="md:hidden text-sm text-surface-400 group-hover:text-brand-300">GitHub</span>
          </a>
        </div>
      </aside>
    </>
  );
}
