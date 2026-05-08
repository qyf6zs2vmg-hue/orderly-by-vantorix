import React from 'react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white font-sans overflow-hidden">
      <img src="https://drive.google.com/thumbnail?id=1VG9rOLyli4T9AnEPCm4EX0KkFB49BdqL&sz=w1000" alt="Vantorix Logo" className="w-48 h-auto mb-6 object-contain" style={{ mixBlendMode: 'multiply' }} />
      <h1 className="text-3xl font-black text-text-main tracking-tight">Vantorix OMS</h1>
    </div>
  );
}
