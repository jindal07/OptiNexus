import { useState, useEffect, useRef } from 'react';
import { 
  Activity, Menu, X, FileText, Image, Github, ChevronDown, ExternalLink,
  Download, CheckCircle2, XCircle, Loader2, Clock, Upload, Eye, Sparkles
} from 'lucide-react';
import RainbowButton from './RainbowButton';
import { downloadFile } from '../utils/api';

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const StatusIcon = ({ status }) => {
  const iconClasses = "w-3 h-3 md:w-3.5 md:h-3.5";
  const containerClasses = "w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center flex-shrink-0";
  
  switch (status) {
    case 'completed':
      return (
        <div className={`${containerClasses} bg-brand-500/15 border border-brand-500/20`}>
          <CheckCircle2 className={`${iconClasses} text-brand-400`} />
        </div>
      );
    case 'error':
      return (
        <div className={`${containerClasses} bg-red-500/10 border border-red-500/20`}>
          <XCircle className={`${iconClasses} text-red-400`} />
        </div>
      );
    case 'processing':
      return (
        <div className={`${containerClasses} bg-brand-500/10 border border-brand-500/20`}>
          <Loader2 className={`${iconClasses} text-brand-400 animate-spin`} />
        </div>
      );
    case 'uploading':
      return (
        <div className={`${containerClasses} bg-accent-500/10 border border-accent-500/20`}>
          <Upload className={`${iconClasses} text-accent-400 animate-pulse`} />
        </div>
      );
    default:
      return (
        <div className={`${containerClasses} bg-surface-800`}>
          <Clock className={`${iconClasses} text-surface-400`} />
        </div>
      );
  }
};

