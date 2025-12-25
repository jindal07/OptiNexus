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

  const handleDownload = async (job, fileIndex = null) => {
    // Set downloading state
    const downloadKey = fileIndex !== null ? `${job.id}-${fileIndex}` : job.id;
    setDownloading(prev => ({ ...prev, [downloadKey]: true }));

    try {
      // If fileIndex is specified, download that specific file
      if (fileIndex !== null && job.result?.files?.[fileIndex]) {
        const file = job.result.files[fileIndex];
        await downloadFile(file.downloadUrl, file.filename);
      } 
      // If there's a single downloadUrl, use that
      else if (job.result?.downloadUrl) {
        const filename = job.result.filename || `${job.type.replace(/\s+/g, '-').toLowerCase()}-result`;
        await downloadFile(job.result.downloadUrl, filename);
      }
      // If there are multiple files and no specific index, download all
      else if (job.result?.files?.length > 0) {
        for (let i = 0; i < job.result.files.length; i++) {
          const file = job.result.files[i];
          await downloadFile(file.downloadUrl, file.filename);
          // Small delay between downloads
          if (i < job.result.files.length - 1) {
            await new Promise(r => setTimeout(r, 500));
          }
        }
      } else {
        console.error('No download URL found');
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open first available URL in new tab
      const url = job.result?.downloadUrl || job.result?.files?.[0]?.downloadUrl;
      if (url) window.open(url, '_blank');
    } finally {
      setDownloading(prev => ({ ...prev, [downloadKey]: false }));
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
                    
                    {/* Multiple files - show individual download buttons */}
                    {job.result.files?.length > 1 && !job.result.downloadUrl ? (
                      <div className="space-y-2">
                        <p className="text-xs text-surface-400 mb-1">
                          {job.result.files.length} files created
                        </p>
                        {job.result.files.map((file, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleDownload(job, idx)}
                            disabled={downloading[`${job.id}-${idx}`]}
                            className="btn-secondary w-full flex items-center justify-center gap-2 text-xs py-1.5 disabled:opacity-50"
                          >
                            {downloading[`${job.id}-${idx}`] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            {file.pageRange ? `Pages ${file.pageRange}` : `File ${idx + 1}`}
                          </button>
                        ))}
                        <button
                          onClick={() => handleDownload(job)}
                          disabled={downloading[job.id]}
                          className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2 disabled:opacity-50 mt-2"
                        >
                          {downloading[job.id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          Download All
                        </button>
                      </div>
                    ) : (
                      /* Single file download */
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
                            Download
                          </>
                        )}
                      </button>
                    )}
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

