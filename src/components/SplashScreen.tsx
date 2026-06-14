import React from 'react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-base font-sans overflow-hidden">
      <img src="https://lh3.googleusercontent.com/d/1uxQ3yk4tozhUFrVZbP5oUqMUkLY690HB" alt="Relible Commerce" referrerPolicy="no-referrer" className="w-48 h-auto mb-6 object-contain" />
      <h1 className="text-3xl font-black text-text-main tracking-tight">Relible Commerce</h1>
    </div>
  );
}
