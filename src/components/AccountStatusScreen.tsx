import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface Props {
  status: 'blocked' | 'deleted';
}

export function AccountStatusScreen({ status }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/register');
  };

  const handleSupport = () => {
    window.location.href = 'https://t.me/relible_support';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base text-text-main font-sans p-4">
      <div className="bg-surface p-8 rounded-[32px] border border-border-color max-w-sm w-full text-center shadow-sm">
        <h2 className="text-2xl font-bold mb-4">
          {status === 'blocked' ? 'Ваш аккаунт заблокирован' : 'Ваш аккаунт удален'}
        </h2>
        <p className="text-text-muted text-[15px] mb-8">
          Если вы считаете, что произошла ошибка, пожалуйста, свяжитесь с поддержкой.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-2xl font-bold bg-brand-primary text-white hover:opacity-90 transition-opacity"
          >
            В главное меню
          </button>
          <button
            onClick={handleSupport}
            className="w-full py-3.5 rounded-2xl font-bold bg-surface-alt hover:bg-border-color text-text-main transition-colors border border-border-color"
          >
            Написать в поддержку
          </button>
        </div>
      </div>
    </div>
  );
}
