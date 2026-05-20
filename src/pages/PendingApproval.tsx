import { useAuth } from '../lib/AuthContext';
import { LogOut, Clock } from 'lucide-react';

export default function PendingApproval() {
  const { logout, business } = useAuth();
  
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="max-w-[420px] w-full bg-surface rounded-[24px] shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color p-10 text-center relative z-10">
        
        <div className="w-16 h-16 bg-surface-alt text-text-main border border-border-color shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8" />
        </div>
        
        <h2 className="text-[22px] font-bold text-text-main mb-2 tracking-tight">Ваша заявка на рассмотрении</h2>
        <p className="text-text-muted mb-8 text-[14px] leading-relaxed">
          Администратор проверит ваши данные. Пожалуйста, ожидайте подтверждения доступа к системе <span className="text-text-main font-medium">{business ? business.name : "Загрузка..."}</span>.
        </p>
        
        <button
          onClick={() => logout()}
          className="flex items-center justify-center w-full py-2.5 px-4 rounded-[10px] text-[14px] font-medium text-text-main bg-surface-alt hover:bg-surface transition-all border border-border-color shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Выйти
        </button>

         <div className="mt-8 text-center text-[11px] text-text-muted font-medium">
             © {new Date().getFullYear()} DEVELOPED BY ASTHEA LABS.
         </div>
      </div>
    </div>
  );
}
