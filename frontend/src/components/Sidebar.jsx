import { FileText, Image, HelpCircle, Github } from 'lucide-react';

const categories = [
  { id: 'pdf', name: 'PDF Tools', icon: FileText },
  { id: 'image', name: 'Image Tools', icon: Image },
];

export default function Sidebar({ activeCategory, onCategoryChange }) {
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-16 md:w-20 bg-surface-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-4 z-40">
      <nav className="flex flex-col gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`
                relative w-12 h-12 rounded-xl flex items-center justify-center
                transition-all duration-300 group
                ${isActive 
                  ? 'bg-brand-500/10 border border-brand-500/30' 
                  : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-400' : 'text-surface-400 group-hover:text-white'}`} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-surface-800 rounded-lg text-xs font-medium text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 shadow-xl z-50">
                {cat.name}
              </div>

              {isActive && (
                <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all group"
        >
          <Github className="w-4 h-4 text-surface-500 group-hover:text-white transition-colors" />
        </a>
        <button className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all group">
          <HelpCircle className="w-4 h-4 text-surface-500 group-hover:text-white transition-colors" />
        </button>
      </div>
    </aside>
  );
}

