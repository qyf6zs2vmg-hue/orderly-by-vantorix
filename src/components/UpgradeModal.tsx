import React from 'react';
import { X, Check } from 'lucide-react';
import clsx from 'clsx';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-accent animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar border border-border-color">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 text-text-muted hover:text-text-main transition-colors bg-surface-alt rounded-full">
            <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8 mt-2">
            <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-2">Выберите план</h2>
            <p className="text-text-muted">Развивайте свой бизнес с Relible без ограничений</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full">
            {/* Free Plan */}
            <div className="rounded-3xl border border-border-color bg-surface-alt/30 p-6 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-text-main">Free</h3>
                    <div className="flex items-baseline mt-2">
                        <span className="text-3xl font-bold">0 UZS</span>
                    </div>
                </div>
                
                <ul className="flex flex-col gap-4 mb-8 flex-1 text-[15px]">
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Товары</span>
                        <span className="font-bold">20</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Инвайт-ссылки</span>
                        <span className="font-bold">1</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Открытая ссылка на каталог</span>
                        <Check className="w-5 h-5 text-green-500" />
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Заказы</span>
                        <Check className="w-5 h-5 text-green-500" />
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Фотографии товаров</span>
                        <X className="w-5 h-5 text-text-muted" />
                    </li>
                </ul>

                <button
                   onClick={onClose}
                   className="w-full py-4 rounded-2xl font-bold bg-surface-alt hover:bg-border-color text-text-main transition-colors border border-border-color"
                >
                    Текущий тариф
                </button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-3xl border-2 border-yellow-500/50 bg-gradient-to-b from-yellow-500/5 to-transparent p-6 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.1)]">
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[11px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">Рекомендуем</div>
                
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-yellow-600">Pro</h3>
                    <div className="flex items-baseline mt-2">
                        <span className="text-3xl font-bold">99,000 UZS</span>
                        <span className="text-text-muted ml-2">/ месяц</span>
                    </div>
                </div>
                
                <ul className="flex flex-col gap-4 mb-8 flex-1 text-[15px]">
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Товары</span>
                        <span className="font-bold text-yellow-600">Безлимит</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Инвайт-ссылки</span>
                        <span className="font-bold text-yellow-600">Безлимит</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Открытая ссылка на каталог</span>
                        <Check className="w-5 h-5 text-green-500" />
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Заказы</span>
                        <Check className="w-5 h-5 text-green-500" />
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-text-muted">Фотографии товаров</span>
                        <Check className="w-5 h-5 text-green-500" />
                    </li>
                </ul>

                <a
                   href="https://t.me/relible_subscriptions_bot"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full block text-center py-4 rounded-2xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black transition-colors shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] text-[15px]"
                >
                    Buy Subscription
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}
