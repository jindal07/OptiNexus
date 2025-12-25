import { useState } from 'react';
import { X, Download, CheckCircle2, XCircle, Loader2, Clock, Upload, FileText, Sparkles } from 'lucide-react';
import { downloadFile } from '../utils/api';

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-brand-400" />
        </div>
      );
    case 'error':
      return (
        <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <XCircle className="w-4 h-4 text-red-400" />
        </div>
      );
    case 'processing':
      return (
        <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
        </div>
      );
    case 'uploading':
      return (
        <div className="w-8 h-8 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
          <Upload className="w-4 h-4 text-accent-400 animate-pulse" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-xl bg-surface-800 flex items-center justify-center">
          <Clock className="w-4 h-4 text-surface-400" />
        </div>
      );
  }
};

const ProgressBar = ({ progress, striped = false }) => (
  <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
    <div 
      className={`h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300 ease-out rounded-full ${striped ? 'progress-striped' : ''}`}
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default function JobsPanel({ jobs, isOpen, onClose }) {
  const [downloading, setDownloading] = useState({});

  const handleDownload = async (job, fileIndex = null) => {
    const downloadKey = fileIndex !== null ? `${job.id}-${fileIndex}` : job.id;
    setDownloading(prev => ({ ...prev, [downloadKey]: true }));

    try {
      if (fileIndex !== null && job.result?.files?.[fileIndex]) {
        const file = job.result.files[fileIndex];
        await downloadFile(file.downloadUrl, file.filename);
      } 
      else if (job.result?.downloadUrl) {
        const filename = job.result.filename || `${job.type.replace(/\s+/g, '-').toLowerCase()}-result`;
        await downloadFile(job.result.downloadUrl, filename);
      }
      else if (job.result?.files?.length > 0) {
        for (let i = 0; i < job.result.files.length; i++) {
          const file = job.result.files[i];
          await downloadFile(file.downloadUrl, file.filename);
          if (i < job.result.files.length - 1) {
            await new Promise(r => setTimeout(r, 500));
          }
        }
      } else {
        console.error('No download URL found');
      }
    } catch (error) {
      console.error('Download failed:', error);
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full bg-surface-950/95 backdrop-blur-2xl border-l border-brand-500/10 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-brand-500/10 safe-area-top">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white">Activity</h2>
                <p className="text-xs text-surface-500">
                  {jobs.filter(j => j.status === 'processing' || j.status === 'uploading').length} active jobs
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-surface-800/50 border border-brand-500/10 hover:bg-surface-800/80 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>

          {/* Jobs List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 safe-area-bottom">
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-800/50 border border-brand-500/10 flex items-center justify-center mb-5">
                  <FileText className="w-8 h-8 text-surface-600" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">No jobs yet</h3>
                <p className="text-surface-500 text-sm max-w-[200px]">
                  Process files to see your activity here
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div 
                  key={job.id}
                  className="glass-card p-4 animate-scale-in"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <StatusIcon status={job.status} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{job.type}</h4>
                      <p className="text-xs text-surface-500 truncate">
                        {job.files?.slice(0, 2).join(', ')}
                        {job.files?.length > 2 && ` +${job.files.length - 2}`}
                      </p>
                    </div>
                    <span className="text-[10px] text-surface-600 font-medium">
                      {formatTime(job.createdAt)}
                    </span>
                  </div>

                  {/* Progress */}
                  {(job.status === 'processing' || job.status === 'uploading') && (
                    <div className="space-y-2">
                      <ProgressBar progress={job.progress || 0} striped />
                      <div className="flex justify-between text-xs">
                        <span className="text-surface-500">{job.message || 'Processing...'}</span>
                        <span className="text-brand-400 font-semibold">{job.progress || 0}%</span>
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {job.status === 'completed' && job.result && (
                    <div className="mt-3 pt-3 border-t border-brand-500/10">
                      {job.result.savings && (
                        <p className="text-xs text-brand-400 mb-2 font-medium">
                          ✓ Saved {job.result.savings}
                        </p>
                      )}
                      {job.result.totalSavings && (
                        <p className="text-xs text-brand-400 mb-2 font-medium">
                          ✓ Total savings: {job.result.totalSavings}
                        </p>
                      )}
                      
                      {/* Multiple files */}
                      {job.result.files?.length > 1 && !job.result.downloadUrl ? (
                        <div className="space-y-2">
                          <p className="text-xs text-surface-500 mb-2">
                            {job.result.files.length} files ready
                          </p>
                          {job.result.files.map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleDownload(job, idx)}
                              disabled={downloading[`${job.id}-${idx}`]}
                              className="btn-secondary w-full flex items-center justify-center gap-2 text-xs py-2 disabled:opacity-50"
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
                            className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5 mt-2 disabled:opacity-50"
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
                        /* Single file */
                        <button
                          onClick={() => handleDownload(job)}
                          disabled={downloading[job.id]}
                          className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5 disabled:opacity-50"
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
                    <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-red-400">{job.error || 'Processing failed'}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
