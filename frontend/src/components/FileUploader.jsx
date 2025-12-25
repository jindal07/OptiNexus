import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileText, Image, CloudUpload, CheckCircle2 } from 'lucide-react';

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(type) {
  if (type?.includes('pdf')) return FileText;
  if (type?.includes('image')) return Image;
  return File;
}

export default function FileUploader({ 
  files, 
  onFilesChange, 
  multiple = false,
  accept,
  maxFiles = 20,
  maxSize = 100 * 1024 * 1024,
  disabled = false
}) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      console.warn('Rejected files:', rejectedFiles);
    }
    
    if (multiple) {
      onFilesChange([...files, ...acceptedFiles].slice(0, maxFiles));
    } else {
      onFilesChange(acceptedFiles.slice(0, 1));
    }
  }, [files, onFilesChange, multiple, maxFiles]);

  const removeFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const parseAccept = (acceptString) => {
    if (!acceptString) return undefined;
    return acceptString.split(',').reduce((acc, type) => {
      const trimmed = type.trim();
      if (trimmed.startsWith('.')) {
        acc['application/octet-stream'] = [...(acc['application/octet-stream'] || []), trimmed];
      } else {
        acc[trimmed] = [];
      }
      return acc;
    }, {});
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: parseAccept(accept),
    multiple,
    maxFiles,
    maxSize,
    disabled
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative glass-card p-6 md:p-8 border-2 border-dashed transition-all duration-300 overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isDragActive && !isDragReject 
            ? 'border-brand-400/60 bg-brand-500/5' 
            : isDragReject
            ? 'border-red-500/60 bg-red-500/5'
            : 'border-white/[0.08] hover:border-brand-500/30 hover:bg-white/[0.02]'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {/* Background animation */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5 animate-pulse" />
        )}
        
        <div className="relative flex flex-col items-center justify-center py-4 md:py-8 text-center">
          <div className={`
            relative w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mb-5 transition-all duration-500
            ${isDragActive 
              ? 'bg-brand-500/20 scale-110 shadow-lg shadow-brand-500/20' 
              : 'bg-white/[0.03]'
            }
          `}>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isDragActive ? (
              <CloudUpload className="w-8 h-8 md:w-10 md:h-10 text-brand-400 animate-bounce" />
            ) : (
              <Upload className="w-8 h-8 md:w-10 md:h-10 text-surface-400" />
            )}
          </div>
          
          <h3 className="text-base md:text-lg font-semibold text-white mb-2">
            {isDragActive ? 'Release to upload' : 'Drop your files here'}
          </h3>
          
          <p className="text-sm text-surface-500 mb-4">
            or <span className="text-brand-400 font-medium">click to browse</span>
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-surface-500">
            <span className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
              Max {formatFileSize(maxSize)}
            </span>
            {multiple && (
              <span className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                Up to {maxFiles} files
              </span>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="glass-card overflow-hidden animate-scale-in">
          <div className="p-3 md:p-4 flex items-center justify-between border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-medium text-white">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </h4>
            </div>
            <button
              onClick={() => onFilesChange([])}
              className="text-xs font-medium text-surface-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              disabled={disabled}
            >
              Clear all
            </button>
          </div>
          
          <div className="max-h-48 md:max-h-60 overflow-y-auto">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 md:p-4 hover:bg-white/[0.02] transition-colors group border-b border-white/[0.03] last:border-b-0"
                >
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-4 h-4 md:w-5 md:h-5 text-brand-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-surface-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                    disabled={disabled}
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
