import { 
  Merge, Split, Minimize2, RotateCw, Droplets, 
  FileOutput, Maximize2, Sparkles, ArrowRight, Zap 
} from 'lucide-react';

const iconMap = {
  merge: Merge,
  split: Split,
  compress: Minimize2,
  rotate: RotateCw,
  watermark: Droplets,
  convert: FileOutput,
  upscale: Sparkles,
  resize: Maximize2,
};

export default function Dashboard({ category, tools, onSelectTool }) {
  return (
    <div className="animate-slide-up">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-4">
          <Zap className="w-3.5 h-3.5" />
          {category === 'pdf' ? 'PDF Suite' : 'Image Suite'}
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
          {category === 'pdf' 
            ? 'Transform Your PDFs' 
            : 'Enhance Your Images'}
        </h2>
        <p className="text-surface-400 max-w-xl">
          {category === 'pdf'
            ? 'Merge, split, compress, convert, and edit PDF documents with serverless processing.'
            : 'Compress, upscale, resize, and convert images with powerful cloud processing.'}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, index) => {
          const Icon = iconMap[tool.icon] || FileOutput;
          
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="tool-card text-left group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center group-hover:from-brand-500/30 group-hover:to-brand-600/20 transition-all duration-300">
                  <Icon className="w-5 h-5 text-brand-400 group-hover:text-brand-300 transition-colors" />
                </div>
                {tool.requiresCloudConvert && (
                  <span className="text-[10px] text-surface-400 bg-surface-800 px-2 py-0.5 rounded-full">
                    CloudConvert
                  </span>
                )}
              </div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-brand-300 transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-surface-400 mb-4">{tool.desc}</p>
              <div className="flex items-center gap-1 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Get started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Max File Size', value: '100MB' },
          { label: 'Processing', value: 'Serverless' },
          { label: 'Storage', value: 'Vercel Blob' },
          { label: 'Timeout', value: '60s' },
        ].map((stat, i) => (
          <div 
            key={stat.label}
            className="glass-card p-4 text-center animate-slide-up"
            style={{ animationDelay: `${(tools.length + i) * 50}ms` }}
          >
            <div className="text-lg font-display font-bold gradient-text mb-0.5">
              {stat.value}
            </div>
            <div className="text-xs text-surface-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

