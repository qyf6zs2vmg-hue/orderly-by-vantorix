import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogOut, Store, ShoppingBag, Archive, Box, Plus, Minus, CreditCard, PackageCheck, ShoppingCart, Settings, Bell, Mail, ChevronDown, Menu, Search, Loader2, CheckCircle, Shield, Globe, User, FileText, Palette, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { SecuritySettings } from '../components/SecuritySettings';
import { PostRegistrationSecurityDialog } from '../components/PostRegistrationSecurityDialog';
import { SecurityIndicator } from '../components/SecurityIndicator';
import { SplashScreen } from '../components/SplashScreen';
import { LanguageToggle } from '../components/LanguageToggle';
import { translations, Language } from '../constants/translations';



export default function ClientDashboard() {
  const { logout, appUser, business } = useAuth();
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'settings'>('shop');
  const [settingsTab, setSettingsTab] = useState<'general' | 'privacy' | 'appearance' | 'security'>('general');
  const [lang, setLang] = useState<Language>('RU');
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);

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
  
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'success'>('idle');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [clientDetails, setClientDetails] = useState({ name: '', phone: '', locationStr: '' });
  
  useEffect(() => {
    if (appUser) {
        setClientDetails({
            name: appUser.name || '',
            phone: appUser.phone || '',
            locationStr: appUser.locationStr || '' // We will save this to user
        });
    }
  }, [appUser]);

  const requestGeolocation = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (pos) => {
                  setClientDetails(prev => ({ ...prev, locationStr: `${pos.coords.latitude}, ${pos.coords.longitude}` }));
              },
              (err) => {
                  console.error(err);
                  alert('Не удалось получить геопозицию. Укажите адрес вручную.');
              }
          );
      } else {
          alert('Геолокация не поддерживается вашим устройством.');
      }
  };

  useEffect(() => {
    if (!appUser?.uid || !appUser?.businessId) return;
    const qOrders = query(collection(db, 'orders'), where('clientId', '==', appUser.uid));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setMyOrders(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    const qProducts = query(collection(db, 'products'), where('businessId', '==', appUser.businessId));
    const unsubProducts = onSnapshot(qProducts, (snap) => {
      setProducts(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, [appUser]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => i.product.id === product.id ? {...i, quantity: i.quantity + 1} : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.product.id === productId ? {...i, quantity: i.quantity - 1} : i);
      }
      return prev.filter(i => i.product.id !== productId);
    });
  };

  const updateQuantity = (product: any, value: string) => {
    const qty = parseInt(value);
    if (isNaN(qty) || qty < 0) return;
    
    const finalQty = Math.min(qty, product.stock);

    setCart(prev => {
      const existingIndex = prev.findIndex(i => i.product.id === product.id);
      
      if (finalQty === 0) {
        return prev.filter(i => i.product.id !== product.id);
      }

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex] = { ...newCart[existingIndex], quantity: finalQty };
        return newCart;
      }

      return [...prev, { product, quantity: finalQty }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const submitOrderWithDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;
    if (!appUser?.businessId) return;

    if (!clientDetails.phone || !clientDetails.locationStr) {
       alert('Пожалуйста, заполните все данные для доставки.');
       return;
    }
    
    setIsDetailsModalOpen(false);
    setCheckoutState('processing');

    const orderItems = cart.map(i => ({
      id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity
    }));

    try {
      // Update user with these details if they don't have them
      if (!appUser.phone || !appUser.locationStr) {
          const updateData: any = {
             phone: clientDetails.phone,
             locationStr: clientDetails.locationStr
          };
          if (!appUser.isAnonymous && clientDetails.name) {
              updateData.name = clientDetails.name;
          }
          await updateDoc(doc(db, 'users', appUser.uid), updateData);
      }

      await addDoc(collection(db, 'orders'), {
        businessId: appUser.businessId,
        clientId: appUser?.uid,
        clientName: clientDetails.name || appUser?.name || 'Anonymous',
        clientPhone: clientDetails.phone || appUser?.phone || '',
        clientLocation: clientDetails.locationStr,
        items: orderItems,
        total: cartTotal,
        status: 'active',
        createdAt: Date.now()
      });

      // Update product stocks
      for (const item of cart) {
        if (item.product.id) {
          try {
            await updateDoc(doc(db, 'products', item.product.id), {
              stock: Math.max(0, item.product.stock - item.quantity)
            });
          } catch (e) {
            console.error("Failed to update stock", e);
          }
        }
      }

      setCart([]);
      
      setCheckoutState('success');
      setTimeout(() => {
        setCheckoutState('idle');
        setActiveTab('shop');
      }, 1500);
    } catch (err) {
      console.error(err);
      setCheckoutState('idle');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!appUser?.businessId) return;

    if (!appUser.phone || !appUser.locationStr) {
       setIsDetailsModalOpen(true);
       return;
    }
    
    await submitOrderWithDetails();
  };

  const handleMarkReceived = async (orderId: string) => {
    await updateDoc(doc(db, 'orders', orderId), { status: 'archived' });
  };

  return (
    <>
      {checkoutState === 'success' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <div className="bg-surface rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl border border-border-color text-center flex flex-col items-center">
               <CheckCircle className="w-16 h-16 text-brand-success mb-4" />
               <h2 className="text-xl font-bold text-text-main mb-2">Ваш заказ успешно оформлен!</h2>
               <p className="text-text-muted text-[13px]">Спасибо за покупку</p>
           </div>
        </div>
      )}

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
              {appUser?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-text-main leading-tight truncate">{appUser?.name || 'Client'}</span>
              <span className="text-[11px] text-text-muted mt-0.5 leading-tight truncate font-medium uppercase tracking-wider">{business ? business.name : "..."}</span>
            </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1 px-1">
          <button
            onClick={() => setActiveTab('shop')}
            className={clsx("flex items-center px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'shop' ? "bg-surface-alt border-border-color text-text-main shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
          >
            <Store className={clsx("w-4 h-4 mr-3 transition-transform", activeTab === 'shop' ? "text-text-main scale-110" : "text-text-muted")} />
            {t.tabs.shop}
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={clsx("flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'orders' ? "bg-surface-alt border-border-color text-text-main shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
          >
            <div className="flex items-center">
              <ShoppingBag className={clsx("w-4 h-4 mr-3 transition-transform", activeTab === 'orders' ? "text-text-main scale-110" : "text-text-muted")} />
              {t.tabs.myOrders}
            </div>
            {myOrders.length > 0 && (
              <span className="bg-surface-alt text-text-main text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto border border-border-color shadow-sm">
                {myOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={clsx("flex items-center px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 border-2", activeTab === 'settings' ? "bg-surface-alt border-border-color text-text-main shadow-sm" : "text-text-muted hover:text-text-main hover:bg-surface-alt border-transparent")}
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
           
           <div className="flex items-center flex-1 md:flex-none">
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-text-muted hover:text-text-main transition-colors mr-3"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                 <Menu className="w-5 h-5" />
              </button>
           </div>
           
           <div className="flex flex-row items-center gap-3 md:gap-4 ml-auto">
                <div className="flex items-center gap-3 cursor-pointer group">
                   <div className="h-9 w-9 bg-surface-alt rounded-xl flex items-center justify-center font-bold text-text-main border border-border-color shadow-sm relative overflow-hidden">
                      {appUser?.name?.[0]?.toUpperCase() || 'C'}
                   </div>
                   <div className="hidden md:flex flex-col">
                     <span className="text-[13px] font-bold text-text-main leading-tight group-hover:text-text-muted transition-colors">{appUser?.name || 'Client'}</span>
                     <span className="text-[10px] text-text-muted leading-tight mt-0.5 font-bold uppercase tracking-wider font-mono">{appUser?.accountId ? `ID: ${appUser.accountId}` : t.common.clientAccount}</span>
                   </div>
                   <ChevronDown className="w-4 h-4 text-text-muted hidden md:block transition-transform group-hover:translate-y-0.5" />
                </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 no-scrollbar" onClick={() => setIsMobileMenuOpen(false)}>
        {activeTab === 'shop' && (
          <div className="max-w-6xl flex flex-col xl:flex-row gap-8 relative z-10 w-full mx-auto animate-in fade-in duration-300">
            <div className="flex-1">
              <div className="mb-6">
                 <h1 className="text-[24px] font-bold text-text-main tracking-tight">Каталог товаров</h1>
                 <p className="text-[13px] text-text-muted mt-1">Выберите необходимое оборудование</p>
              </div>
              <div className="mb-6 relative">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Поиск товаров..." 
                   className="w-full bg-surface border border-border-color rounded-[10px] py-2.5 pl-10 pr-4 text-[13px] text-text-main shadow-sm focus:border-text-muted focus:ring-1 focus:ring-text-muted outline-none transition-all placeholder:text-text-muted card-premium" 
                 />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => {
                  const cartItem = cart.find(i => i.product.id === product.id);
                  const quantity = cartItem ? cartItem.quantity : 0;
                  
                  return (
                    <div key={product.id} className="bg-surface p-6 rounded-[32px] border border-border-color flex flex-col gap-4 shadow-sm group">
                      {product.imageUrl ? (
                        <div className="w-full h-48 bg-surface-alt rounded-2xl overflow-hidden border border-border-color shrink-0">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-surface-alt rounded-2xl flex items-center justify-center border border-border-color text-text-muted shrink-0">
                          <Box className="w-12 h-12 opacity-30" />
                        </div>
                      )}
                      
                      <div className="flex-1 mt-2">
                        <h3 className="text-text-main font-bold text-[18px] leading-tight mb-2">{product.name}</h3>
                        <p className="text-[13px] text-text-muted font-medium line-clamp-3 leading-relaxed">{product.description || 'Нет описания'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border-color/50 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase text-text-muted tracking-widest mb-1">Остаток: {product.stock}</span>
                          <div className="text-text-main font-black text-xl tracking-tighter">
                            ${(product.price || 0).toLocaleString()}
                          </div>
                        </div>
                        
                        {product.stock > 0 ? (
                          <div className="flex items-center gap-1 bg-surface-alt/80 border border-border-color/50 rounded-xl p-1 shadow-inner max-w-[120px]">
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }}
                                className={clsx(
                                  "p-2 rounded-lg transition-all",
                                  quantity > 0 ? "text-text-main hover:bg-surface hover:text-brand-danger shadow-sm" : "text-text-muted cursor-not-allowed opacity-30"
                                )}
                                disabled={quantity === 0}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input 
                                type="number"
                                value={quantity || ''}
                                onChange={(e) => updateQuantity(product, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="0"
                                className="text-[14px] font-bold w-8 text-center text-text-main bg-transparent border-none focus:ring-0 px-0.5"
                              />
                              <button 
                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                className={clsx(
                                  "p-2 rounded-lg transition-all",
                                  quantity >= product.stock ? "text-text-muted cursor-not-allowed opacity-30" : "text-text-main hover:bg-surface hover:text-text-muted shadow-sm"
                                )}
                                disabled={quantity >= product.stock}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                          </div>
                        ) : (
                          <div className="bg-brand-danger/10 text-brand-danger border border-brand-danger/20 px-4 py-2 rounded-xl text-[12px] font-bold shrink-0">
                            Нет в наличии
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {products.length === 0 && (
                  <div className="w-full sm:col-span-2 py-16 text-center border border-border-color rounded-[32px] bg-surface-alt/30 text-[14px] text-text-muted font-medium">
                    Товары не найдены.
                  </div>
                )}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full xl:w-96 bg-surface rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.03)] border border-border-color p-6 flex flex-col h-fit xl:sticky xl:top-6">
              <h2 className="text-[16px] font-bold text-text-main mb-6 flex items-center pb-4 border-b border-border-color">
                <ShoppingCart className="w-[18px] h-[18px] mr-2 text-text-muted opacity-80" />
                Ваша корзина
              </h2>
              
              {cart.length === 0 ? (
                <div className="text-text-muted text-center py-10 flex flex-col items-center gap-3">
                  <ShoppingCart className="w-10 h-10 opacity-20" />
                  <span className="text-[13px] font-medium">Корзина пуста</span>
                </div>
              ) : (
                <div className="flex flex-col flex-1 h-full max-h-fit">
                  <div className="space-y-4 mb-6 custom-scrollbar shrink overflow-y-auto max-h-[45vh] pr-2">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <div className="flex-1 pr-2">
                          <div className="text-[13px] font-semibold text-text-main truncate max-w-[170px] leading-tight">{item.product.name}</div>
                          <div className="text-[11px] text-text-muted mt-1">${item.product.price} / шт</div>
                        </div>
                        <div className="flex items-center gap-1 bg-surface-alt border border-border-color rounded-[6px] p-0.5 shrink-0 shadow-sm">
                          <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-text-muted hover:text-text-main hover:bg-surface rounded transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <input 
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => updateQuantity(item.product, e.target.value)}
                            className="text-[12px] font-bold w-6 text-center text-text-main bg-transparent border-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button 
                            onClick={() => addToCart(item.product)}
                            className={clsx(
                              "p-1 transition-colors rounded",
                              item.quantity >= item.product.stock ? "text-text-muted cursor-not-allowed opacity-50" : "text-text-muted hover:text-text-main hover:bg-surface"
                            )}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border-color pt-4 mb-4 mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-medium text-text-muted">Итого:</span>
                      <span className="text-text-main font-bold text-[20px] tracking-tight">${cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent hover:opacity-90 text-white font-medium py-3 px-4 rounded-[10px] transition-all flex justify-center items-center shadow-lg shadow-brand-primary/20 text-[13px] shrink-0"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Оформить заказ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-4xl relative z-10 w-full mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-[24px] font-bold text-text-main tracking-tight">Мои заказы</h1>
                <p className="text-[13px] text-text-muted mt-1">{showAllOrders ? 'Все ваши покупки' : 'Покупки за сегодня'}</p>
              </div>
               <button
                  onClick={() => setShowAllOrders(!showAllOrders)}
                  className="bg-surface-alt border border-border-color text-text-main px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-surface transition-all shadow-sm"
                >
                  {showAllOrders ? 'Показать только сегодняшние' : 'Открыть все заказы'}
               </button>
            </div>
            <div className="space-y-6">
              {(showAllOrders ? myOrders : myOrders.filter(order => new Date(order.createdAt) >= new Date(new Date().setHours(0,0,0,0)))).sort((a,b) => b.createdAt - a.createdAt).map(order => (
                <div key={order.id} className="bg-surface p-8 rounded-[32px] shadow-sm border border-border-color flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-accent transition-all card-premium-hover backdrop-blur-sm group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1 bg-surface-alt rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-text-muted border border-border-color/50">
                        ORD-{order.id.slice(0,6).toUpperCase()}
                      </div>
                      <span className="text-[12px] text-text-muted font-bold opacity-60">{new Date(order.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="text-[14px] text-text-main mb-4 font-bold flex flex-wrap gap-2">
                      {order.items.map((i:any, idx:number) => (
                        <span key={idx} className="bg-surface text-text-main px-3 py-1 rounded-lg border border-border-color shadow-sm">
                           {i.quantity} × {i.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-[12px] font-black uppercase tracking-widest text-text-muted opacity-40">Total Amount</div>
                    <div className="font-black text-text-main text-[24px] tracking-tighter group-hover:text-text-muted transition-colors">${order.total.toLocaleString()}</div>
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-alt text-text-main border border-border-color shadow-sm mt-1">
                       Delivered
                    </div>
                  </div>
                </div>
              ))}
              {(showAllOrders ? myOrders : myOrders.filter(order => new Date(order.createdAt) >= new Date(new Date().setHours(0,0,0,0)))).length === 0 && (
                <div className="bg-surface p-12 rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.03)] border border-border-color text-center flex flex-col items-center">
                  <PackageCheck className="w-10 h-10 text-text-muted mb-3 opacity-30" />
                  <p className="text-text-muted text-[13px] font-medium">{showAllOrders ? 'У вас пока нет заказов' : 'Сегодня еще нет заказов'}</p>
                </div>
              )}
            </div>
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
                         <h3 className="text-[18px] font-bold text-text-main tracking-tight mb-8">
                           {lang === 'RU' ? 'Внешний вид и Тема' : 'Tashqi ko\'rinish va Mavzu'}
                         </h3>
                         
                         <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[32px] bg-surface-alt/30 border border-border-color gap-6 hover:shadow-accent transition-all group">
                               <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20 group-hover:scale-110 transition-transform">
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
                                  <button onClick={() => setLang('RU')} className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${lang === 'RU' ? 'bg-brand-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}>RU</button>
                                  <button onClick={() => setLang('UZ')} className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${lang === 'UZ' ? 'bg-brand-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}>UZ</button>
                               </div>
                            </div>
                         </div>
                       </div>
                    )}
                 </div>
               </div>
            </div>
        )}
        </main>
      </div>
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-[100dvh]">
          <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)}></div>
          <div className="relative bg-surface border border-border-color rounded-[32px] p-6 max-w-md w-full shadow-accent card-premium">
            <h2 className="text-[20px] font-bold text-text-main mb-2">Данные для доставки</h2>
            <p className="text-[13px] text-text-muted mb-6">Введите {appUser?.isAnonymous ? 'телефон и адрес' : 'ваше имя, телефон и адрес'} (или геолокацию) для оформления заказа. Эти данные сохранятся для будущих покупок.</p>
            
            <form onSubmit={submitOrderWithDetails} className="space-y-4">
              {!appUser?.isAnonymous && (
              <div>
                 <label className="text-[12px] font-bold text-text-main uppercase tracking-wider mb-1 block">Имя</label>
                 <input 
                   type="text" 
                   required
                   value={clientDetails.name}
                   onChange={e => setClientDetails(p => ({...p, name: e.target.value}))}
                   className="w-full pl-4 pr-4 py-3 rounded-xl bg-surface border border-border-color text-text-main focus:border-text-muted outline-none placeholder:text-text-muted/50 text-[13px]"
                   placeholder="Иван Иванов"
                 />
              </div>
              )}
              <div>
                 <label className="text-[12px] font-bold text-text-main uppercase tracking-wider mb-1 block">Телефон</label>
                 <input 
                   type="tel" 
                   required
                   value={clientDetails.phone}
                   onChange={e => setClientDetails(p => ({...p, phone: e.target.value}))}
                   className="w-full pl-4 pr-4 py-3 rounded-xl bg-surface border border-border-color text-text-main focus:border-text-muted outline-none placeholder:text-text-muted/50 text-[13px]"
                   placeholder="+998 90 123 45 67"
                 />
              </div>
              <div>
                 <label className="text-[12px] font-bold text-text-main uppercase tracking-wider mb-1 block">Адрес или Геолокация</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     required
                     value={clientDetails.locationStr}
                     onChange={e => setClientDetails(p => ({...p, locationStr: e.target.value}))}
                     className="w-full bg-surface border border-border-color rounded-xl pl-4 pr-12 py-3 text-[13px] text-text-main focus:border-text-muted outline-none placeholder:text-text-muted/50"
                     placeholder="Введите адрес..."
                   />
                   <button 
                     type="button" 
                     onClick={requestGeolocation}
                     className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-surface-alt rounded-lg transition-colors text-text-main"
                     title="Определить по GPS"
                   >
                     <MapPin className="w-5 h-5 text-text-muted" />
                   </button>
                 </div>
              </div>
              <div className="pt-4 flex gap-3">
                 <button 
                   type="button" 
                   onClick={() => setIsDetailsModalOpen(false)}
                   className="flex-1 px-4 py-3 border border-border-color border-transparent text-text-muted rounded-xl font-bold hover:bg-surface transition-colors/50"
                 >
                   Отмена
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 px-4 py-3 bg-text-main hover:bg-text-main/90 text-bg-base rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center text-[13px]"
                 >
                   Подтвердить
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PostRegistrationSecurityDialog 
        isOpen={isSecurityDialogOpen && !appUser?.isAnonymous} 
        onClose={handleCloseSecurityDialog} 
        lang={lang}
        onLanguageChange={setLang}
      />
    </div>
    </>
  );
}
