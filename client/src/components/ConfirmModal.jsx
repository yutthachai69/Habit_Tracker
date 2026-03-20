import React from 'react';

export default function ConfirmModal({ 
  show, 
  title, 
  message, 
  confirmText = 'ตกลง', 
  cancelText = 'ยกเลิก', 
  onConfirm, 
  onCancel,
  type = 'danger' // danger, primary, info
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 transition-all duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="bg-surface-container-lowest dark:bg-emerald-950 w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative z-10 border border-outline-variant/10 animate-in zoom-in-95 fade-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${
            type === 'danger' ? 'bg-error-container text-error' : 
            type === 'primary' ? 'bg-primary-container text-on-primary-container' :
            'bg-secondary-container text-on-secondary-container'
          }`}>
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {type === 'danger' ? 'report_problem' : type === 'primary' ? 'help' : 'info'}
            </span>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-headline font-bold text-2xl text-on-surface leading-tight">
              {title}
            </h3>
            <p className="font-label text-sm text-on-surface-variant leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="flex flex-col w-full gap-3 pt-4">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
                type === 'danger' ? 'bg-error text-on-error shadow-lg shadow-error/20' : 
                'bg-primary text-on-primary shadow-lg shadow-primary/20'
              }`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
