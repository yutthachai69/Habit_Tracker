import React from 'react';

export default function Toast({ show, title, message, type = 'info', onClose }) {
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 ease-out flex w-[90%] max-w-md ${show ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}>
      <div className={`w-full p-4 rounded-[24px] shadow-2xl flex items-start gap-4 backdrop-blur-xl ${
        type === 'success' ? 'bg-primary-container/95 text-on-primary-container border border-primary/20' :
        type === 'error' ? 'bg-error-container/95 text-error border border-error/20' :
        'bg-secondary-container/95 text-on-secondary-container border border-secondary/20'
      }`}>
        <div className="pt-0.5">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-headline font-bold text-base leading-tight">{title}</h4>
          <p className="font-label text-sm mt-1 opacity-90 leading-snug">{message}</p>
        </div>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity p-1">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
