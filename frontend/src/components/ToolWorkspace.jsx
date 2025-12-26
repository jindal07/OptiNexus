import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Settings2, Play, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import FileUploader from './FileUploader';
import RainbowButton from './RainbowButton';
import PasswordModal from './PasswordModal';
import { uploadToBlob } from '../utils/blob';
import { processFiles } from '../utils/api';

const TOOL_OPTIONS = {
  'rotate': [
    { id: 'angle', type: 'select', label: 'Rotation Angle', options: ['90', '180', '270'], default: '90' }
  ],
  'watermark': [
    { id: 'text', type: 'text', label: 'Watermark Text', default: 'CONFIDENTIAL' },
    { id: 'opacity', type: 'range', label: 'Opacity', min: 0.1, max: 1, step: 0.1, default: 0.3 },
    { id: 'fontSize', type: 'number', label: 'Font Size', default: 50 }
  ],
  'split': [
    { id: 'ranges', type: 'text', label: 'Page Ranges', placeholder: 'e.g., 1-3,5,7-10 (empty = all pages)' }
  ],
  'image-compress': [
    { id: 'quality', type: 'range', label: 'Quality', min: 10, max: 100, step: 5, default: 80 },
    { id: 'format', type: 'select', label: 'Output Format', options: ['webp', 'jpeg', 'png'], default: 'webp' }
  ],
  'image-upscale': [
    { id: 'scale', type: 'select', label: 'Scale Factor', options: ['2', '4'], default: '2' }
  ],
  'image-resize': [
    { id: 'width', type: 'number', label: 'Width (px)', placeholder: 'Auto if empty' },
    { id: 'height', type: 'number', label: 'Height (px)', placeholder: 'Auto if empty' },
    { id: 'fit', type: 'select', label: 'Fit Mode', options: ['cover', 'contain', 'fill', 'inside'], default: 'cover' }
  ],
  'image-convert': [
    { id: 'format', type: 'select', label: 'Output Format', options: ['webp', 'jpeg', 'png', 'gif'], default: 'webp' },
    { id: 'quality', type: 'range', label: 'Quality', min: 10, max: 100, step: 5, default: 90 }
  ]
};

