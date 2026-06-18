import React from 'react';
import { Store } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-base font-sans overflow-hidden">
      <div className="flex bg-brand-primary p-4 rounded-3xl mb-6 shadow-2xl backdrop-blur-sm shadow-brand-primary/20">
        <Store className="w-20 h-20 text-white" />
      </div>
      <h1 className="text-3xl font-black text-text-main tracking-tight">Unimea Commerce</h1>
    </div>
  );
}
