import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileText, Image } from 'lucide-react';

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
          glass-card p-6 border-2 border-dashed transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isDragActive && !isDragReject 
            ? 'border-brand-500 bg-brand-500/10' 
            : isDragReject
            ? 'border-red-500 bg-red-500/10'
            : 'border-white/10 hover:border-brand-500/40 hover:bg-brand-500/5'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
            ${isDragActive ? 'bg-brand-500/20 scale-110' : 'bg-surface-800'}
          `}>
            <Upload className={`w-7 h-7 ${isDragActive ? 'text-brand-400' : 'text-surface-400'}`} />
          </div>
          
          <h3 className="text-base font-semibold text-white mb-1">
            {isDragActive ? 'Drop files here' : 'Drag & drop files'}
          </h3>
          
          <p className="text-sm text-surface-400 mb-3">
            or click to browse
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-surface-500">
            <span className="px-2.5 py-1 rounded-full bg-surface-800 border border-white/5">
              Max {formatFileSize(maxSize)}
            </span>
            {multiple && (
              <span className="px-2.5 py-1 rounded-full bg-surface-800 border border-white/5">
                Up to {maxFiles} files
              </span>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="glass-card divide-y divide-white/5">
          <div className="p-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">
              Selected ({files.length})
            </h4>
            <button
              onClick={() => onFilesChange([])}
              className="text-xs text-surface-400 hover:text-red-400 transition-colors"
              disabled={disabled}
            >
              Clear all
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-4 h-4 text-brand-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-surface-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
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

