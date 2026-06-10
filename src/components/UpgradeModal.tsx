import React from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border-color rounded-3xl p-8 max-w-sm w-full shadow-accent animate-fade-in-up text-center">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⭐</span>
        </div>
        <h3 className="text-xl font-bold text-text-main mb-3">
          Достигнут лимит
        </h3>
        <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
          You've reached your Free plan limit. Upgrade to Pro for 99,000 UZS/month.
        </p>
        <button
          onClick={() => alert("Upgrade placeholder clicked!")}
          className="w-full py-4 rounded-2xl font-bold bg-yellow-500 hover:bg-yellow-600 text-bg-base transition-colors shadow-sm text-[15px]"
        >
          Upgrade to Pro
        </button>
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-xl font-bold bg-surface-alt hover:bg-border-color text-text-main transition-colors text-[14px]"
        >
          Позже
        </button>
      </div>
    </div>
  );
}
