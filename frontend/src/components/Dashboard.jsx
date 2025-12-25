import { 
  Merge, Split, Minimize2, RotateCw, Droplets, 
  FileOutput, Maximize2, Sparkles, ArrowRight, Zap,
  Shield, Clock, Cloud
} from 'lucide-react';
import TiltedCard from './TiltedCard';

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
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-500/15 to-accent-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold tracking-wide mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>{category === 'pdf' ? 'PDF Suite' : 'Image Suite'}</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-3 md:mb-4 tracking-tight">
          {category === 'pdf' 
            ? <>Transform Your <span className="gradient-text">Documents</span></> 
            : <>Enhance Your <span className="gradient-text">Images</span></>}
        </h2>
        
        <p className="text-surface-400 text-sm md:text-base max-w-2xl leading-relaxed">
          {category === 'pdf'
            ? 'Merge, split, compress, convert, and edit PDF documents with lightning-fast serverless processing. Your files stay private and are automatically deleted.'
            : 'Compress, upscale with AI, resize, and convert images using powerful cloud processing. Professional-grade tools at your fingertips.'}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {tools.map((tool, index) => {
          const Icon = iconMap[tool.icon] || FileOutput;
          
          return (
            <TiltedCard
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              scaleOnHover={1.03}
              rotateAmplitude={6}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="tool-card h-full text-left group">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="icon-container group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-brand-400 group-hover:text-brand-300 transition-colors duration-300" />
                  </div>
                  {tool.requiresCloudConvert && (
                    <span className="text-[10px] font-medium text-accent-400 bg-accent-500/10 px-2.5 py-1 rounded-full border border-accent-500/15">
                      CloudConvert
                    </span>
                  )}
                </div>
                
                <h3 className="text-white font-semibold mb-1.5 group-hover:text-brand-300 transition-colors duration-300 text-sm md:text-base">
                  {tool.name}
                </h3>
                
                <p className="text-xs md:text-sm text-surface-500 mb-3 md:mb-4 line-clamp-2">
                  {tool.desc}
                </p>
                
                <div className="flex items-center gap-1.5 text-xs font-medium text-brand-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                  <span>Get started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </TiltedCard>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="mt-10 md:mt-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Cloud, label: 'Max File Size', value: '100MB', color: 'from-brand-400 to-brand-600' },
            { icon: Zap, label: 'Processing', value: 'Instant', color: 'from-amber-400 to-amber-500' },
            { icon: Shield, label: 'Privacy', value: 'Auto-Delete', color: 'from-emerald-400 to-emerald-500' },
            { icon: Clock, label: 'Timeout', value: '60s Max', color: 'from-violet-400 to-violet-500' },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <TiltedCard
                key={stat.label}
                scaleOnHover={1.05}
                rotateAmplitude={8}
                className="animate-scale-in"
                style={{ animationDelay: `${(tools.length * 50) + (i * 80)}ms` }}
              >
                <div className="glass-card p-4 md:p-5 text-center h-full group hover:border-brand-500/20 transition-all duration-300">
                  <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <StatIcon className="w-5 h-5 text-surface-950" />
                  </div>
                  <div className="text-lg md:text-xl font-display font-bold text-white mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs text-surface-500">{stat.label}</div>
                </div>
              </TiltedCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
