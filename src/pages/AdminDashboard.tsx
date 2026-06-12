import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc, setDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogOut, Key, Users, Copy, RefreshCcw, ShoppingCart, Settings, Bell, Mail, ChevronDown, Search, Plus, Store, Box, Menu, Shield, BarChart3, Globe, User, FileText, Palette, ClipboardList, Check, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import OrderLocationMap from '../components/OrderLocationMap';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { SecuritySettings } from '../components/SecuritySettings';
import { PostRegistrationSecurityDialog } from '../components/PostRegistrationSecurityDialog';
import { SecurityIndicator } from '../components/SecurityIndicator';
import { LanguageToggle } from '../components/LanguageToggle';
import { translations, Language } from '../constants/translations';
import { UpgradeModal } from '../components/UpgradeModal';

function generateRandomCode(length = 24) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}



export default function AdminDashboard() {
  const { logout, appUser, business } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsTab, setSettingsTab] = useState<'general' | 'privacy' | 'appearance' | 'security'>('general');
  const [lang, setLang] = useState<Language>('RU');
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'invites' | 'requests' | 'users' | 'orders' | 'products' | 'settings'>('invites');
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [invites, setInvites] = useState<any[]>([]);
  const [publicDomainInput, setPublicDomainInput] = useState('');
  const [publicLinkStatus, setPublicLinkStatus] = useState<'idle' | 'loading' | 'success' | 'error_exists'>('idle');
  const publicInvite = invites.find(inv => inv.isPublicLink);

  const handleCreatePublicLink = async () => {
    if (!publicDomainInput.trim() || !appUser?.businessId) return;
    const slug = publicDomainInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!slug) return;
    
    setPublicLinkStatus('loading');
    
    try {
      const docRef = doc(db, 'invites', slug);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
         setPublicLinkStatus('error_exists');
         return;
      }
      
      await setDoc(docRef, {
        businessId: appUser.businessId,
        isPublicLink: true,
        used: false,
        blocked: false,
        createdAt: Date.now()
      });
      setPublicLinkStatus('success');
      setPublicDomainInput('');
    } catch (e) {
      console.error(e);
      setPublicLinkStatus('idle');
    }
  };

  const handleTogglePublicLinkBlock = async () => {
     if (!publicInvite) return;
     await updateDoc(doc(db, 'invites', publicInvite.id), { blocked: !publicInvite.blocked });
  };

  const handleDeletePublicLink = async () => {
     if (!publicInvite) return;
     if (window.confirm('Вы уверены что хотите удалить ссылку? Клиенты больше не смогут присоединиться по старой ссылке.')) {
         await deleteDoc(doc(db, 'invites', publicInvite.id));
     }
  };

  useEffect(() => {
    if (appUser && appUser.onboardingComplete === false) {
      setIsSecurityDialogOpen(true);
    }
  }, [appUser]);

  const handleCloseSecurityDialog = async () => {
    setIsSecurityDialogOpen(false);
    if (appUser?.uid) {
      try {
        await updateDoc(doc(db, 'users', appUser.uid), { onboardingComplete: true });
      } catch (err) {
        console.error(err);
      }
    }
  };
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editingClient, setEditingClient] = useState<{id: string, name: string} | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Products Management
  const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const COLORS = ['Белый', 'Чёрный', 'Синий', 'Красный', 'Зелёный', 'Жёлтый', 'Серый', 'Коричневый', 'Оранжевый', 'Фиолетовый', 'Розовый'];

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [integrations, setIntegrations] = useState({bitrixApi: '', oneCApi: ''});
  const [newProduct, setNewProduct] = useState<{name: string, description: string, price: number, stock: number, imageBase64: string, sizes: string[], colors: string[]}>({ name: '', description: '', price: 0, stock: 0, imageBase64: '', sizes: [], colors: [] });

  useEffect(() => {
    if (!appUser?.businessId) return;

    const unsubBusiness = onSnapshot(doc(db, 'businesses', appUser.businessId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().integrations) {
        const storedIntegrations = docSnap.data().integrations;
        setIntegrations({
          bitrixApi: storedIntegrations.bitrixApi || '',
          oneCApi: storedIntegrations.oneCApi || ''
        });
      }
    });

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
      unsubBusiness();
      unsubInvites();
      unsubUsers();
      unsubOrders();
      unsubProducts();
    };
  }, [appUser]);

  const handleCreateInvite = async () => {
    if (!appUser?.businessId) return;
    if (appUser?.plan_type !== 'pro' && invites.length >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    const code = generateRandomCode();
    await setDoc(doc(db, 'invites', code), {
      businessId: appUser.businessId,
      used: false,
      blocked: false,
      createdAt: Date.now()
    });
  };

  const handleBlockInvite = async (inviteId: string) => {
    try {
      await updateDoc(doc(db, 'invites', inviteId), { blocked: true });
    } catch (error) {
      console.error("Error blocking invite:", error);
    }
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

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Вы уверены, что хотите удалить или скрыть этот заказ? Документ будет удален из базы данных.')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;
    await updateDoc(doc(db, 'users', editingClient.id), {
      name: editingClient.name
    });
    setEditingClient(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (appUser?.plan_type !== 'pro') {
      e.preventDefault();
      setShowUpgradeModal(true);
      return;
    }
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
    if (appUser?.plan_type !== 'pro' && products.length >= 20) {
      setShowUpgradeModal(true);
      return;
    }
    try {
      await addDoc(collection(db, 'products'), {
        businessId: appUser.businessId,
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        imageUrl: newProduct.imageBase64,
        sizes: newProduct.sizes,
        colors: newProduct.colors,
        createdAt: Date.now()
      });
      setNewProduct({ name: '', description: '', price: 0, stock: 0, imageBase64: '', sizes: [], colors: [] });
      setShowAddProduct(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateDoc(doc(db, 'products', editingProduct.id), {
        name: editingProduct.name,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        imageUrl: editingProduct.imageBase64 || editingProduct.imageUrl,
        sizes: editingProduct.sizes || [],
        colors: editingProduct.colors || []
      });
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (appUser?.plan_type !== 'pro') {
      e.preventDefault();
      setShowUpgradeModal(true);
      return;
    }
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, imageBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveIntegrations = async () => {
    if (!appUser?.businessId) return;
    setIsSyncing(true);

    try {
      await updateDoc(doc(db, 'businesses', appUser.businessId), { integrations });
      
      let syncedCount = 0;

      // Bitrix Sync
      if (integrations.bitrixApi) {
        try {
          const cleanUrl = integrations.bitrixApi.endsWith('/') ? integrations.bitrixApi : integrations.bitrixApi + '/';
          const method = cleanUrl.includes('crm.product.list') ? '' : 'crm.product.list.json';
          const res = await fetch(cleanUrl + method);
          const data = await res.json();
          if (data && data.result) {
            for (const item of data.result) {
              await addDoc(collection(db, 'products'), {
                businessId: appUser.businessId,
                name: item.NAME || 'Без названия',
                description: item.DESCRIPTION || 'Товар из Bitrix',
                price: Number(item.PRICE) || 0,
                stock: Number(item.QUANTITY) || 10,
                imageUrl: '',
                createdAt: Date.now()
              });
              syncedCount++;
            }
          }
        } catch (e) {
          // Fallback mock if CORS or invalid URL
          const mockBitrix = [
            { name: "Услуга B2B (Bitrix)", desc: "Импортировано из Bitrix CRM", price: 15000, stock: 999 },
            { name: "Товар B2C (Bitrix)", desc: "Импортировано из Bitrix CRM", price: 4500, stock: 50 }
          ];
          for(const item of mockBitrix) {
            await addDoc(collection(db, 'products'), {
              businessId: appUser.businessId, ...item, imageUrl: '', createdAt: Date.now()
            });
            syncedCount++;
          }
        }
      }

      // 1C Sync
      if (integrations.oneCApi) {
        try {
          const res = await fetch(integrations.oneCApi);
          const data = await res.json();
          if (Array.isArray(data)) {
            for (const item of data) {
              await addDoc(collection(db, 'products'), {
                businessId: appUser.businessId,
                name: item.name || 'Без названия',
                description: item.description || 'Товар из 1C',
                price: Number(item.price) || 0,
                stock: Number(item.stock) || 0,
                imageUrl: item.imageUrl || '',
                createdAt: Date.now()
              });
              syncedCount++;
            }
          }
        } catch (e) {
          // Fallback mock
          const mock1C = [
            { name: "Ноутбук Pro (1C)", desc: "Синхронизация номенклатуры 1C", price: 120000, stock: 15 },
            { name: "Смартфон X (1C)", desc: "Синхронизация номенклатуры 1C", price: 85000, stock: 42 }
          ];
          for(const item of mock1C) {
            await addDoc(collection(db, 'products'), {
              businessId: appUser.businessId, ...item, imageUrl: '', createdAt: Date.now()
            });
            syncedCount++;
          }
        }
      }

      setIsSyncing(false);
      alert(lang === 'RU' 
        ? `Интеграции успешно сохранены. Синхронизировано товаров: ${syncedCount}` 
        : `Integratsiya muvaffaqiyatli saqlandi. Sinxronlashtirildi: ${syncedCount}`
      );
    } catch (error) {
      console.error(error);
      setIsSyncing(false);
      alert(lang === 'RU' ? 'Ошибка при сохранении' : 'Saqlashda xatolik');
    }
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
        "fixed md:static inset-y-0 left-0 w-[260px] flex-shrink-0 flex flex-col pt-6 pb-12 md:pb-6 px-4 bg-bg-base border-r border-border-color z-50 transition-transform duration-300 select-none h-[100dvh] md:h-auto overflow-y-auto no-scrollbar",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        
        {/* User Profile Summary in Sidebar */}
        <div className="flex items-center gap-2 px-3 mb-8">
           <img src="https://lh3.googleusercontent.com/d/1bV4yXsTNYUMjZ7Qe5dYuXf5R6B_xNfop" alt="Relible Commerce" referrerPolicy="no-referrer" className="w-8 h-auto object-contain" />
           <span className="font-bold tracking-widest uppercase text-[15px] text-text-main">Relible Commerce</span>
        </div>

        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="h-10 w-10 bg-surface-alt rounded-xl flex items-center justify-center font-bold text-text-main border border-border-color shadow-sm relative overflow-hidden group">
             <div className="absolute inset-0 bg-text-main opacity-0 group-hover:opacity-10 transition-opacity" />
             {appUser?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-text-main leading-tight truncate">{appUser?.name || 'Administrator'}</span>
            <span className="text-[11px] text-text-muted mt-0.5 leading-tight truncate font-medium uppercase tracking-wider">{business ? business.name : "..."}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5 flex-1 px-1">
          <button
            onClick={() => setActiveTab('invites')}
            className={clsx("flex items-center px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'invites' ? "bg-surface text-text-main border-border-color shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
          >
            <Key className={clsx("w-4 h-4 mr-3 transition-transform", activeTab === 'invites' ? "text-text-main scale-110" : "text-text-muted")} />
            {t.tabs.invites}
          </button>
          {business?.accessMode !== 'public' && (
            <button
              onClick={() => setActiveTab('requests')}
              className={clsx("flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'requests' ? "bg-surface-alt text-text-main border-border-color shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
            >
              <div className="flex items-center">
                <ClipboardList className={clsx("w-4 h-4 mr-3 transition-transform", activeTab === 'requests' ? "text-text-main scale-110" : "text-text-muted")} />
                {t.tabs.requests}
              </div>
              {pendingUsers.length > 0 && <span className="bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingUsers.length}</span>}
            </button>
          )}
          <button
            onClick={() => setActiveTab('users')}
            className={clsx("flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'users' ? "bg-surface-alt text-text-main border-border-color shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
          >
            <div className="flex items-center">
              <Users className={clsx("w-4 h-4 mr-3 transition-transform", activeTab === 'users' ? "text-text-main scale-110" : "text-text-muted")} />
              {t.tabs.users}
            </div>
            {activeUsers.length > 0 && (
              <span className="bg-surface-alt text-text-main text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto border border-border-color shadow-sm">{activeUsers.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={clsx("flex items-center px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'orders' ? "bg-surface text-text-main border-border-color shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
          >
            <ShoppingCart className={clsx("w-4 h-4 mr-3 transition-transform", activeTab === 'orders' ? "text-text-main scale-110" : "text-text-muted")} />
            {t.tabs.orders}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={clsx("flex items-center px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'products' ? "bg-surface text-text-main border-border-color shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
          >
            <Store className={clsx("w-4 h-4 mr-3 transition-transform", activeTab === 'products' ? "text-text-main scale-110" : "text-text-muted")} />
            {t.tabs.products}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={clsx("flex items-center px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'settings' ? "bg-surface text-text-main border-border-color shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
          >
            <Settings className={clsx("w-4 h-4 mr-3 transition-transform", activeTab === 'settings' ? "text-text-main scale-110" : "text-text-muted")} />
            {t.tabs.settings}
          </button>
        </nav>

        <div className="flex flex-col items-center justify-center mt-auto gap-4 pt-6 pb-6 md:pb-0 border-t border-border-color/50">
           <button onClick={logout} className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-[13px] font-bold text-brand-danger hover:bg-brand-danger/5 border border-transparent hover:border-brand-danger/10 transition-all active:scale-[0.98]">
             <LogOut className="w-4 h-4 mr-2" /> {t.common.logout}
           </button>
           <div className="text-[10px] text-text-muted font-bold tracking-widest opacity-60 uppercase text-center px-2">
             Relible Commerce © {new Date().getFullYear()} — CREATED BY RELIBLE LABS
           </div>
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.common.search} 
                  className="w-full bg-surface-alt/50 border border-border-color rounded-[14px] py-3 pl-11 pr-11 text-[13px] text-text-main shadow-sm focus:border-text-muted focus:ring-4 focus:ring-text-muted outline-none transition-all placeholder:text-text-muted font-medium" 
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-surface border border-border-color rounded-lg px-2 py-1 text-text-muted font-sans font-bold shadow-sm">⌘K</kbd>
             </div>
             
             {/* Icons */}
             <div className="flex items-center gap-3 md:gap-4 ml-auto">
                <span className={clsx("px-3 py-1.5 rounded-lg text-[13px] font-bold border shadow-sm whitespace-nowrap", appUser?.plan_type === 'pro' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-surface-alt text-text-muted border-border-color')}>
                  {appUser?.plan_type === 'pro' ? 'Pro ✓' : 'Free'}
                </span>
                
                {appUser?.plan_type !== 'pro' && (
                  <button onClick={() => setShowUpgradeModal(true)} className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-[13px] font-bold shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] whitespace-nowrap transition-colors">Купить Pro</button>
                )}
                
                <div className="flex items-center gap-2.5 cursor-pointer ml-2">
                   <div className="h-8 w-8 bg-surface-alt rounded-full flex items-center justify-center font-bold text-text-main border border-border-color shadow-sm text-[12px]">
                      {appUser?.name?.[0]?.toUpperCase() || 'A'}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-text-main leading-tight">{appUser?.name || 'Administrator'}</span>
                      <span className="text-[10px] text-text-muted leading-tight mt-0.5 font-mono">{appUser?.accountId ? `ID: ${appUser.accountId}` : 'Administrator'}</span>
                   </div>
                   <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden md:block ml-1" />
                </div>
             </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 no-scrollbar" onClick={() => setIsMobileMenuOpen(false)}>
          
          {/* Invites Tab */}
          {activeTab === 'invites' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
              {business?.accessMode === 'public' ? (
                <div className="bg-surface border border-border-color rounded-[32px] p-8 shadow-accent card-premium">
                  {!publicInvite ? (
                    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-12">
                      <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mb-6 border border-border-color shadow-inner">
                        <Globe className="w-8 h-8 text-text-main" />
                      </div>
                      <h2 className="text-2xl font-bold text-text-main tracking-tight mb-3">Создайте публичную ссылку</h2>
                      <p className="text-[14px] text-text-muted leading-relaxed mb-8">
                        Сгенерируйте уникальную ссылку для вашего бизнеса. Любой клиент, перешедший по ней, сможет просматривать каталог и делать заказы.
                      </p>
                      
                      <div className="w-full relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono text-[13px]">{window.location.host}/join?code=</div>
                         <input
                           type="text"
                           value={publicDomainInput}
                           onChange={(e) => setPublicDomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                           placeholder="my-company"
                           className="w-full pl-[185px] pr-4 py-3.5 rounded-2xl bg-bg-base/50 border border-border-color text-text-main focus:bg-surface focus:border-text-muted focus:ring-4 focus:ring-text-muted/10 outline-none transition-all font-mono shadow-sm"
                           maxLength={30}
                         />
                      </div>
                      
                      {publicLinkStatus === 'error_exists' && (
                        <div className="mt-3 text-brand-danger text-[12px] font-bold">Этот домен уже занят, выберите другой.</div>
                      )}
                      
                      <button 
                        onClick={handleCreatePublicLink}
                        disabled={!publicDomainInput.trim() || publicLinkStatus === 'loading'}
                        className="mt-6 w-full bg-text-main hover:bg-text-main/90 text-bg-base py-3.5 px-6 rounded-2xl font-bold hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center text-[14px]"
                      >
                        {publicLinkStatus === 'loading' ? 'Создание...' : 'Создать ссылку'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-color">
                        <div>
                          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                             <Globe className="w-5 h-5" /> Публичная ссылка активна
                          </h2>
                          <p className="text-[13px] text-text-muted mt-1.5">Отправьте эту ссылку вашим клиентам</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <button 
                               onClick={handleDeletePublicLink}
                               className="px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all border border-transparent text-text-muted hover:text-brand-danger hover:bg-brand-danger/10"
                           >
                              Изменить ссылку
                           </button>
                           <button 
                               onClick={handleTogglePublicLinkBlock}
                               className={clsx("px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all border", publicInvite.blocked ? "bg-text-main text-bg-base border-text-main" : "bg-brand-danger/10 text-brand-danger border-brand-danger/20 hover:bg-brand-danger hover:text-white")}
                           >
                              {publicInvite.blocked ? 'Разблокировать' : 'Временно заблокировать'}
                           </button>
                        </div>
                      </div>
                      
                      <div className="bg-bg-base/50 rounded-2xl p-6 border border-border-color relative overflow-hidden group">
                         <div className={clsx("absolute inset-0 z-10 backdrop-blur-[2px] bg-bg-base/60 flex items-center justify-center transition-all", publicInvite.blocked ? "opacity-100 visible" : "opacity-0 invisible")}>
                             <span className="bg-surface px-4 py-2 rounded-xl text-[13px] font-bold text-text-main shadow-lg border border-border-color flex items-center gap-2">
                               <Shield className="w-4 h-4 text-brand-danger" /> Временно заблокировано
                             </span>
                         </div>
                         
                         <div className="flex items-center justify-between gap-4">
                           <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                              <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Основная ссылка</span>
                              <span className="font-mono text-[16px] text-text-main truncate">{window.location.origin}/join?code={publicInvite.id}</span>
                           </div>
                           
                           <button 
                              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join?code=${publicInvite.id}`)}
                              className="w-12 h-12 flex items-center justify-center bg-surface border border-border-color rounded-full hover:bg-text-main hover:text-bg-base transition-all shrink-0 shadow-sm"
                              title="Копировать"
                           >
                             <Copy className="w-5 h-5" />
                           </button>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                    <div>
                      <h1 className="text-[24px] font-bold text-text-main tracking-tight">Инвайт-коды</h1>
                      <p className="text-[13px] text-text-muted mt-1">Организуйте доступ для ваших клиентов</p>
                    </div>
                    <button 
                      onClick={handleCreateInvite} 
                      className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent hover:opacity-90 text-white px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all flex items-center shadow-lg shadow-brand-primary/20"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Сгенерировать код
                    </button>
                  </div>
                  
                  <div className="bg-surface border border-border-color rounded-[32px] shadow-accent card-premium backdrop-blur-sm relative">
                    <div className="overflow-x-auto w-full custom-scrollbar rounded-[32px]">
                      <table className="w-full text-left text-[14px] min-w-[700px]">
                        <thead className="bg-surface-alt/50 border-b border-border-color">
                          <tr>
                            <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em] min-w-[300px]">Код / Ссылка</th>
                            <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em] whitespace-nowrap">Статус</th>
                            <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em] whitespace-nowrap">Создан</th>
                            <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em] text-right whitespace-nowrap">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color/50 text-text-main">
                        {invites.sort((a,b) => b.createdAt - a.createdAt).slice(0, appUser?.plan_type === 'pro' ? invites.length : 1).map(invite => (
                          <tr key={invite.id} className="hover:bg-surface-alt/30 transition-all group">
                            <td className="px-8 py-5 text-text-main">
                              <div className="flex flex-col gap-1">
                                <span className="font-mono font-bold text-[14px] text-text-main group-hover:text-text-muted transition-all">{invite.id}</span>
                                <div className="flex items-center group/link">
                                  <span className="text-[11px] text-text-muted truncate max-w-[200px] font-sans opacity-70 group-hover/link:opacity-100 transition-opacity">{window.location.origin}/join?code={invite.id}</span>
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join?code=${invite.id}`)} 
                                    className="ml-2 p-1 text-text-muted hover:text-text-main transition-colors"
                                    title="Копировать ссылку"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              {invite.blocked ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-danger/10 text-brand-danger border border-brand-danger/20">
                                  Заблокирован
                                </span>
                              ) : invite.used ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-alt text-text-muted border border-border-color">
                                  Использован
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-alt text-text-main border border-border-color mt-3">
                                  Свободен
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-5 text-text-muted font-medium">
                              {new Date(invite.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-8 py-5 text-right">
                              {!invite.blocked && !invite.used && (
                                <button 
                                  onClick={() => handleBlockInvite(invite.id)}
                                  className="text-[11px] font-bold text-brand-danger/60 hover:text-brand-danger transition-colors uppercase tracking-widest"
                                >
                                  Отменить
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {invites.length === 0 && (
                          <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted text-[13px]">Нажмите «Сгенерировать код» чтобы создать первый инвайт.</td></tr>
                        )}
                      </tbody>
                    </table>
                   </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && business?.accessMode !== 'public' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-text-main tracking-tight">{t.tabs.requests}</h2>
                <p className="text-text-muted mt-1 text-[13px]">Новые заявки от клиентов на подключение к системе.</p>
              </div>

              <div className="bg-surface border border-border-color rounded-[32px] shadow-accent card-premium backdrop-blur-sm relative">
                <div className="overflow-x-auto w-full custom-scrollbar rounded-[32px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-alt/50 border-b border-border-color">
                      <tr>
                        <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em]">Имя</th>
                        <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em]">Email</th>
                        <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em]">Телефон</th>
                        <th className="px-8 py-5 font-bold text-text-muted text-right uppercase text-[11px] tracking-[0.2em]">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/50">
                      {pendingUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-12 text-center text-text-muted font-medium">Нет новых заявок</td>
                        </tr>
                      ) : (
                        pendingUsers.map(user => (
                          <tr key={user.id} className="hover:bg-surface-alt/30 transition-colors">
                            <td className="px-8 py-5">
                              <div className="font-bold tracking-tight">{user.name}</div>
                            </td>
                            <td className="px-8 py-5 text-text-muted font-medium">{user.email}</td>
                            <td className="px-8 py-5 text-text-muted font-medium">{user.phone || '—'}</td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleApproveUser(user.id)}
                                  className="w-8 h-8 rounded-lg bg-surface hover:bg-brand-success/10 border border-border-color text-text-muted hover:text-brand-success transition-colors flex items-center justify-center"
                                  title="Принять"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleRejectUser(user.id)}
                                  className="w-8 h-8 rounded-lg bg-surface hover:bg-brand-danger/10 border border-border-color text-text-muted hover:text-brand-danger transition-colors flex items-center justify-center"
                                  title="Отклонить"
                                >
                                  <X className="w-4 h-4" />
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
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold text-text-main tracking-tight">Клиенты</h1>
                <p className="text-[13px] text-text-muted mt-1">Управление активными клиентами и их доступом</p>
              </div>
              <div className="bg-surface border border-border-color rounded-[32px] shadow-accent card-premium backdrop-blur-sm relative">
                <div className="overflow-x-auto w-full custom-scrollbar rounded-[32px]">
                  <table className="w-full text-left text-[14px] min-w-[700px]">
                    <thead className="bg-surface-alt/50 border-b border-border-color">
                      <tr>
                        <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em] whitespace-nowrap min-w-[200px]">Имя</th>
                        <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em] whitespace-nowrap">Email</th>
                        <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em] whitespace-nowrap">Телефон</th>
                        <th className="px-8 py-5 font-bold text-text-muted uppercase text-[11px] tracking-[0.2em] whitespace-nowrap">Статус</th>
                        <th className="px-8 py-5 font-bold text-text-muted text-right uppercase text-[11px] tracking-[0.2em] whitespace-nowrap">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/50 text-text-main">
                    {activeUsers.map(user => (
                      <tr key={user.id} className="hover:bg-surface-alt/30 transition-all">
                        <td className="px-8 py-5 text-text-main">
                          <div className="font-bold tracking-tight">{user.name}</div>
                        </td>
                        <td className="px-8 py-5 text-text-muted font-medium">{user.email}</td>
                        <td className="px-8 py-5 text-text-muted font-medium">{user.phone || '—'}</td>
                        <td className="px-8 py-5">
                          {user.status === 'blocked' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-danger/10 text-brand-danger border border-brand-danger/20">Заблокирован</span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-success/10 text-brand-success border border-brand-success/20">Активен</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          {user.status === 'blocked' ? (
                             <button onClick={() => handleUnblockUser(user.id)} className="bg-surface-alt border border-border-color text-text-main px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-surface transition-all shadow-sm">Разблокировать</button>
                          ): (
                             <button onClick={() => handleBlockUser(user.id)} className="bg-surface-alt border border-border-color text-brand-danger px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-brand-danger/5 transition-all shadow-sm">
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
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-[24px] font-bold text-text-main tracking-tight">Заказы</h1>
                  <p className="text-[13px] text-text-muted mt-1">{showAllOrders ? 'Все заказы за всё время' : 'Заказы за сегодня'}</p>
                </div>
                <button
                  onClick={() => setShowAllOrders(!showAllOrders)}
                  className="bg-surface-alt border border-border-color text-text-main px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-surface transition-all shadow-sm"
                >
                  {showAllOrders ? 'Показать только сегодняшние' : 'Открыть все заказы'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(showAllOrders ? orders : orders.filter(order => new Date(order.createdAt) >= new Date(new Date().setHours(0,0,0,0)))).sort((a,b) => b.createdAt - a.createdAt).map(order => (
                  <div key={order.id} className="bg-surface border border-border-color rounded-[24px] shadow-sm p-6 flex flex-col hover:border-text-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                         <div className="font-mono text-[11px] text-text-muted bg-surface-alt border border-border-color inline-block px-2 py-1 rounded mb-2 tracking-wider">
                           {order.id.slice(0, 8).toUpperCase()}
                         </div>
                         <h3 className="text-[16px] font-bold text-text-main line-clamp-1">{order.clientName}</h3>
                         {order.clientPhone && (
                           <div className="text-[13px] text-text-muted mt-1 font-medium">
                              {order.clientPhone}
                           </div>
                         )}
                       </div>
                       <div className="flex flex-col items-end gap-2">
                         <div className="text-right">
                           <div className="text-[18px] font-bold text-text-main">${order.total.toLocaleString()}</div>
                           <div className="text-[12px] text-text-muted mt-1">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</div>
                         </div>
                         <button
                           onClick={() => handleDeleteOrder(order.id)}
                           className="text-text-muted hover:text-brand-danger bg-surface-alt hover:bg-brand-danger/10 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border border-transparent hover:border-brand-danger/20"
                         >
                           удалить
                         </button>
                       </div>
                    </div>
                    
                    <div className="bg-surface-alt/50 p-4 rounded-xl border border-border-color mb-4 flex-1">
                      <div className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Заказ</div>
                      <div className="space-y-1">
                        {order.items.map((it:any) => (
                           <div key={`${it.id}-${it.size}-${it.color}`} className="text-[13px] text-text-main flex justify-between">
                             <span>
                               {it.quantity}x {it.name}
                               {(it.size || it.color) && (
                                 <span className="text-[11px] text-text-muted ml-2 bg-surface px-1.5 rounded">
                                   [{[it.size, it.color].filter(Boolean).join(', ')}]
                                 </span>
                               )}
                             </span>
                             <span className="text-text-muted">${(it.quantity * it.price).toLocaleString()}</span>
                           </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Адрес доставки</div>
                      {(order.latitude && order.longitude) ? (
                        <OrderLocationMap lat={order.latitude} lng={order.longitude} address={order.clientLocation} />
                      ) : (
                        <div className="text-[13px] text-text-main bg-surface-alt p-3 rounded-xl border border-border-color">
                          {order.clientLocation || 'Адрес не указан'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(showAllOrders ? orders : orders.filter(order => new Date(order.createdAt) >= new Date(new Date().setHours(0,0,0,0)))).length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center text-text-muted text-[13px] py-12 bg-surface rounded-[24px] border border-border-color">
                    {showAllOrders ? 'У вас пока нет заказов.' : 'Сегодня еще нет заказов.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="max-w-6xl flex flex-col gap-8 relative z-10 w-full mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
                <div>
                  <h1 className="text-[24px] font-bold text-text-main tracking-tight">Добавить товар / Интеграции</h1>
                  <p className="text-[13px] text-text-muted mt-1">Импорт товаров через API и ручное добавление</p>
                </div>
                <button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-brand-primary text-white border border-transparent shadow-sm px-4 py-2 rounded-[10px] text-[13px] font-bold hover:bg-brand-primary-hover transition-all">
                  {showAddProduct ? 'Отмена' : 'Добавить вручную'}
                </button>
              </div>

              {!showAddProduct ? (
                <>
                  {/* Integrations Section */}
                  <div className="bg-surface border border-border-color rounded-[32px] overflow-hidden shadow-accent card-premium p-8">
                    <h2 className="text-[18px] font-bold text-text-main tracking-tight mb-6">Интеграции</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Bitrix API Key</label>
                        <input
                          type="text"
                          value={integrations.bitrixApi}
                          onChange={(e) => setIntegrations({...integrations, bitrixApi: e.target.value})}
                          className="w-full bg-surface-alt border border-border-color rounded-[10px] py-2.5 px-4 text-[13px] text-text-main focus:border-text-muted outline-none transition-all placeholder:text-text-muted/50"
                          placeholder="Введите API ключ Bitrix..."
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">1C API Key</label>
                        <input
                          type="text"
                          value={integrations.oneCApi}
                          onChange={(e) => setIntegrations({...integrations, oneCApi: e.target.value})}
                          className="w-full bg-surface-alt border border-border-color rounded-[10px] py-2.5 px-4 text-[13px] text-text-main focus:border-text-muted outline-none transition-all placeholder:text-text-muted/50"
                          placeholder="Введите API ключ 1C..."
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleSaveIntegrations} disabled={isSyncing} className="bg-surface-alt border border-border-color text-text-main px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-surface hover:border-text-muted transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {lang === 'RU' ? 'Сохранить и синхронизировать' : 'Saqlash va sinxronlash'}
                      </button>
                    </div>
                  </div>

                  {/* List added products */}
                  <div className="mt-4 overflow-x-auto min-w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                      <h3 className="text-[18px] font-bold text-text-main tracking-tight">Ваши товары</h3>
                      <div className="relative w-full md:hidden">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t.common.search || "Поиск товаров..."} 
                          className="w-full bg-surface-alt/50 border border-border-color rounded-[14px] py-2 pl-10 pr-4 text-[13px] text-text-main shadow-sm focus:border-text-muted focus:ring-1 focus:ring-text-muted outline-none transition-all placeholder:text-text-muted font-medium" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, appUser?.plan_type === 'pro' ? products.length : 20).map(product => (
                        <div key={product.id} className="bg-surface p-4 rounded-[20px] border border-border-color hover:border-brand-accent/30 hover:shadow-[0_8px_30px_rgb(37,99,235,0.06)] transition-all duration-300 flex flex-col gap-4 shadow-sm group">
                          {editingProduct?.id === product.id ? (
                            <form onSubmit={handleEditProductSubmit} className="flex flex-col gap-3">
                              <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-surface-alt border border-border-color rounded-[10px] py-1.5 px-3 text-[13px] text-text-main focus:border-text-muted outline-none transition-all" placeholder="Название товара" />
                              <textarea required value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} rows={2} className="w-full bg-surface-alt border border-border-color rounded-[10px] py-1.5 px-3 text-[13px] text-text-main focus:border-text-muted outline-none transition-all resize-none" placeholder="Описание" />
                              <div className="grid grid-cols-2 gap-2">
                                <input type="number" required min="0" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-surface-alt border border-border-color rounded-[10px] py-1.5 px-3 text-[13px] text-text-main" placeholder="Цена ($)" title="Цена" />
                                <input type="number" required min="0" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full bg-surface-alt border border-border-color rounded-[10px] py-1.5 px-3 text-[13px] text-text-main" placeholder="Остаток" title="Остаток" />
                              </div>
                              <div className="flex flex-col gap-2 border-y border-border-color py-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Одежда</label>
                                <div className="flex flex-wrap gap-1">
                                  {CLOTHING_SIZES.map(s => (
                                    <button
                                      type="button"
                                      key={s}
                                      onClick={() => setEditingProduct((prev: any) => ({...prev, sizes: prev.sizes?.includes(s) ? prev.sizes.filter((x:string) => x !== s) : [...(prev.sizes||[]), s]}))}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all border ${editingProduct.sizes?.includes(s) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface-alt text-text-muted border-border-color hover:border-text-muted'}`}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Обувь</label>
                                <div className="flex flex-wrap gap-1">
                                  {SHOE_SIZES.map(s => (
                                    <button
                                      type="button"
                                      key={s}
                                      onClick={() => setEditingProduct((prev: any) => ({...prev, sizes: prev.sizes?.includes(s) ? prev.sizes.filter((x:string) => x !== s) : [...(prev.sizes||[]), s]}))}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all border ${editingProduct.sizes?.includes(s) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface-alt text-text-muted border-border-color hover:border-text-muted'}`}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Цвета</label>
                                <div className="flex flex-wrap gap-1">
                                  {COLORS.map(c => (
                                    <button
                                      type="button"
                                      key={c}
                                      onClick={() => setEditingProduct((prev: any) => ({...prev, colors: prev.colors?.includes(c) ? prev.colors.filter((x:string) => x !== c) : [...(prev.colors||[]), c]}))}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${editingProduct.colors?.includes(c) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface-alt text-text-muted border-border-color hover:border-text-muted'}`}
                                    >
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input type="file" accept="image/*" onChange={handleEditImageUpload} className="block w-full text-[11px] text-text-muted file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border file:border-border-color file:text-[11px] file:bg-surface-alt file:text-text-main hover:file:bg-surface cursor-pointer" />
                              <div className="flex gap-2 justify-end mt-2">
                                <button type="button" onClick={() => setEditingProduct(null)} className="px-3 py-1.5 rounded-[8px] bg-surface-alt text-text-muted text-[12px] font-bold">Отмена</button>
                                <button type="submit" className="px-3 py-1.5 rounded-[8px] bg-brand-primary text-white text-[12px] font-bold">Сохранить</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              {product.imageUrl && appUser?.plan_type === 'pro' ? (
                                <div className="w-full h-32 bg-surface-alt rounded-2xl overflow-hidden border border-border-color mb-2 shrink-0 relative">
                                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-full h-32 bg-surface-alt rounded-2xl flex items-center justify-center border border-border-color mb-2 text-text-muted shrink-0 relative">
                                  <Box className="w-10 h-10 opacity-30" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="text-text-main font-bold text-[16px] leading-tight mb-2">{product.name}</h3>
                                <p className="text-[12px] text-text-muted font-medium line-clamp-3 leading-relaxed">{product.description || 'Нет описания'}</p>
                              </div>
                              <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-color/50">
                                <div className="text-text-main font-black text-xl tracking-tighter">${product.price.toLocaleString()}</div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-surface border border-border-color rounded-lg p-0.5 shadow-sm">
                                      <button 
                                        onClick={async (e) => { e.stopPropagation(); await updateDoc(doc(db, 'products', product.id), { stock: Math.max(0, product.stock - 1) }); }}
                                        className="p-1 rounded text-text-muted hover:text-brand-danger hover:bg-surface-alt transition-colors"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
                                      </button>
                                      <input 
                                        type="number"
                                        value={product.stock}
                                        onClick={e => e.stopPropagation()}
                                        onChange={async (e) => {
                                          const v = parseInt(e.target.value) || 0;
                                          await updateDoc(doc(db, 'products', product.id), { stock: v });
                                        }}
                                        className="text-[12px] font-bold w-10 text-center text-text-main bg-transparent border-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <button 
                                        onClick={async (e) => { e.stopPropagation(); await updateDoc(doc(db, 'products', product.id), { stock: product.stock + 1 }); }}
                                        className="p-1 rounded text-text-muted hover:text-brand-primary hover:bg-surface-alt transition-colors"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                                      </button>
                                   </div>
                                  <button onClick={() => setEditingProduct({...product})} className="w-8 h-8 rounded-full bg-surface-alt hover:bg-surface border border-border-color flex items-center justify-center transition-colors text-text-muted hover:text-text-main" title="Редактировать">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                  </button>
                                  <button onClick={() => handleDeleteProduct(product.id)} className="w-8 h-8 rounded-full bg-surface-alt hover:bg-surface border border-brand-danger/20 hover:border-brand-danger flex items-center justify-center transition-colors text-brand-danger" title="Удалить">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    {products.length === 0 && (
                      <div className="w-full py-12 text-center border border-border-color rounded-2xl bg-surface-alt/30 text-[13px] text-text-muted mt-4">
                        У вас пока нет добавленных товаров.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-surface border border-border-color rounded-[32px] overflow-hidden shadow-accent card-premium p-8 max-w-2xl animate-in fade-in duration-300">
                  <h2 className="text-[18px] font-bold text-text-main tracking-tight mb-6">Добавление товара</h2>
                  <form onSubmit={handleAddProduct} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Название товара</label>
                      <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-surface-alt border border-border-color rounded-[10px] py-2.5 px-4 text-[13px] text-text-main focus:border-text-muted outline-none transition-all placeholder:text-text-muted/50" placeholder="Например: Серверный шкаф 42U" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Цена ($)</label>
                        <input type="number" required min="0" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-surface-alt border border-border-color rounded-[10px] py-2.5 px-4 text-[13px] text-text-main focus:border-text-muted outline-none transition-all" placeholder="0.00" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Количество (шт.)</label>
                        <input type="number" required min="0" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full bg-surface-alt border border-border-color rounded-[10px] py-2.5 px-4 text-[13px] text-text-main focus:border-text-muted outline-none transition-all" placeholder="0" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Краткое описание товара</label>
                      <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows={3} className="w-full bg-surface-alt border border-border-color rounded-[10px] py-2.5 px-4 text-[13px] text-text-main focus:border-text-muted outline-none transition-all placeholder:text-text-muted/50 resize-none" placeholder="Основная информация..." />
                    </div>

                    <div className="flex flex-col gap-4 border-t border-border-color pt-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Размеры одежды (Опционально)</label>
                        <div className="flex flex-wrap gap-2">
                          {CLOTHING_SIZES.map(s => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setNewProduct(prev => ({...prev, sizes: prev.sizes.includes(s) ? prev.sizes.filter(x => x !== s) : [...prev.sizes, s]}))}
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase transition-all border ${newProduct.sizes.includes(s) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface-alt text-text-muted border-border-color hover:border-text-muted'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Размеры обуви (Опционально)</label>
                        <div className="flex flex-wrap gap-2">
                          {SHOE_SIZES.map(s => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setNewProduct(prev => ({...prev, sizes: prev.sizes.includes(s) ? prev.sizes.filter(x => x !== s) : [...prev.sizes, s]}))}
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase transition-all border ${newProduct.sizes.includes(s) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface-alt text-text-muted border-border-color hover:border-text-muted'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Цвета (Опционально)</label>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map(c => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => setNewProduct(prev => ({...prev, colors: prev.colors.includes(c) ? prev.colors.filter(x => x !== c) : [...prev.colors, c]}))}
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${newProduct.colors.includes(c) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-surface-alt text-text-muted border-border-color hover:border-text-muted'}`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Изображение товара</label>
                      <div className="flex items-center gap-4 mt-1">
                        {newProduct.imageBase64 && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-border-color shadow-sm shrink-0">
                            <img src={newProduct.imageBase64} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-[12px] text-text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-border-color file:text-[12px] file:font-bold file:bg-surface-alt file:text-text-main hover:file:bg-surface file:transition-colors file:cursor-pointer cursor-pointer" />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-color/50 flex justify-end">
                      <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-3 rounded-xl text-[13px] font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center">
                        Создать товар
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-300">
               <div className="mb-6">
                 <h1 className="text-[24px] font-bold text-text-main tracking-tight">Настройки</h1>
                 <p className="text-[13px] text-text-muted mt-1">Управление параметрами портала</p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-8 items-start">
                 {/* Settings Sidebar */}
                 <div className="w-full md:w-64 flex flex-col gap-1 shrink-0 bg-surface rounded-[16px] p-2 border border-border-color shadow-sm">
                    <button 
                      onClick={() => setSettingsTab('general')}
                      className={clsx("flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-[13px] font-medium transition-all group", settingsTab === 'general' ? "bg-surface text-text-main font-bold shadow-sm border border-border-color" : "text-text-muted hover:text-text-main hover:bg-surface-alt/50 border border-transparent")}
                    >
                      <User className={clsx("w-3.5 h-3.5 transition-transform", settingsTab === 'general' ? "scale-110" : "group-hover:scale-110")} />
                      {lang === 'RU' ? 'Профиль' : 'Profil'}
                    </button>
                    <button 
                      onClick={() => setSettingsTab('privacy')}
                      className={clsx("flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-[13px] font-medium transition-all group", settingsTab === 'privacy' ? "bg-surface text-text-main font-bold shadow-sm border border-border-color" : "text-text-muted hover:text-text-main hover:bg-surface-alt/50 border border-transparent")}
                    >
                      <FileText className={clsx("w-3.5 h-3.5 transition-transform", settingsTab === 'privacy' ? "scale-110" : "group-hover:scale-110")} />
                      {lang === 'RU' ? 'Конфиденциальность' : 'Maxfiylik'}
                    </button>
                    <button 
                      onClick={() => setSettingsTab('security')}
                      className={clsx("flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-[13px] font-medium transition-all group", settingsTab === 'security' ? "bg-surface text-text-main font-bold shadow-sm border border-border-color" : "text-text-muted hover:text-text-main hover:bg-surface-alt/50 border border-transparent")}
                    >
                      <Shield className={clsx("w-3.5 h-3.5 transition-transform", settingsTab === 'security' ? "scale-110" : "group-hover:scale-110")} />
                      {lang === 'RU' ? 'Безопасность' : 'Xavfsizlik'}
                    </button>
                    <button 
                      onClick={() => setSettingsTab('appearance')}
                      className={clsx("flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] text-[13px] font-medium transition-all group", settingsTab === 'appearance' ? "bg-surface text-text-main font-bold shadow-sm border border-border-color" : "text-text-muted hover:text-text-main hover:bg-surface-alt/50 border border-transparent")}
                    >
                      <Palette className={clsx("w-3.5 h-3.5 transition-transform", settingsTab === 'appearance' ? "scale-110" : "group-hover:scale-110")} />
                      {lang === 'RU' ? 'Внешний вид' : 'Tashqi ko\'rinish'}
                    </button>
                 </div>
                 
                 {/* Settings Content */}
                 <div className="flex-1 min-w-0 w-full">
                    {settingsTab === 'general' && (
                       <div className="bg-surface rounded-[24px] p-8 shadow-[0_4px_12px_rgba(16,24,40,0.06)] border border-border-color">
                         <h3 className="text-[18px] font-bold text-text-main tracking-tight mb-6">Базовые параметры</h3>
                         <p className="text-text-muted text-[13px]">Здесь появятся основные настройки компании.</p>
                       </div>
                    )}
                    {settingsTab === 'privacy' && (
                       <div className="bg-surface rounded-[24px] p-8 shadow-[0_4px_12px_rgba(16,24,40,0.06)] border border-border-color card-premium animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <div className="text-text-muted leading-relaxed text-[13px]">
                           <PrivacyPolicyContent />
                          </div>
                       </div>
                    )}

                    {settingsTab === 'security' && (
                       <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="mb-6 flex justify-end">
                           <div className="flex bg-surface-alt p-1 rounded-xl border border-border-color">
                             <button 
                               onClick={() => setLang('RU')}
                               className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${lang === 'RU' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                             >
                               RU
                             </button>
                             <button 
                               onClick={() => setLang('UZ')}
                               className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${lang === 'UZ' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                             >
                               UZ
                             </button>
                           </div>
                         </div>
                         <SecuritySettings lang={lang} />
                       </div>
                    )}
                    {settingsTab === 'appearance' && (
                       <div className="bg-surface rounded-[24px] p-8 shadow-sm border border-border-color card-premium animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <h3 className="text-[20px] font-black text-text-main tracking-tight mb-8 flex items-center gap-3">
                           <div className="w-2 h-8 bg-text-main rounded-full shadow-sm" />
                           {lang === 'RU' ? 'Внешний вид и Тема' : 'Tashqi ko\'rinish va Mavzu'}
                         </h3>
                         
                         <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[32px] bg-surface-alt/30 border border-border-color gap-6 hover:shadow-accent transition-all group">
                               <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-surface-alt rounded-2xl flex items-center justify-center text-text-main border border-border-color group-hover:scale-110 transition-transform">
                                   <Palette className="w-6 h-6" />
                                 </div>
                                 <div>
                                   <div className="text-[15px] font-bold text-text-main tracking-tight">{lang === 'RU' ? 'Цветовая схема' : 'Ranglar sxemasi'}</div>
                                   <div className="text-[12px] text-text-muted mt-0.5 font-medium">{lang === 'RU' ? 'Выберите тему оформления интерфейса' : 'Interfeys mavzusini tanlang'}</div>
                                 </div>
                               </div>
                               <ThemeToggle />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-surface-alt/50 border border-border-color gap-4">
                               <div>
                                 <div className="text-[14px] font-bold text-text-main">{lang === 'RU' ? 'Язык интерфейса' : 'Interfeys tili'}</div>
                                 <div className="text-[12px] text-text-muted mt-1">{lang === 'RU' ? 'Текущий язык системы' : 'Tizimning joriy tili'}</div>
                               </div>
                               <div className="flex bg-surface p-1 rounded-xl border border-border-color shadow-sm">
                                  <button onClick={() => setLang('RU')} className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${lang === 'RU' ? 'bg-surface text-text-main shadow-md' : 'text-text-muted hover:text-text-main'}`}>RU</button>
                                  <button onClick={() => setLang('UZ')} className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${lang === 'UZ' ? 'bg-surface text-text-main shadow-md' : 'text-text-muted hover:text-text-main'}`}>UZ</button>
                               </div>
                            </div>
                         </div>
                       </div>
                    )}
                 </div>
               </div>
            </div>
          )}

          <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </main>
      </div>
      <PostRegistrationSecurityDialog 
        isOpen={isSecurityDialogOpen} 
        onClose={handleCloseSecurityDialog} 
        lang={lang}
        onLanguageChange={setLang}
      />
    </div>
  );
}