export default function Header({ 
  jobsCount, 
  onLogoClick, 
  activeCategory, 
  onCategoryChange,
  jobs = []
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [downloading, setDownloading] = useState({});
  const menuRef = useRef(null);
  const jobsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (jobsRef.current && !jobsRef.current.contains(event.target)) {
        setJobsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleCategoryClick = (category) => {
    onCategoryChange(category);
    setMenuOpen(false);
  };

  const handleDownload = async (job, fileIndex = null) => {
    const downloadKey = fileIndex !== null ? `${job.id}-${fileIndex}` : job.id;
    setDownloading(prev => ({ ...prev, [downloadKey]: true }));

    try {
      if (fileIndex !== null && job.result?.files?.[fileIndex]) {
        const file = job.result.files[fileIndex];
        await downloadFile(file.downloadUrl, file.filename);
      } else if (job.result?.downloadUrl) {
        const filename = job.result.filename || `${job.type.replace(/\s+/g, '-').toLowerCase()}-result`;
        await downloadFile(job.result.downloadUrl, filename);
      } else if (job.result?.files?.length > 0) {
        for (let i = 0; i < job.result.files.length; i++) {
          const file = job.result.files[i];
          await downloadFile(file.downloadUrl, file.filename);
          if (i < job.result.files.length - 1) {
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      const url = job.result?.downloadUrl || job.result?.files?.[0]?.downloadUrl;
      if (url) window.open(url, '_blank');
    } finally {
      setDownloading(prev => ({ ...prev, [downloadKey]: false }));
    }
  };

  const handlePreview = (job) => {
    const url = job.result?.downloadUrl || job.result?.files?.[0]?.downloadUrl;
    if (url) window.open(url, '_blank');
  };

  const activeJobsCount = jobs.filter(j => j.status === 'processing' || j.status === 'uploading').length;

  return (
    <header className="fixed top-3 left-3 right-3 z-50">
      <div className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 shadow-xl shadow-black/20 max-w-5xl rounded-full mx-auto w-full bg-surface-900/95 backdrop-blur-xl border border-brand-500/10">
        {/* Left: Logo */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <img 
            src="/logo.png" 
            alt="OptiNexus" 
            className="w-8 h-8 md:w-9 md:h-9 object-contain"
          />
          <h1 className="font-display text-sm md:text-lg font-bold tracking-tight leading-tight">
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #c6d2ca, #a9bcaf, #8da595)' }}
            >
              Opti
            </span>
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #c8de87, #b6d35f, #a4c837)' }}
            >
              Nexus
            </span>
          </h1>
        </button>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex md:flex-row gap-1 text-sm font-medium">
          <button 
            onClick={() => onCategoryChange('pdf')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
              ${activeCategory === 'pdf' 
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' 
                : 'text-surface-300 hover:text-brand-400 hover:bg-surface-800/50 border border-transparent'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            <span>PDF Tools</span>
          </button>

          <button 
            onClick={() => onCategoryChange('image')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
              ${activeCategory === 'image' 
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' 
                : 'text-surface-300 hover:text-brand-400 hover:bg-surface-800/50 border border-transparent'
              }
            `}
          >
            <Image className="w-4 h-4" />
            <span>Image Tools</span>
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Activity/Jobs Dropdown */}
          <div className="relative" ref={jobsRef}>
            <button
              onClick={() => setJobsOpen(!jobsOpen)}
              className={`
                relative p-2 md:p-2.5 rounded-xl transition-all duration-300 group
                ${jobsOpen 
                  ? 'bg-brand-500/15 border border-brand-500/20' 
                  : 'bg-surface-800/50 border border-brand-500/10 hover:bg-surface-800/80 hover:border-brand-500/20'
                }
              `}
            >
              <Activity className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${jobsOpen ? 'text-brand-400' : 'text-surface-400 group-hover:text-brand-400'}`} />
              {jobsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full text-[9px] font-bold flex items-center justify-center text-surface-950 shadow-lg shadow-brand-500/25 animate-pulse-soft">
                  {jobsCount}
                </span>
              )}
            </button>

            {/* Jobs Dropdown */}
            <div 
              className={`
                fixed md:absolute 
                top-20 md:top-full
                left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0
                mt-0 md:mt-4
                w-[calc(100vw-2rem)] max-w-80 md:w-96 md:max-w-none
                bg-surface-900 backdrop-blur-2xl rounded-2xl
                border border-brand-500/15 shadow-2xl shadow-black/50
                transform transition-all duration-200 origin-top md:origin-top-right
                z-[60]
                ${jobsOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b border-surface-800">
                <div className="flex items-center gap-2 md:gap-2.5">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-brand-500/20 to-accent-500/10 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-[13px] font-semibold text-white">Activity</h3>
                    <p className="text-[9px] md:text-[10px] text-surface-500">{activeJobsCount} active jobs</p>
                  </div>
                </div>
                <button 
                  onClick={() => setJobsOpen(false)}
                  className="p-1 md:p-1.5 rounded-lg hover:bg-surface-800 transition-colors touch-manipulation"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-surface-500" />
                </button>
              </div>

              {/* Jobs List */}
              <div className="max-h-[60vh] md:max-h-80 overflow-y-auto p-2 md:p-2">
                {jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-surface-800/50 border border-brand-500/10 flex items-center justify-center mb-2 md:mb-3">
                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-surface-600" />
                    </div>
                    <p className="text-xs md:text-[13px] font-medium text-white mb-1">No jobs yet</p>
                    <p className="text-[10px] md:text-[11px] text-surface-500">Process files to see activity</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 md:space-y-2">
                    {jobs.slice(0, 5).map((job) => (
                      <div 
                        key={job.id}
                        className="p-2.5 md:p-3 rounded-xl bg-surface-800/40 border border-surface-700/30"
                      >
                        <div className="flex items-start gap-2 md:gap-2.5 mb-1.5 md:mb-2">
                          <StatusIcon status={job.status} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] md:text-[12px] font-medium text-white truncate">{job.type}</h4>
                            <p className="text-[9px] md:text-[10px] text-surface-500 truncate">
                              {job.files?.slice(0, 2).join(', ')}
                              {job.files?.length > 2 && ` +${job.files.length - 2}`}
                            </p>
                          </div>
                          <span className="text-[8px] md:text-[9px] text-surface-600 font-medium whitespace-nowrap ml-1">
                            {formatTime(job.createdAt)}
                          </span>
                        </div>

                        {/* Progress */}
                        {(job.status === 'processing' || job.status === 'uploading') && (
                          <div className="mt-1.5 md:mt-2">
                            <div className="w-full h-0.5 md:h-1 bg-surface-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress || 0}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-0.5 md:mt-1">
                              <span className="text-[8px] md:text-[9px] text-surface-500 truncate flex-1 mr-1">{job.message || 'Processing...'}</span>
                              <span className="text-[8px] md:text-[9px] text-brand-400 font-medium whitespace-nowrap">{job.progress || 0}%</span>
                            </div>
                          </div>
                        )}

                        {/* Completed Actions */}
                        {job.status === 'completed' && job.result && (
                          <div className="flex gap-1 md:gap-1.5 mt-1.5 md:mt-2">
                            <button
                              onClick={() => handleDownload(job)}
                              disabled={downloading[job.id]}
                              className="flex-1 flex items-center justify-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-2 md:py-1.5 rounded-lg bg-brand-500/15 text-brand-400 text-[9px] md:text-[10px] font-medium hover:bg-brand-500/25 active:bg-brand-500/30 transition-colors disabled:opacity-50 touch-manipulation"
                            >
                              {downloading[job.id] ? (
                                <Loader2 className="w-2.5 h-2.5 md:w-3 md:h-3 animate-spin" />
                              ) : (
                                <Download className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              )}
                              <span className="hidden sm:inline">Download</span>
                              <span className="sm:hidden">DL</span>
                            </button>
                            <button
                              onClick={() => handlePreview(job)}
                              className="flex items-center justify-center gap-1 px-2 md:px-2.5 py-2 md:py-1.5 rounded-lg bg-surface-700/50 text-surface-300 text-[9px] md:text-[10px] font-medium hover:bg-surface-700 active:bg-surface-600 transition-colors touch-manipulation min-w-[44px]"
                            >
                              <Eye className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </button>
                          </div>
                        )}

                        {/* Error */}
                        {job.status === 'error' && (
                          <div className="mt-1.5 md:mt-2 p-1.5 md:p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-[9px] md:text-[10px] text-red-400 break-words">{job.error || 'Processing failed'}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {jobs.length > 5 && (
                      <p className="text-center text-[9px] md:text-[10px] text-surface-500 py-1.5 md:py-2">
                        +{jobs.length - 5} more jobs
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GitHub CTA Button - desktop */}
          <div className="hidden md:block">
            <RainbowButton 
              href="https://github.com/jindal07/OptiNexus" 
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </RainbowButton>
          </div>

          {/* Mobile menu toggle */}
          <div className="relative md:hidden" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className={`
                flex items-center gap-1 px-2.5 py-2 rounded-xl transition-all duration-200
                ${menuOpen 
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' 
                  : 'bg-surface-800/50 border border-brand-500/10 text-surface-400 hover:bg-surface-800/80'
                }
              `}
            >
              {menuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <>
                  <Menu className="w-4 h-4" />
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Floating Dropdown Menu */}
            <div 
              className={`
                absolute top-full right-0 mt-4 w-56
                bg-surface-900 backdrop-blur-2xl rounded-2xl
                border border-brand-500/15 shadow-2xl shadow-black/50
                transform transition-all duration-200 origin-top-right
                ${menuOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }
              `}
            >
              {/* Menu Items */}
              <div className="p-2">
                <button 
                  onClick={() => handleCategoryClick('pdf')}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                    ${activeCategory === 'pdf' 
                      ? 'bg-brand-500/15 text-brand-400' 
                      : 'text-surface-300 hover:bg-surface-800/70 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${activeCategory === 'pdf' ? 'bg-brand-500/20' : 'bg-surface-800'}
                  `}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[13px] font-medium">PDF Tools</p>
                    <p className="text-[10px] text-surface-500">Merge, split & more</p>
                  </div>
                  {activeCategory === 'pdf' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  )}
                </button>

                <button 
                  onClick={() => handleCategoryClick('image')}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                    ${activeCategory === 'image' 
                      ? 'bg-brand-500/15 text-brand-400' 
                      : 'text-surface-300 hover:bg-surface-800/70 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${activeCategory === 'image' ? 'bg-brand-500/20' : 'bg-surface-800'}
                  `}>
                    <Image className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[13px] font-medium">Image Tools</p>
                    <p className="text-[10px] text-surface-500">Compress & convert</p>
                  </div>
                  {activeCategory === 'image' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-surface-800 mx-3" />

              {/* GitHub Link */}
              <div className="p-2">
                <a 
                  href="https://github.com/jindal07/OptiNexus" 
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-300 hover:bg-surface-800/70 hover:text-white transition-all duration-150"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
                    <Github className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[13px] font-medium">GitHub</p>
                    <p className="text-[10px] text-surface-500">Star the project</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-surface-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
