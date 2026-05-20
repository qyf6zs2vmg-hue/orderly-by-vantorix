import React from 'react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-base font-sans overflow-hidden">
      <img src="https://drive.google.com/thumbnail?id=1l7HkE_p4K09Xwkv9g9JAiFzfTuViiWvZ&sz=w1000" alt="ASTHEA Logo" className="w-48 h-auto mb-6 object-contain" />
      <h1 className="text-3xl font-black text-text-main tracking-tight">Asthea OMS</h1>
    </div>
  );
}