export default function ToolWorkspace({ tool, onBack, addJob, updateJob }) {
  const [files, setFiles] = useState([]);
  const [options, setOptions] = useState(() => {
    const toolOpts = TOOL_OPTIONS[tool.id] || [];
    const defaults = {};
    toolOpts.forEach(opt => {
      if (opt.default !== undefined) defaults[opt.id] = opt.default;
    });
    return defaults;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingProcess, setPendingProcess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Show password modal when CloudConvert tool is selected
  useEffect(() => {
    if (tool.requiresCloudConvert) {
      setIsAuthenticated(false);
      setShowPasswordModal(true);
    } else {
      setIsAuthenticated(false);
      setShowPasswordModal(false);
    }
  }, [tool]);

  const handleFilesChange = useCallback((newFiles) => {
    setFiles(newFiles);
    setError(null);
  }, []);

  const handleOptionChange = (id, value) => {
    setOptions(prev => ({ ...prev, [id]: value }));
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    if (tool.multiple && tool.id === 'merge' && files.length < 2) {
      setError('Please upload at least 2 files to merge');
      return;
    }

    // Check if CloudConvert feature requires password
    if (tool.requiresCloudConvert && !isAuthenticated) {
      setPendingProcess(true);
      setShowPasswordModal(true);
      return;
    }

    // Proceed with processing
    await executeProcess();
  };

  const executeProcess = async () => {
    setIsProcessing(true);
    setError(null);
    setUploadProgress(0);

    const jobId = `job-${Date.now()}`;

    try {
      // Create job entry
      addJob({
        id: jobId,
        type: tool.name,
        toolId: tool.id,
        status: 'uploading',
        progress: 0,
        message: 'Uploading files...',
        files: files.map(f => f.name),
        createdAt: new Date()
      });

      // Upload files to Vercel Blob
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        updateJob(jobId, { 
          message: `Uploading ${file.name}...`,
          progress: Math.round((i / files.length) * 50)
        });
        
        const url = await uploadToBlob(file);
        uploadedUrls.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      updateJob(jobId, { 
        status: 'processing',
        message: 'Processing...',
        progress: 50
      });

      // Process files via API
      const result = await processFiles(tool.id, uploadedUrls, options, (progress) => {
        updateJob(jobId, { progress: 50 + Math.round(progress * 0.5) });
      });

      updateJob(jobId, {
        status: 'completed',
        progress: 100,
        message: 'Complete',
        result
      });

      // Clear files after success
      setFiles([]);
      setUploadProgress(0);
      
      // Reset authentication so password is required for next use
      if (tool.requiresCloudConvert) {
        setIsAuthenticated(false);
      }

    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
      updateJob(jobId, {
        status: 'error',
        error: err.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toolOptions = TOOL_OPTIONS[tool.id] || [];
  const isMultiFile = tool.multiple;
  const acceptTypes = tool.accept || (
    tool.id.includes('image') 
      ? 'image/jpeg,image/png,image/webp,image/gif'
      : 'application/pdf'
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-surface-400" />
        </button>
        
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-1">{tool.name}</h2>
          <p className="text-sm text-surface-500">{tool.desc}</p>
        </div>
        
        {tool.requiresCloudConvert && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            CloudConvert
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <FileUploader
            files={files}
            onFilesChange={handleFilesChange}
            multiple={isMultiFile}
            accept={acceptTypes}
            maxFiles={20}
            maxSize={100 * 1024 * 1024}
            disabled={isProcessing}
          />

          {/* Upload Progress */}
          {isProcessing && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4 glass-card p-4 animate-scale-in">
              <div className="flex justify-between text-sm mb-2.5">
                <span className="text-surface-400 font-medium">Uploading files...</span>
                <span className="text-brand-400 font-semibold">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-300 progress-striped"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Options Panel */}
        <div className="glass-card p-4 md:p-5 h-fit">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/20 to-accent-500/10 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-brand-400" />
            </div>
            <h3 className="font-semibold text-white">Options</h3>
          </div>

          {toolOptions.length > 0 ? (
            <div className="space-y-5">
              {toolOptions.map((opt) => (
                <div key={opt.id}>
                  <label className="block text-xs font-medium text-surface-400 mb-2 uppercase tracking-wider">
                    {opt.label}
                  </label>
                  
                  {opt.type === 'select' && (
                    <select
                      value={options[opt.id] || opt.default || ''}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      className="input-field text-sm py-2.5"
                      disabled={isProcessing}
                    >
                      {opt.options.map(o => (
                        <option key={o} value={o}>{o.toUpperCase()}</option>
                      ))}
                    </select>
                  )}

                  {opt.type === 'text' && (
                    <input
                      type="text"
                      value={options[opt.id] || ''}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      placeholder={opt.placeholder || ''}
                      className="input-field text-sm py-2.5"
                      disabled={isProcessing}
                    />
                  )}

                  {opt.type === 'number' && (
                    <input
                      type="number"
                      value={options[opt.id] || ''}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      placeholder={opt.placeholder || ''}
                      className="input-field text-sm py-2.5"
                      disabled={isProcessing}
                    />
                  )}

                  {opt.type === 'range' && (
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={opt.min}
                        max={opt.max}
                        step={opt.step}
                        value={options[opt.id] || opt.default}
                        onChange={(e) => handleOptionChange(opt.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/[0.05] rounded-full appearance-none cursor-pointer accent-brand-500
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                          [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                          [&::-webkit-slider-thumb]:shadow-brand-500/30 [&::-webkit-slider-thumb]:transition-transform
                          [&::-webkit-slider-thumb]:hover:scale-110"
                        disabled={isProcessing}
                      />
                      <div className="flex justify-between text-xs text-surface-500">
                        <span>{opt.min}</span>
                        <span className="text-brand-400 font-semibold">{options[opt.id] || opt.default}</span>
                        <span>{opt.max}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-sm py-4 text-center">
              No additional options available.
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 animate-scale-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Process Button */}
          <div className="mt-6 flex justify-center">
            {isProcessing ? (
              <button
                disabled
                className="py-3 px-8 rounded-full bg-surface-800 border border-surface-700 text-surface-400 font-semibold flex items-center justify-center gap-2.5 cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </button>
            ) : (
              <RainbowButton
                onClick={handleProcess}
                size="lg"
                className={files.length === 0 ? 'opacity-50 pointer-events-none' : ''}
              >
                <Play className="w-4 h-4" />
                <span>Process {files.length > 0 ? `(${files.length})` : ''}</span>
              </RainbowButton>
            )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingProcess(false);
          // If user closes modal without authenticating, go back to dashboard
          if (!isAuthenticated && !pendingProcess) {
            onBack();
          }
        }}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowPasswordModal(false);
          if (pendingProcess) {
            setPendingProcess(false);
            executeProcess();
          }
        }}
        toolName={tool.name}
      />
    </div>
  );
}
