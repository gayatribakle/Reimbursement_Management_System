import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Are you sure?'}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-ghost" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-medium text-white transition-all active:scale-[0.98] ${
              variant === 'danger'
                ? 'bg-error hover:bg-error/90'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            variant === 'danger' ? 'text-error' : 'text-amber-600'
          }`} />
        </div>
        <p className="text-on-surface-variant text-sm">{message || 'This action cannot be undone.'}</p>
      </div>
    </Modal>
  );
}
