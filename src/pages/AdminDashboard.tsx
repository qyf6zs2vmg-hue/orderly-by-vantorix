import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogOut, Key, Users, Copy, RefreshCcw, ShoppingCart, Settings, Bell, Mail, ChevronDown, Search, Plus, Store, Box, Menu, Shield, BarChart3, Globe, User, FileText, Palette, ClipboardList, Check, X } from 'lucide-react';
import clsx from 'clsx';
import { getTelegramWebApp } from '../lib/telegram';

function generateRandomCode(length = 24) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function AdminDashboard() {
  const { logout, appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'invites' | 'users' | 'orders' | 'products' | 'settings'>('invites');
  
  const [invites, setInvites] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, stock: 0, imageBase64: '' });
  
  const tg = getTelegramWebApp();

  useEffect(() => {
     if (tg) {
         if (activeTab !== 'invites') {
             try { tg.BackButton.show(); } catch(e){}
             const goBack = () => setActiveTab('invites');
             try { tg.BackButton.onClick(goBack); } catch(e){}
             return () => { try { tg.BackButton.offClick(goBack); } catch(e){} }
         } else {
             try { tg.BackButton.hide(); } catch(e){}
         }
     }
  }, [tg, activeTab]);

  useEffect(() => {
    if (!appUser?.businessId) return;

    const qInvites = query(collection(db, 'invites'), where('businessId', '==', appUser.businessId));
    const unsubInvites = onSnapshot(qInvites, (snap) => setInvites(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    
    const qUsers = query(collection(db, 'users'), where('businessId', '==', appUser.businessId));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const allUsers = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setActiveUsers(allUsers.filter((u: any) => u.role === 'client' && u.status !== 'pending'));
      setPendingUsers(allUsers.filter((u: any) => u.role === 'client' && u.status === 'pending'));
    });

    const qOrders = query(collection(db, 'orders'), where('businessId', '==', appUser.businessId));
    const unsubOrders = onSnapshot(qOrders, (snap) => setOrders(snap.docs.map(d => ({id: d.id, ...d.data()}))));

    const qProducts = query(collection(db, 'products'), where('businessId', '==', appUser.businessId));
    const unsubProducts = onSnapshot(qProducts, (snap) => setProducts(snap.docs.map(d => ({id: d.id, ...d.data()}))));

    return () => {
      unsubInvites();
      unsubUsers();
      unsubOrders();
      unsubProducts();
    };
  }, [appUser]);

  const handleCreateInvite = async () => {
    if (!appUser?.businessId) return;
    try { if(tg) tg.HapticFeedback.impactOccurred('light'); } catch(e){}
    const code = generateRandomCode(12);
    await setDoc(doc(db, 'invites', code), {
      businessId: appUser.businessId,
      used: false,
      blocked: false,
      createdAt: Date.now()
    });
  };

  const handleBlockInvite = async (inviteId: string) => {
    if(tg) { try { tg.HapticFeedback.impactOccurred('medium'); } catch(e){} }
    await updateDoc(doc(db, 'invites', inviteId), { blocked: true });
  };

  const handleApproveUser = async (userId: string) => {
    if(tg) { try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){} }
    await updateDoc(doc(db, 'users', userId), { status: 'active' });
  };

  const handleRejectUser = async (userId: string) => {
    if(tg) { try { tg.HapticFeedback.notificationOccurred('warning'); } catch(e){} }
    await deleteDoc(doc(db, 'users', userId));
  };

  const handleBlockUser = async (userId: string) => {
    if(tg) { try { tg.HapticFeedback.impactOccurred('heavy'); } catch(e){} }
    await updateDoc(doc(db, 'users', userId), { status: 'blocked' });
  };
  
  const handleUnblockUser = async (userId: string) => {
    if(tg) { try { tg.HapticFeedback.impactOccurred('light'); } catch(e){} }
    await updateDoc(doc(db, 'users', userId), { status: 'active' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({...newProduct, imageBase64: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser?.businessId) return;
    try {
      await addDoc(collection(db, 'products'), {
        businessId: appUser.businessId,
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        imageUrl: newProduct.imageBase64,
        createdAt: Date.now()
      });
      setNewProduct({ name: '', description: '', price: 0, stock: 0, imageBase64: '' });
      setShowAddProduct(false);
      if(tg) try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-bg-base font-sans text-text-main overflow-hidden pb-[70px]">
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-8 no-scrollbar scroll-smooth w-full">
        
        {/* Invites */}
        {activeTab === 'invites' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-[22px] font-bold tracking-tight">Инвайты</h1>
              <button 
                onClick={handleCreateInvite}
                className="bg-brand-primary text-white p-2 rounded-xl shadow-sm active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {pendingUsers.length > 0 && (
                <div onClick={() => setActiveTab('users')} className="bg-surface p-4 rounded-[20px] shadow-sm border border-border-color mb-6 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform">
                   <div>
                       <div className="text-[14px] font-bold text-brand-primary mb-1">Новые заявки!</div>
                       <div className="text-[12px] text-text-muted">Ждут подтверждения: {pendingUsers.length}</div>
                   </div>
                   <ClipboardList className="w-6 h-6 text-brand-primary opacity-50" />
                </div>
            )}

            <div className="grid gap-3">
              {invites.sort((a,b) => b.createdAt - a.createdAt).map(invite => (
                <div key={invite.id} className="bg-surface p-4 rounded-[20px] shadow-sm border border-border-color flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-[15px]">{invite.id}</span>
                    {invite.blocked ? (
                      <span className="text-[10px] uppercase font-bold text-brand-danger bg-brand-danger/10 px-2 py-0.5 rounded-lg">Заблокирован</span>
                    ) : invite.used ? (
                      <span className="text-[10px] uppercase font-bold text-text-muted bg-surface-alt border border-border-color px-2 py-0.5 rounded-lg">Использован</span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-lg">Свободен</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] text-text-muted truncate">https://t.me/orderflow_bot?startapp={invite.id}</span>
                      <button onClick={() => navigator.clipboard.writeText(`https://t.me/orderflow_bot?startapp=${invite.id}`)} className="text-text-muted hover:text-text-main p-1"><Copy className="w-4 h-4" /></button>
                  </div>
                  {!invite.blocked && !invite.used && (
                     <button onClick={() => handleBlockInvite(invite.id)} className="text-[12px] font-bold text-brand-danger mt-1 text-left w-max">
                        Отменить код
                     </button>
                  )}
                </div>
              ))}
              {invites.length === 0 && (
                <div className="py-12 bg-surface rounded-[24px] text-center text-text-muted text-[13px] font-medium flex flex-col items-center gap-3">
                  <Key className="w-10 h-10 opacity-30" />
                  У вас пока нет инвайтов
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users & Requests */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-[22px] font-bold tracking-tight mb-4">Клиенты ({activeUsers.length})</h1>
            
            {pendingUsers.length > 0 && (
                <div className="mb-6">
                   <h2 className="text-[14px] font-bold uppercase tracking-widest text-text-muted mb-3 opacity-70">Заявки</h2>
                   <div className="grid gap-3">
                      {pendingUsers.map(user => (
                          <div key={user.id} className="bg-surface p-4 rounded-[20px] shadow-sm border border-border-color">
                             <div className="font-bold mb-1 text-[15px]">{user.name}</div>
                             <div className="text-[12px] text-text-muted border-b border-border-color/50 pb-3 mb-3">Telegram ID: {user.telegramId}</div>
                             <div className="flex gap-2">
                                <button onClick={() => handleApproveUser(user.id)} className="flex-1 bg-brand-success/10 text-brand-success font-bold py-2 rounded-xl text-[13px] flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" /> Принять
                                </button>
                                <button onClick={() => handleRejectUser(user.id)} className="flex-1 bg-brand-danger/10 text-brand-danger font-bold py-2 rounded-xl text-[13px] flex items-center justify-center gap-2">
                                    <X className="w-4 h-4" /> Отклонить
                                </button>
                             </div>
                          </div>
                      ))}
                   </div>
                </div>
            )}

            <h2 className="text-[14px] font-bold uppercase tracking-widest text-text-muted mb-3 opacity-70">Активные</h2>
            <div className="grid gap-3">
              {activeUsers.map(user => (
                <div key={user.id} className="bg-surface p-4 rounded-[20px] shadow-sm border border-border-color flex justify-between items-center">
                   <div>
                       <div className="font-bold text-[15px]">{user.name}</div>
                       <div className="text-[12px] text-text-muted mt-0.5">ID: {user.telegramId || user.id.slice(0,8)}</div>
                   </div>
                   {user.status === 'blocked' ? (
                       <button onClick={() => handleUnblockUser(user.id)} className="text-[12px] font-bold bg-surface-alt border border-border-color px-3 py-1.5 rounded-lg">
                          Разблокировать
                       </button>
                   ) : (
                       <button onClick={() => handleBlockUser(user.id)} className="text-[12px] font-bold text-brand-danger bg-brand-danger/10 px-3 py-1.5 rounded-lg">
                          Блок
                       </button>
                   )}
                </div>
              ))}
              {activeUsers.length === 0 && (
                <div className="py-12 bg-surface rounded-[24px] text-center text-text-muted text-[13px] font-medium flex flex-col items-center gap-3">
                  <Users className="w-10 h-10 opacity-30" />
                  У вас пока нет клиентов
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-[22px] font-bold tracking-tight mb-4">Все заказы</h1>
            <div className="grid gap-3">
              {orders.sort((a,b) => b.createdAt - a.createdAt).map(order => (
                <div key={order.id} className="bg-surface p-4 rounded-[20px] shadow-sm border border-border-color flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] px-2 py-1 bg-surface-alt rounded-lg font-black uppercase tracking-wider border border-border-color/50">
                      #{order.id.slice(0,6)}
                    </span>
                    <span className="text-[11px] text-text-muted font-bold opacity-70">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-bold text-[14px] mb-2">{order.clientName}</div>
                  <div className="space-y-1 mb-3 bg-surface-alt/50 p-2 rounded-xl">
                    {order.items.map((i:any, idx:number) => (
                      <div key={idx} className="flex justify-between text-[12px] font-medium">
                        <span className="truncate pr-2">{i.name}</span>
                        <span className="shrink-0 text-text-muted">x{i.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-border-color/50">
                    <span className="text-[14px] font-bold">\${order.total.toLocaleString()}</span>
                    <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wide">
                      Оплачено
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="py-12 bg-surface rounded-[24px] text-center text-text-muted text-[13px] font-medium flex flex-col items-center gap-3">
                  <ShoppingCart className="w-10 h-10 opacity-30" />
                  У вас пока нет заказов
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-[22px] font-bold tracking-tight">Товары</h1>
              <button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-brand-primary text-white px-3 py-1.5 rounded-xl text-[12px] font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1">
                {showAddProduct ? 'Отмена' : <><Plus className="w-4 h-4"/> Создать</>}
              </button>
            </div>

            {showAddProduct && (
                <div className="bg-surface border border-border-color rounded-[24px] p-5 mb-6 shadow-sm">
                   <h2 className="text-[15px] font-bold mb-4">Новый товар</h2>
                   <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
                      <input required type="text" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} placeholder="Название" className="w-full bg-surface-alt border border-border-color rounded-[12px] py-2 px-3 text-[13px] outline-none focus:border-text-muted" />
                      <textarea required value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} placeholder="Описание" className="w-full bg-surface-alt border border-border-color rounded-[12px] py-2 px-3 text-[13px] outline-none focus:border-text-muted resize-none h-20" />
                      <div className="flex gap-2">
                         <input required type="number" value={newProduct.price || ''} onChange={e=>setNewProduct({...newProduct, price: Number(e.target.value)})} placeholder="Цена" className="w-full bg-surface-alt border border-border-color rounded-[12px] py-2 px-3 text-[13px] outline-none focus:border-text-muted" />
                         <input required type="number" value={newProduct.stock || ''} onChange={e=>setNewProduct({...newProduct, stock: Number(e.target.value)})} placeholder="Остаток" className="w-full bg-surface-alt border border-border-color rounded-[12px] py-2 px-3 text-[13px] outline-none focus:border-text-muted" />
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-[11px] text-text-muted mt-2 cursor-pointer" />
                      
                      <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2.5 rounded-[12px] mt-2 active:scale-95 transition-transform text-[13px]">
                        Сохранить товар
                      </button>
                   </form>
                </div>
            )}

            <div className="grid gap-3">
              {products.map(product => (
                <div key={product.id} className="bg-surface p-3 rounded-[18px] border border-border-color flex gap-3 items-center shadow-sm">
                  {product.imageUrl ? (
                    <div className="w-[64px] h-[64px] bg-surface-alt rounded-[12px] overflow-hidden shrink-0 border border-border-color/50">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-[64px] h-[64px] bg-surface-alt rounded-[12px] flex items-center justify-center text-text-muted shrink-0 border border-border-color/50">
                      <Box className="w-6 h-6 opacity-30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[13px] truncate">{product.name}</h3>
                    <div className="text-[12px] text-text-muted truncate mt-0.5">{product.description}</div>
                    <div className="mt-1.5 flex justify-between items-center">
                       <span className="font-bold text-[14px]">\${(product.price || 0).toLocaleString()}</span>
                       <span className="text-[10px] bg-surface-alt px-2 py-0.5 rounded-lg font-bold border border-border-color">{product.stock} шт</span>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && !showAddProduct && (
                <div className="py-12 bg-surface rounded-[24px] text-center text-text-muted text-[13px] font-medium flex flex-col items-center gap-3">
                  <Store className="w-10 h-10 opacity-30" />
                  Нет товаров
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col">
            <h1 className="text-[22px] font-bold tracking-tight mb-6">Профиль</h1>
            <div className="bg-surface p-4 rounded-[24px] border border-border-color flex items-center gap-4 mb-6 shadow-sm">
                <div className="w-12 h-12 bg-surface-alt rounded-full flex items-center justify-center font-bold text-[18px] border border-border-color/50">
                  {appUser?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="text-[15px] font-bold leading-tight">{appUser?.name || 'Administrator'}</div>
                  <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide mt-1">Owner</div>
                </div>
            </div>
            
            <div className="space-y-2 mb-8">
               <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border-color shadow-sm">
                 <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-text-main opacity-80" />
                    <span className="text-[14px] font-medium">Оформление</span>
                 </div>
                 <ThemeToggle />
               </div>
            </div>
            
            <button onClick={logout} className="w-full mt-auto bg-brand-danger/10 text-brand-danger font-bold py-3.5 rounded-2xl flex justify-center items-center active:scale-[0.98] transition-transform text-[14px] border border-brand-danger/20">
               <LogOut className="w-4 h-4 mr-2" />
               Выйти
            </button>
            <div className="mt-6 mb-2 text-center text-[10px] text-text-muted font-bold uppercase tracking-wider opacity-60">
              OrderFlow is powered by BlackBridge
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-[70px] bg-surface border-t border-border-color flex justify-around items-center px-1.5 z-50">
         <button onClick={() => setActiveTab('invites')} className={clsx("flex flex-col items-center justify-center w-[20%] h-full transition-colors", activeTab === 'invites' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <Key className="w-[22px] h-[22px] mb-1" />
           <span className="text-[9px] font-bold uppercase tracking-wider">Инвайты</span>
         </button>
         <button onClick={() => setActiveTab('users')} className={clsx("relative flex flex-col items-center justify-center w-[20%] h-full transition-colors", activeTab === 'users' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <div className="relative">
             <Users className="w-[22px] h-[22px] mb-1" />
             {pendingUsers.length > 0 && (
               <span className="absolute -top-1 -right-2 bg-brand-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-surface min-w-[16px] text-center flex items-center justify-center h-[16px]">
                 {pendingUsers.length}
               </span>
             )}
           </div>
           <span className="text-[9px] font-bold uppercase tracking-wider">Клиенты</span>
         </button>
         <button onClick={() => setActiveTab('orders')} className={clsx("flex flex-col items-center justify-center w-[20%] h-full transition-colors", activeTab === 'orders' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <ShoppingCart className="w-[22px] h-[22px] mb-1" />
           <span className="text-[9px] font-bold uppercase tracking-wider">Заказы</span>
         </button>
         <button onClick={() => setActiveTab('products')} className={clsx("flex flex-col items-center justify-center w-[20%] h-full transition-colors", activeTab === 'products' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <Store className="w-[22px] h-[22px] mb-1" />
           <span className="text-[9px] font-bold uppercase tracking-wider">Товары</span>
         </button>
         <button onClick={() => setActiveTab('settings')} className={clsx("flex flex-col items-center justify-center w-[20%] h-full transition-colors", activeTab === 'settings' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <Settings className="w-[22px] h-[22px] mb-1" />
           <span className="text-[9px] font-bold uppercase tracking-wider">Настройки</span>
         </button>
      </nav>
    </div>
  );
}
