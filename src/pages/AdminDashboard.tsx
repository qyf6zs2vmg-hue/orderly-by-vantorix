import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { LogOut, Key, Users, Copy, RefreshCcw, ShoppingCart, Shield, Bell, Mail, ChevronDown, Search, Plus, Store, Box, Menu } from 'lucide-react';
import clsx from 'clsx';
import { LogoSVG } from '../components/SharedLogo';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';

function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const PRODUCTS = [
  { id: 'p1', name: 'Серверный шкаф 42U', price: 850, icon: Box, stock: 15 },
  { id: 'p2', name: 'Коммутатор 24 порта', price: 320, icon: Box, stock: 42 },
  { id: 'p3', name: 'Патч-корд кат. 6 (100шт)', price: 150, icon: Box, stock: 120 },
  { id: 'p4', name: 'Маршрутизатор Enterprise', price: 1200, icon: Box, stock: 8 },
  { id: 'p5', name: 'ИБП 3000VA', price: 750, icon: Box, stock: 25 },
];

export default function AdminDashboard() {
  const { logout, appUser, business } = useAuth();
  const [activeTab, setActiveTab] = useState<'invites' | 'requests' | 'users' | 'orders' | 'products' | 'privacy'>('invites');
  
  const [invites, setInvites] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingClient, setEditingClient] = useState<{id: string, name: string, companyName: string} | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!appUser?.businessId) return;

    const qInvites = query(collection(db, 'invites'), where('businessId', '==', appUser.businessId));
    const unsubInvites = onSnapshot(qInvites, (snap) => setInvites(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    
    const qUsers = query(collection(db, 'users'), where('businessId', '==', appUser.businessId));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const allUsers = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setPendingUsers(allUsers.filter((u: any) => u.status === 'pending' && u.role === 'client'));
      setActiveUsers(allUsers.filter((u: any) => u.role === 'client' && u.status !== 'pending'));
    });

    const qOrders = query(collection(db, 'orders'), where('businessId', '==', appUser.businessId));
    const unsubOrders = onSnapshot(qOrders, (snap) => setOrders(snap.docs.map(d => ({id: d.id, ...d.data()}))));

    return () => {
      unsubInvites();
      unsubUsers();
      unsubOrders();
    };
  }, [appUser]);

  const handleCreateInvite = async () => {
    if (!appUser?.businessId) return;
    const code = generateRandomCode();
    await setDoc(doc(db, 'invites', code), {
      businessId: appUser.businessId,
      used: false,
      createdAt: Date.now()
    });
  };

  const handleApproveUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { status: 'active' });
  };

  const handleRejectUser = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
  };

  const handleBlockUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { status: 'blocked' });
  };
  
  const handleUnblockUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { status: 'active' });
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;
    await updateDoc(doc(db, 'users', editingClient.id), {
      name: editingClient.name,
      companyName: editingClient.companyName
    });
    setEditingClient(null);
  };

  return (
    <div className="h-screen overflow-hidden bg-bg-base flex flex-row font-sans text-text-main">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed md:static inset-y-0 left-0 w-[260px] flex-shrink-0 flex flex-col py-6 px-4 bg-bg-base border-r border-border-color z-50 transition-transform duration-300 select-none h-full overflow-y-auto no-scrollbar",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 mb-1">
          <LogoSVG className="w-6 h-6" />
          <span className="font-bold tracking-widest text-[16px]">Orderly</span>
        </div>
        <div className="text-[10px] text-text-muted font-medium px-3 mb-8">Build. Automate. Scale.</div>

        {/* User Profile Summary in Sidebar */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="h-10 w-10 bg-surface-alt rounded-full flex items-center justify-center font-bold text-brand-primary border border-border-color shadow-sm object-cover">
             {appUser?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-text-main leading-tight">{appUser?.name || 'Administrator'}</span>
            <span className="text-[11px] text-text-muted mt-0.5 leading-tight">{business ? business.name : "Загрузка..."}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 flex-1 px-1">
          <button
            onClick={() => setActiveTab('invites')}
            className={clsx("flex items-center px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'invites' ? "bg-[#F3EBE1] text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-[#FAF7F2]")}
          >
            <Key className={clsx("w-4 h-4 mr-3", activeTab === 'invites' ? "text-brand-primary" : "text-text-muted")} />
            Инвайт-коды
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={clsx("flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'requests' ? "bg-[#F3EBE1] text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-[#FAF7F2]")}
          >
            <div className="flex items-center">
              <RefreshCcw className={clsx("w-4 h-4 mr-3", activeTab === 'requests' ? "text-brand-primary" : "text-text-muted")} />
              Заявки
            </div>
            {pendingUsers.length > 0 && (
              <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">{pendingUsers.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={clsx("flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'users' ? "bg-[#F3EBE1] text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-[#FAF7F2]")}
          >
            <div className="flex items-center">
              <Users className={clsx("w-4 h-4 mr-3", activeTab === 'users' ? "text-brand-primary" : "text-text-muted")} />
              Клиенты
            </div>
            {activeUsers.length > 0 && (
              <span className="bg-surface text-text-main text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto border border-border-color">{activeUsers.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={clsx("flex items-center px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'orders' ? "bg-[#F3EBE1] text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-[#FAF7F2]")}
          >
            <ShoppingCart className={clsx("w-4 h-4 mr-3", activeTab === 'orders' ? "text-brand-primary" : "text-text-muted")} />
            Заказы
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={clsx("flex items-center px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'products' ? "bg-[#F3EBE1] text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-[#FAF7F2]")}
          >
            <Store className={clsx("w-4 h-4 mr-3", activeTab === 'products' ? "text-brand-primary" : "text-text-muted")} />
            Товары
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={clsx("flex items-center px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'privacy' ? "bg-[#F3EBE1] text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-[#FAF7F2]")}
          >
            <Shield className={clsx("w-4 h-4 mr-3", activeTab === 'privacy' ? "text-brand-primary" : "text-text-muted")} />
            Приватность
          </button>
        </nav>

        <div className="hidden md:flex flex-col items-center justify-center mt-auto gap-2">
           <button onClick={logout} className="w-full flex justify-center items-center py-2 px-4 rounded-[10px] text-[13px] font-medium text-text-muted hover:text-text-main hover:bg-surface-alt transition-colors">
             <LogOut className="w-4 h-4 mr-2" /> Log out
           </button>
           <div className="text-[10px] text-text-muted font-medium">© {new Date().getFullYear()} Vantorix. All rights reserved.</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        {/* Top Header */}
        <header className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between flex-shrink-0 z-30">
             
             {/* Mobile Menu Button */}
             <button 
               className="md:hidden p-2 text-text-muted hover:text-text-main transition-colors mr-2"
               onClick={() => setIsMobileMenuOpen(true)}
             >
                <Menu className="w-5 h-5" />
             </button>

             {/* Search */}
             <div className={clsx("relative w-[360px] hidden md:block", activeTab !== 'products' && "invisible")}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="w-full bg-surface border border-border-color rounded-[10px] py-2.5 pl-10 pr-10 text-[13px] text-text-main shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-text-muted" 
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-surface-alt border border-border-color rounded px-1.5 py-0.5 text-text-muted font-sans font-medium">⌘K</kbd>
             </div>
             
             {/* Icons */}
             <div className="flex items-center gap-5 ml-auto">
                <button className="relative text-text-muted hover:text-text-main transition-colors">
                   <Bell className="w-[18px] h-[18px]" />
                   <span className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] bg-brand-danger rounded-full border border-bg-base"></span>
                </button>
                <button className="relative text-text-muted hover:text-text-main transition-colors">
                   <Mail className="w-[18px] h-[18px]" />
                </button>
                <div className="h-5 w-px bg-border-color hidden md:block mx-1"></div>
                <div className="flex items-center gap-2.5 cursor-pointer">
                   <div className="h-8 w-8 bg-surface-alt rounded-full flex items-center justify-center font-bold text-brand-primary border border-border-color shadow-[0_1px_2px_rgba(16,24,40,0.04)] text-[12px]">
                      {appUser?.name?.[0]?.toUpperCase() || 'A'}
                   </div>
                   <div className="hidden md:flex flex-col">
                      <span className="text-[13px] font-semibold text-text-main leading-tight">{appUser?.name || 'Administrator'}</span>
                      <span className="text-[10px] text-text-muted leading-tight mt-0.5">Administrator</span>
                   </div>
                   <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden md:block ml-1" />
                </div>
             </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 no-scrollbar" onClick={() => setIsMobileMenuOpen(false)}>
          
          {/* Invites Tab */}
          {activeTab === 'invites' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                <div>
                  <h1 className="text-[24px] font-bold text-text-main tracking-tight">Инвайт-коды</h1>
                  <p className="text-[13px] text-text-muted mt-1">Организуйте доступ для ваших клиентов</p>
                </div>
                <button 
                  onClick={handleCreateInvite} 
                  className="bg-gradient-to-r from-brand-primary to-brand-light hover:opacity-90 text-white px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all flex items-center shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Сгенерировать код
                </button>
              </div>
              
              <div className="bg-surface border border-border-color rounded-[16px] overflow-hidden shadow-[0_4px_12px_rgba(16,24,40,0.03)]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#FAF7F2] border-b border-border-color">
                    <tr>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Код / Ссылка</th>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Статус</th>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Создан</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {invites.sort((a,b) => b.createdAt - a.createdAt).map(invite => (
                      <tr key={invite.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="px-6 py-4 text-text-main flex items-center">
                          <div className="flex flex-col">
                            <span className="font-mono font-medium text-[13px]">{invite.id}</span>
                            <span className="text-[11px] text-text-muted truncate max-w-[200px] mt-0.5 font-sans">{window.location.origin}/join?code={invite.id}</span>
                          </div>
                          <button 
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join?code=${invite.id}`)} 
                            className="ml-4 p-1.5 bg-surface rounded-md border border-border-color text-text-muted hover:text-text-main transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                            title="Копировать ссылку"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {invite.used ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-surface-alt text-text-muted border border-border-color">
                              Использован
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-medium bg-brand-success/10 text-brand-success border border-brand-success/20">
                              Свободен
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-muted">
                          {new Date(invite.createdAt).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                    {invites.length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-12 text-center text-text-muted text-[13px]">Нажмите «Сгенерировать код» чтобы создать первый инвайт.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold text-text-main tracking-tight">Заявки</h1>
                <p className="text-[13px] text-text-muted mt-1">Новые регистрации ожидающие подтверждения</p>
              </div>
              <div className="bg-surface border border-border-color rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.03)] overflow-x-auto">
                <table className="w-full text-left text-[13px] min-w-[600px]">
                  <thead className="bg-[#FAF7F2] border-b border-border-color">
                    <tr>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Имя / Компания</th>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Email</th>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Инвайт</th>
                      <th className="px-6 py-4 font-medium text-text-muted text-right uppercase text-[11px] tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {pendingUsers.map(user => (
                       <tr key={user.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        {editingClient?.id === user.id ? (
                          <>
                            <td className="px-6 py-4">
                              <input 
                                type="text" 
                                value={editingClient.name} 
                                onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                                className="w-full bg-surface border border-border-color text-text-main rounded-md px-2.5 py-1.5 mb-2 focus:outline-none focus:border-brand-primary shadow-sm text-[13px]"
                                placeholder="Имя"
                              />
                              <input 
                                type="text" 
                                value={editingClient.companyName} 
                                onChange={(e) => setEditingClient({...editingClient, companyName: e.target.value})}
                                className="w-full bg-surface border border-border-color text-text-main rounded-md px-2.5 py-1.5 focus:outline-none focus:border-brand-primary shadow-sm text-[13px]"
                                placeholder="Название компании"
                              />
                            </td>
                            <td className="px-6 py-4 text-text-muted">{user.email}</td>
                            <td className="px-6 py-4 font-mono text-text-muted text-[13px]">{user.inviteCode}</td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                               <button onClick={handleSaveEdit} className="bg-brand-primary text-white px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:opacity-90 transition-opacity shadow-sm">
                                 Сохранить
                               </button>
                               <button onClick={() => setEditingClient(null)} className="bg-surface border border-border-color text-text-main px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-surface-alt transition-colors shadow-sm">
                                 Отмена
                               </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-text-main">
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-[12px] text-text-muted mt-0.5">{user.companyName || '-'}</div>
                            </td>
                            <td className="px-6 py-4 text-text-muted">{user.email}</td>
                            <td className="px-6 py-4 font-mono text-text-muted text-[12px]"><span className="bg-surface-alt px-1.5 py-0.5 border border-border-color rounded">{user.inviteCode}</span></td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                              <button onClick={() => handleApproveUser(user.id)} className="bg-brand-success/10 text-brand-success px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-brand-success/20 transition-colors">
                                Одобрить
                              </button>
                              <button onClick={() => setEditingClient({ id: user.id, name: user.name, companyName: user.companyName || '' })} className="bg-surface border border-border-color text-text-main px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-surface-alt transition-colors shadow-sm">
                                Изменить
                              </button>
                              <button onClick={() => handleRejectUser(user.id)} className="bg-brand-danger/10 text-brand-danger px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-brand-danger/20 transition-colors">
                                Отклонить
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {pendingUsers.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted text-[13px]">Нет новых заявок на рассмотрении.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold text-text-main tracking-tight">Клиенты</h1>
                <p className="text-[13px] text-text-muted mt-1">Управление активными клиентами и их доступом</p>
              </div>
              <div className="bg-surface border border-border-color rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.03)] overflow-x-auto">
                <table className="w-full text-left text-[13px] min-w-[600px]">
                  <thead className="bg-[#FAF7F2] border-b border-border-color">
                    <tr>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Имя / Компания</th>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Email</th>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Статус</th>
                      <th className="px-6 py-4 font-medium text-text-muted text-right uppercase text-[11px] tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {activeUsers.map(user => (
                      <tr key={user.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="px-6 py-4 text-text-main">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-[12px] text-text-muted mt-0.5">{user.companyName || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-text-muted">{user.email}</td>
                        <td className="px-6 py-4">
                          {user.status === 'blocked' ? (
                            <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium inline-block bg-brand-danger/10 text-brand-danger border border-brand-danger/20">Заблокирован</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium inline-block bg-brand-success/10 text-brand-success border border-brand-success/20">Активен</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.status === 'blocked' ? (
                             <button onClick={() => handleUnblockUser(user.id)} className="bg-surface border border-border-color text-text-main px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-surface-alt transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)]">Разблокировать</button>
                          ): (
                             <button onClick={() => handleBlockUser(user.id)} className="bg-surface border border-border-color text-brand-danger px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-surface-alt transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                               Блокировать
                             </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {activeUsers.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted text-[13px]">У вас пока нет активных клиентов.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold text-text-main tracking-tight">Заказы</h1>
                <p className="text-[13px] text-text-muted mt-1">Все транзакции и их статус</p>
              </div>
              <div className="bg-surface border border-border-color rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.03)] overflow-x-auto">
                <table className="w-full text-left text-[13px] min-w-[700px]">
                  <thead className="bg-[#FAF7F2] border-b border-border-color">
                    <tr>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">ID / Дата</th>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Клиент</th>
                      <th className="px-6 py-4 font-medium text-text-muted uppercase text-[11px] tracking-wider">Товары</th>
                      <th className="px-6 py-4 font-medium text-text-muted text-right uppercase text-[11px] tracking-wider">Сумма</th>
                      <th className="px-6 py-4 font-medium text-text-muted pl-8 uppercase text-[11px] tracking-wider">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {orders.sort((a,b) => b.createdAt - a.createdAt).map(order => (
                      <tr key={order.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-[11px] text-text-muted bg-surface-alt border border-border-color inline-block px-1.5 py-0.5 rounded mb-1.5 tracking-wider">{order.id.slice(0, 8).toUpperCase()}</div>
                          <div className="text-text-main text-[13px]">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-main">{order.clientName}</td>
                        <td className="px-6 py-4 text-text-muted text-[13px] max-w-[200px]">
                          {order.items.map((it:any) => <div key={it.id} className="mb-0.5 truncate">{it.quantity}x {it.name}</div>)}
                        </td>
                        <td className="px-6 py-4 font-bold text-text-main text-right text-[14px]">${order.total.toLocaleString()}</td>
                        <td className="px-6 py-4 pl-8">
                          {order.status === 'active' ? (
                            <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium inline-block bg-brand-primary/10 text-brand-primary border border-brand-primary/20">В работе</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-medium inline-block bg-surface-alt text-text-muted border border-border-color">Архив</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted text-[13px]">У вас пока нет заказов.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="max-w-6xl flex flex-col gap-8 relative z-10 w-full mx-auto animate-in fade-in duration-300">
              <div className="mb-6">
                 <h1 className="text-[24px] font-bold text-text-main tracking-tight">Каталог товаров (Preview)</h1>
                 <p className="text-[13px] text-text-muted mt-1">Товары, доступные вашим клиентам</p>
              </div>
              <div className="flex flex-col gap-4">
                {PRODUCTS.map(product => {
                  return (
                    <div key={product.id} className="bg-surface p-5 rounded-[16px] border border-border-color flex items-center gap-5 hover:bg-[#FAF7F2] transition-colors shadow-[0_2px_8px_rgba(16,24,40,0.02)]">
                      <div className="w-12 h-12 bg-surface-alt text-brand-primary opacity-80 rounded-[12px] flex items-center justify-center flex-shrink-0 border border-border-color">
                        <product.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-main font-semibold truncate text-[14px]">{product.name}</h3>
                        <p className="text-[12px] text-text-muted mt-0.5">В наличии: <span className="font-medium text-text-main">{product.stock} шт.</span></p>
                      </div>
                      <div className="text-text-main font-bold text-[16px] whitespace-nowrap min-w-[80px] text-right tracking-tight">
                        ${product.price}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="max-w-3xl w-full mx-auto animate-in fade-in duration-300">
               <div className="bg-surface rounded-[24px] p-8 sm:p-10 shadow-[0_4px_12px_rgba(16,24,40,0.06)] border border-border-color">
                 <h1 className="text-[22px] font-bold text-text-main tracking-tight mb-8">Политика конфиденциальности</h1>
                 <div className="text-text-muted leading-relaxed text-[13px]">
                   <PrivacyPolicyContent />
                 </div>
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
