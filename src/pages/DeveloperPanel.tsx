import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Terminal, Users, User, Building2, ShieldAlert, Lock, Unlock, Trash2, Eye, EyeOff } from 'lucide-react';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function DeveloperPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [showUsers, setShowUsers] = useState(true);
  const [proMonths, setProMonths] = useState<number>(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'block' | 'unblock' | 'delete' | 'activate_pro' | 'revoke_pro';
    userId: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    if (localStorage.getItem('isDevPanelAuth') !== 'true') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      // Sort in JS instead of compound index to avoid requiring an index
      usersData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isDevPanelAuth');
    navigate('/login', { replace: true });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    const { type, userId } = confirmDialog;
    setActionLoading(userId);
    setConfirmDialog(null);
    
    try {
      if (type === 'block' || type === 'unblock') {
        const newStatus = type === 'block' ? 'blocked' : 'active';
        await updateDoc(doc(db, 'users', userId), { status: newStatus });
      } else if (type === 'delete') {
        await deleteDoc(doc(db, 'users', userId));
      } else if (type === 'activate_pro') {
        const started_at = new Date();
        const expires_at = new Date();
        expires_at.setMonth(expires_at.getMonth() + proMonths);
        await updateDoc(doc(db, 'users', userId), { plan_type: 'pro', pro_started_at: started_at, pro_expires_at: expires_at });
      } else if (type === 'revoke_pro') {
        await updateDoc(doc(db, 'users', userId), { plan_type: 'free', pro_expires_at: null });
      }
    } catch (err) {
      console.error(err);
      alert('Произошла ошибка при выполнении действия.');
    } finally {
      setActionLoading(null);
    }
  };

  const clientCount = users.filter(u => u.role === 'client').length;
  const businessCount = users.filter(u => u.role === 'owner').length;

  return (
    <div className="min-h-screen bg-bg-base text-text-main font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border-color bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <Terminal className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Developer Panel</h1>
            <p className="text-[11px] text-text-muted uppercase tracking-widest font-mono">System Administration</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-alt border border-border-color transition-colors text-[13px] font-medium"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-brand-primary" />
            <h2 className="text-xl font-bold text-text-main">Пользователи системы</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 text-sm border border-border-color bg-surface px-3 py-1.5 rounded-lg font-mono">
              <span className="flex items-center gap-1.5 text-brand-primary">
                <Building2 className="w-3.5 h-3.5" /> Бизнес: <b className="text-text-main">{businessCount}</b>
              </span>
              <span className="text-border-color">|</span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <User className="w-3.5 h-3.5 text-text-main" /> Клиенты: <b className="text-text-main">{clientCount}</b>
              </span>
              <span className="text-border-color">|</span>
              <span className="flex items-center gap-1.5 text-text-muted">
                Всего: <b className="text-text-main">{users.length}</b>
              </span>
            </div>
            
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="px-4 py-1.5 text-[13px] font-bold rounded-lg border border-border-color bg-surface hover:bg-surface-alt transition-colors flex items-center gap-2"
            >
              {showUsers ? (
                <>
                  <EyeOff className="w-4 h-4" /> Скрыть список
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Открыть список
                </>
              )}
            </button>
          </div>
        </div>

        {showUsers && (
          <div className="bg-surface border border-border-color rounded-2xl overflow-hidden shadow-sm animate-fade-in">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color bg-surface-alt/50">
                  <th className="px-6 py-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Роль / Статус</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">План</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">ID Аккаунта</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Имя</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Контактные данные</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Детали</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-text-muted uppercase tracking-wider text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                        Загрузка пользователей...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                      Нет зарегистрированных пользователей
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-alt/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          {user.role === 'owner' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary text-[11px] font-bold uppercase tracking-wider">
                              <Building2 className="w-3.5 h-3.5" />
                              Бизнес
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-text-main text-[11px] font-bold uppercase tracking-wider border border-border-color">
                              <User className="w-3.5 h-3.5" />
                              Клиент
                            </span>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${user.status === 'active' ? 'bg-green-500/10 text-green-500' : user.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                          {user.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.plan_type === 'pro' ? (
                           <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 text-[11px] font-bold">Pro ✓</span>
                        ) : (
                           <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-alt border border-border-color text-text-muted text-[11px] font-bold">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-[13px] font-medium text-text-main">
                        {user.accountId || <span className="text-text-muted/50 italic">Нет ID</span>}
                      </td>
                      <td className="px-6 py-4">
                        {user.isAnonymous ? (
                          <div className="flex items-center gap-1.5 text-text-muted italic text-[13px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Анонимный юзер
                          </div>
                        ) : (
                          <span className="text-[14px] font-medium text-text-main">{user.name || '—'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-[13px]">
                          {user.email && <span className="text-text-main">{user.email}</span>}
                          {user.phone && <span className="text-text-muted">{user.phone}</span>}
                          {!user.email && !user.phone && <span className="text-text-muted/50">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[12px] text-text-muted max-w-[200px] truncate">
                        {user.businessId ? (
                          <span title={`Business ID: ${user.businessId}`}>В бизнесе: {user.businessId}</span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setConfirmDialog({ type: user.plan_type === 'pro' ? 'revoke_pro' : 'activate_pro', userId: user.id, userName: user.name || user.email || user.phone || 'Анонимный юзер' })}
                            className={`px-3 py-1.5 rounded-lg transition-colors border text-[11px] font-bold ${
                              user.plan_type === 'pro'
                                ? 'bg-surface-alt text-text-muted hover:bg-border-color border-transparent'
                                : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20'
                            }`}
                          >
                            {user.plan_type === 'pro' ? 'Revoke Pro' : 'Activate Pro'}
                          </button>
                          
                          <button
                            onClick={() => setConfirmDialog({ type: user.status === 'blocked' ? 'unblock' : 'block', userId: user.id, userName: user.name || user.email || user.phone || 'Анонимный юзер' })}
                            className={`p-2 rounded-lg transition-colors border ${
                              user.status === 'blocked' 
                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20'
                            }`}
                            title={user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                          >
                            {actionLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : user.status === 'blocked' ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => setConfirmDialog({ type: 'delete', userId: user.id, userName: user.name || user.email || user.phone || 'Анонимный юзер' })}
                            className="p-2 rounded-lg transition-colors border bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                            title="Удалить пользователя"
                          >
                            {actionLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm" onClick={() => setConfirmDialog(null)}></div>
          <div className="relative bg-surface border border-border-color rounded-2xl p-6 max-w-sm w-full shadow-accent animate-fade-in-up">
            <h3 className="text-lg font-bold text-text-main mb-2">Подтверждение действия</h3>
            <p className="text-[14px] text-text-muted mb-6 whitespace-pre-wrap">
              Вы уверены, что хотите {confirmDialog.type === 'delete' ? 'удалить' : confirmDialog.type === 'block' ? 'заблокировать' : confirmDialog.type === 'activate_pro' ? 'Активировать PRO для' : confirmDialog.type === 'revoke_pro' ? 'Отменить PRO для' : 'разблокировать'} пользователя <b>{confirmDialog.userName}</b>?
              {confirmDialog.type === 'delete' && '\n\nЭто действие необратимо!'}
            </p>
            {confirmDialog.type === 'activate_pro' && (
              <div className="mb-6">
                <label className="block text-[13px] font-bold text-text-muted uppercase tracking-wider mb-2">Длительность (месяцы)</label>
                <select 
                  value={proMonths} 
                  onChange={(e) => setProMonths(Number(e.target.value))}
                  className="w-full bg-surface-alt border border-border-color rounded-xl px-4 py-3 text-text-main focus:border-brand-primary outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                    <option key={m} value={m}>{m} {m === 1 ? 'месяц' : (m >= 2 && m <= 4) ? 'месяца' : 'месяцев'}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl font-bold bg-surface-alt text-text-main border border-border-color hover:bg-border-color transition-colors"
                onClick={() => setConfirmDialog(null)}
              >
                Нет
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors ${confirmDialog.type === 'delete' || confirmDialog.type === 'block' || confirmDialog.type === 'revoke_pro' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={handleConfirmAction}
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
