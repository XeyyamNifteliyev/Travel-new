'use client';

import { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialogProps extends ConfirmDialogOptions {
  onResolve: (value: boolean) => void;
}

function ConfirmDialogContent({
  title,
  message,
  confirmText = 'Sil',
  cancelText = 'Ləğv et',
  type = 'danger',
  onResolve,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    setTimeout(() => onResolve(true), 200);
  };

  const handleCancel = () => {
    setOpen(false);
    setTimeout(() => onResolve(false), 200);
  };

  const colorMap = {
    danger: {
      icon: 'text-red-400',
      btn: 'bg-red-500 hover:bg-red-600',
      ring: 'ring-red-500/30',
    },
    warning: {
      icon: 'text-yellow-400',
      btn: 'bg-yellow-500 hover:bg-yellow-600',
      ring: 'ring-yellow-500/30',
    },
    info: {
      icon: 'text-sky-400',
      btn: 'bg-sky-500 hover:bg-sky-600',
      ring: 'ring-sky-500/30',
    },
  };

  const colors = colorMap[type];

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-colors duration-200 ${
        open ? 'bg-black/60' : 'bg-black/0'
      }`}
      onClick={handleCancel}
    >
      <div
        className={`relative bg-bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-200 ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-txt-muted hover:text-txt transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 ring-2 ${colors.ring}`}>
            <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-txt">{title}</h3>
            <p className="text-txt-sec text-sm mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl text-txt-sec hover:text-txt hover:bg-bg-base/50 border border-border transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${colors.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      container.remove();
    };

    root.render(
      <ConfirmDialogContent
        {...options}
        onResolve={(value) => {
          resolve(value);
          setTimeout(cleanup, 250);
        }}
      />
    );
  });
}
