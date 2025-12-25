import { Heart, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 py-2 px-2 border-t border-surface-800/50 opacity-80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-surface-500">
        <span className="flex items-center gap-1.5">
          Made with 
          <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
          by
        </span>
        <a 
          href="https://github.com/jindal07" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-semibold text-surface-300 hover:text-brand-400 transition-colors"
        >
          <Github className="w-4 h-4" />
          Harsh Jindal
        </a>
      </div>
    </footer>
  );
}

