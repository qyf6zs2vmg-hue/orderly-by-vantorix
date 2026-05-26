import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { getTelegramWebApp } from '../lib/telegram';

export default function Landing() {
  const tg = getTelegramWebApp();
  
  return (
    <div className="min-h-screen bg-bg-base font-sans text-text-main flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 mb-8 rounded-[24px] bg-surface flex items-center justify-center border border-border-color shadow-sm">
            <img src="https://drive.google.com/thumbnail?id=1l7HkE_p4K09Xwkv9g9JAiFzfTuViiWvZ&sz=w1000" alt="OrderFlow Logo" crossOrigin="anonymous" className="w-12 h-12 object-contain" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tighter mb-4">OrderFlow</h1>
        <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-8 opacity-70">Powered by BlackBridge</p>
        
        {tg && tg.initDataUnsafe?.user ? (
           <p className="text-[14px] text-text-muted font-medium mb-8 max-w-[260px]">
             Авторизация через Telegram... Пожалуйста, подождите.
           </p>
        ) : (
           <>
             <p className="text-[14px] text-text-muted font-medium mb-8 max-w-[260px]">
               Платформа OrderFlow доступна эксклюзивно как Telegram Mini App.
             </p>
             <a 
               href="https://t.me/orderflow_bot" 
               className="bg-brand-primary text-white font-bold py-3.5 px-8 rounded-[16px] shadow-sm flex items-center gap-2 active:scale-95 transition-transform"
             >
               <Shield className="w-4 h-4" />
               Открыть в Telegram
             </a>
           </>
        )}
    </div>
  );
}
