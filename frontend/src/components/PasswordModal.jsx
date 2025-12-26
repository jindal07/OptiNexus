import { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

export default function PasswordModal({ isOpen, onClose, onSuccess, toolName }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Check password via API
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        // Handle non-200 responses
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        setError(errorData.error || `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Don't store password - require it every time
        setPassword('');
        setError('');
        // Only call onSuccess - let parent handle closing the modal
        onSuccess();
      } else {
        setError(data.error || 'Incorrect password');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      setError(err.message || 'Failed to verify password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-900 rounded-2xl border border-brand-500/20 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Password Required</h2>
              <p className="text-xs text-surface-500">Access to {toolName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Enter password to access CloudConvert features
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-800 text-surface-300 font-medium hover:bg-surface-700 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password || isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-surface-950 font-semibold hover:from-brand-400 hover:to-brand-300 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

