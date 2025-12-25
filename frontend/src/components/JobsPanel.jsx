import { useState } from 'react';
import { X, Download, CheckCircle2, XCircle, Loader2, Clock, Upload, FileText } from 'lucide-react';
import { downloadFile } from '../utils/api';

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-400" />;
    case 'processing':
      return <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />;
    case 'uploading':
      return <Upload className="w-5 h-5 text-amber-400 animate-pulse" />;
    default:
      return <Clock className="w-5 h-5 text-surface-400" />;
  }
};

const ProgressBar = ({ progress, striped = false }) => (
  <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
    <div 
      className={`h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300 ease-out rounded-full ${striped ? 'progress-striped' : ''}`}
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default function JobsPanel({ jobs, isOpen, onClose }) {
  const [downloading, setDownloading] = useState({});

  const handleDownload = async (job) => {
    // Get the download URL
    let url = null;
    let filename = null;
    
    if (job.result?.downloadUrl) {
      url = job.result.downloadUrl;
      filename = job.result.filename || `${job.type.replace(/\s+/g, '-').toLowerCase()}-result`;
    } else if (job.result?.files?.[0]?.downloadUrl) {
      url = job.result.files[0].downloadUrl;
      filename = job.result.files[0].filename;
    }

    if (!url) {
      console.error('No download URL found');
      return;
    }

    // Set downloading state
    setDownloading(prev => ({ ...prev, [job.id]: true }));

    try {
      await downloadFile(url, filename);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    } finally {
      setDownloading(prev => ({ ...prev, [job.id]: false }));
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed top-0 right-0 bottom-0 w-full max-w-sm bg-surface-950/95 backdrop-blur-xl 
        border-l border-white/5 z-50 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-display font-bold text-white">Jobs</h2>
            <p className="text-xs text-surface-400">
              {jobs.filter(j => j.status === 'processing' || j.status === 'uploading').length} active
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-surface-500" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No jobs yet</h3>
              <p className="text-surface-400 text-sm">
                Process files to see them here
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <div 
                key={job.id}
                className="glass-card p-4 animate-slide-in"
              >
                <div className="flex items-start gap-3 mb-3">
                  <StatusIcon status={job.status} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{job.type}</h4>
                    <p className="text-xs text-surface-400 truncate">
                      {job.files?.slice(0, 2).join(', ')}
                      {job.files?.length > 2 && ` +${job.files.length - 2}`}
                    </p>
                  </div>
                  <span className="text-[10px] text-surface-500">
                    {formatTime(job.createdAt)}
                  </span>
                </div>

                {/* Progress */}
                {(job.status === 'processing' || job.status === 'uploading') && (
                  <div className="space-y-1.5">
                    <ProgressBar progress={job.progress || 0} striped />
                    <div className="flex justify-between text-[10px]">
                      <span className="text-surface-400">{job.message || 'Processing...'}</span>
                      <span className="text-brand-400">{job.progress || 0}%</span>
                    </div>
                  </div>
                )}

                {/* Completed */}
                {job.status === 'completed' && job.result && (
                  <div className="mt-2">
                    {job.result.savings && (
                      <p className="text-xs text-green-400 mb-2">
                        Saved {job.result.savings}
                      </p>
                    )}
                    {job.result.totalSavings && (
                      <p className="text-xs text-green-400 mb-2">
                        Total savings: {job.result.totalSavings}
                      </p>
                    )}
                    <button
                      onClick={() => handleDownload(job)}
                      disabled={downloading[job.id]}
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-xs py-2 disabled:opacity-50"
                    >
                      {downloading[job.id] ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Download {job.result.files?.length > 1 ? `(${job.result.files.length})` : ''}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Error */}
                {job.status === 'error' && (
                  <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">{job.error || 'Processing failed'}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

