import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { LogOut, Store, ShoppingBag, Archive, Box, Plus, Minus, CreditCard, PackageCheck, ShoppingCart, Shield, Bell, Mail, ChevronDown, Menu, Search, Loader2, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { LogoSVG } from '../components/SharedLogo';

const PRODUCTS = [
  { id: 'p1', name: 'Серверный шкаф 42U', price: 850, icon: Box, stock: 15 },
  { id: 'p2', name: 'Коммутатор 24 порта', price: 320, icon: Box, stock: 42 },
  { id: 'p3', name: 'Патч-корд кат. 6 (100шт)', price: 150, icon: Box, stock: 120 },
  { id: 'p4', name: 'Маршрутизатор Enterprise', price: 1200, icon: Box, stock: 8 },
  { id: 'p5', name: 'ИБП 3000VA', price: 750, icon: Box, stock: 25 },
];

export default function ClientDashboard() {
  const { logout, appUser, business } = useAuth();
  const [activeTab, setActiveTab] = useState<'shop' | 'active' | 'archive' | 'privacy'>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    if (!appUser?.uid) return;
    const q = query(collection(db, 'orders'), where('clientId', '==', appUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setMyOrders(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => unsub();
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!appUser?.businessId) return;
    
    setCheckoutState('processing');

    const orderItems = cart.map(i => ({
      id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity
    }));

    try {
      await addDoc(collection(db, 'orders'), {
        businessId: appUser.businessId,
        clientId: appUser?.uid,
        clientName: appUser?.name,
        items: orderItems,
        total: cartTotal,
        status: 'active',
        createdAt: Date.now()
      });

      setCart([]);
      
      setTimeout(() => {
        setCheckoutState('success');
        setTimeout(() => {
          setCheckoutState('idle');
          setActiveTab('active');
        }, 4500);
      }, 5500);
    } catch (err) {
      console.error(err);
      setCheckoutState('idle');
    }
  };

  const handleMarkReceived = async (orderId: string) => {
    await updateDoc(doc(db, 'orders', orderId), { status: 'archived' });
  };

  return (
    <>
      <AnimatePresence>
        {checkoutState !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-base"
          >
            {checkoutState === 'processing' ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center px-6"
              >
                 <Loader2 className="w-16 h-16 text-brand-primary animate-spin mb-6" />
                 <h2 className="text-2xl font-bold text-text-main tracking-tight mb-2">Оформление заказа...</h2>
                 <p className="text-text-muted">Пожалуйста, подождите, мы обрабатываем ваш запрос.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center px-6"
              >
                 <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: 'spring', bounce: 0.5 }}
                 >
                   <CheckCircle className="w-20 h-20 text-brand-success mb-6" />
                 </motion.div>
                 <h2 className="text-2xl font-bold text-text-main tracking-tight mb-2">Заказ успешно оформлен!</h2>
                 <p className="text-text-muted">Спасибо за ваш заказ. Возвращаемся в дашборд...</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
          <span className="font-bold tracking-widest text-[16px]">Vantorix Orders</span>
        </div>
        <div className="text-[10px] text-text-muted font-medium px-3 mb-8">Build. Automate. Scale.</div>

        {/* User Profile Summary in Sidebar */}
        <div className="flex items-center gap-3 px-3 mb-8">
            <div className="h-10 w-10 bg-surface-alt rounded-full flex items-center justify-center font-bold text-brand-primary border border-border-color shadow-sm object-cover">
              {appUser?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-text-main leading-tight">{appUser?.name || 'Client'}</span>
              <span className="text-[11px] text-text-muted mt-0.5 leading-tight">{business ? business.name : "Загрузка..."}</span>
            </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1 px-1">
          <button
            onClick={() => setActiveTab('shop')}
            className={clsx("flex items-center px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'shop' ? "bg-brand-primary/10 text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-surface-alt")}
          >
            <Store className={clsx("w-4 h-4 mr-3", activeTab === 'shop' ? "text-brand-primary" : "text-text-muted")} />
            Товары (Заказ)
          </button>
          
          <button
            onClick={() => setActiveTab('active')}
            className={clsx("flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'active' ? "bg-brand-primary/10 text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-surface-alt")}
          >
            <div className="flex items-center">
              <ShoppingBag className={clsx("w-4 h-4 mr-3", activeTab === 'active' ? "text-brand-primary" : "text-text-muted")} />
              Мои заказы
            </div>
            {myOrders.filter(o => o.status === 'active').length > 0 && (
              <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-[6px] font-bold ml-auto shadow-sm">
                {myOrders.filter(o => o.status === 'active').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={clsx("flex items-center px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'archive' ? "bg-brand-primary/10 text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-surface-alt")}
          >
            <Archive className={clsx("w-4 h-4 mr-3", activeTab === 'archive' ? "text-brand-primary" : "text-text-muted")} />
            Архив заказов
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={clsx("flex items-center px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", activeTab === 'privacy' ? "bg-brand-primary/10 text-brand-primary" : "text-text-muted hover:text-text-main hover:bg-surface-alt")}
          >
            <Shield className={clsx("w-4 h-4 mr-3", activeTab === 'privacy' ? "text-brand-primary" : "text-text-muted")} />
            Приватность
          </button>
        </nav>
        
        <div className="hidden md:flex flex-col items-center justify-center mt-6 gap-2">
           <button onClick={logout} className="w-full flex justify-center items-center py-2 px-4 rounded-[10px] text-[13px] font-medium text-text-muted hover:text-text-main hover:bg-surface-alt transition-colors">
             <LogOut className="w-4 h-4 mr-2" /> Log out
           </button>
           <div className="text-[10px] text-text-muted font-medium">© {new Date().getFullYear()} Vantorix Labs.</div>
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
           
           <div className="flex flex-row items-center gap-5 ml-auto">
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
                      {appUser?.name?.[0]?.toUpperCase() || 'C'}
                   </div>
                   <div className="hidden md:flex flex-col">
                     <span className="text-[13px] font-semibold text-text-main leading-tight">{appUser?.name || 'Client'}</span>
                     <span className="text-[10px] text-text-muted leading-tight mt-0.5">Client Account</span>
                   </div>
                   <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden md:block ml-1" />
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
                   className="w-full bg-surface border border-border-color rounded-[10px] py-2.5 pl-10 pr-4 text-[13px] text-text-main shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-text-muted" 
                 />
              </div>
              <div className="flex flex-col gap-4">
                {PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => {
                  const cartItem = cart.find(i => i.product.id === product.id);
                  const quantity = cartItem ? cartItem.quantity : 0;
                  
                  return (
                    <div key={product.id} className="bg-surface p-5 rounded-[16px] border border-border-color flex items-center gap-5 hover:bg-surface-alt transition-colors shadow-sm">
                      <div className="w-12 h-12 bg-surface-alt text-brand-primary rounded-[12px] flex items-center justify-center flex-shrink-0 border border-border-color">
                        <product.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-main font-semibold truncate text-[14px]">{product.name}</h3>
                        <p className="text-[12px] text-text-muted mt-0.5">Доступно: <span className="font-medium text-text-main">{product.stock} шт.</span></p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-surface-alt border border-border-color rounded-[8px] p-1 shadow-sm">
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className={clsx(
                            "p-1.5 rounded-md transition-colors",
                            quantity > 0 ? "text-text-main hover:bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)]" : "text-text-muted cursor-not-allowed opacity-50"
                          )}
                          disabled={quantity === 0}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input 
                          type="number"
                          value={quantity || ''}
                          onChange={(e) => updateQuantity(product, e.target.value)}
                          placeholder="0"
                          className="text-[13px] font-semibold w-10 text-center text-text-main bg-transparent border-none focus:ring-0 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                          onClick={() => addToCart(product)}
                          className={clsx(
                            "p-1.5 rounded-md transition-colors",
                            quantity >= product.stock ? "text-text-muted cursor-not-allowed opacity-50" : "text-text-main hover:bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                          )}
                          disabled={quantity >= product.stock}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-text-main font-bold text-[16px] whitespace-nowrap min-w-[80px] text-right tracking-tight">
                        ${product.price}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full xl:w-96 bg-surface rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.03)] border border-border-color p-6 flex flex-col h-fit xl:sticky xl:top-6">
              <h2 className="text-[16px] font-bold text-text-main mb-6 flex items-center pb-4 border-b border-border-color">
                <ShoppingCart className="w-[18px] h-[18px] mr-2 text-brand-primary opacity-80" />
                Ваша корзина
              </h2>
              
              {cart.length === 0 ? (
                <div className="text-text-muted text-center py-10 flex flex-col items-center gap-3">
                  <ShoppingCart className="w-10 h-10 opacity-20" />
                  <span className="text-[13px] font-medium">Корзина пуста</span>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
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
                  
                  <div className="border-t border-border-color pt-6 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-medium text-text-muted">Итого:</span>
                      <span className="text-brand-primary font-bold text-[20px] tracking-tight">${cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent hover:opacity-90 text-white font-medium py-3 px-4 rounded-[10px] transition-all flex justify-center items-center shadow-lg shadow-brand-primary/20 text-[13px]"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Оформить заказ
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="max-w-4xl relative z-10 w-full mx-auto animate-in fade-in duration-300">
            <div className="mb-6">
              <h1 className="text-[24px] font-bold text-text-main tracking-tight">Активные заказы</h1>
              <p className="text-[13px] text-text-muted mt-1">Отслеживайте статус ваших текущих покупок</p>
            </div>
            <div className="space-y-4">
              {myOrders.filter(o => o.status === 'active').sort((a,b) => b.createdAt - a.createdAt).map(order => (
                <div key={order.id} className="bg-surface p-6 rounded-[16px] shadow-sm border border-border-color flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-alt transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[11px] font-semibold px-2 py-0.5 rounded-[6px]">В обработке</span>
                      <span className="text-[12px] text-text-muted">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="text-[13px] text-text-main mb-2 font-medium">
                      {order.items.map((i:any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                    <div className="font-semibold text-text-main text-[14px]">Итого: <span className="text-brand-primary tracking-tight">${order.total.toLocaleString()}</span></div>
                  </div>
                  <button 
                    onClick={() => handleMarkReceived(order.id)}
                    className="bg-surface hover:bg-surface-alt border border-border-color text-text-main py-2.5 px-4 rounded-[10px] font-medium transition-colors flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)] text-[13px]"
                  >
                    <PackageCheck className="w-[18px] h-[18px] mr-2" />
                    Заказ получен
                  </button>
                </div>
              ))}
              {myOrders.filter(o => o.status === 'active').length === 0 && (
                <div className="bg-surface p-12 rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.03)] border border-border-color text-center flex flex-col items-center">
                  <PackageCheck className="w-10 h-10 text-text-muted mb-3 opacity-30" />
                  <p className="text-text-muted text-[13px] font-medium">У вас нет активных заказов</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="max-w-4xl relative z-10 w-full mx-auto animate-in fade-in duration-300">
            <div className="mb-6">
              <h1 className="text-[24px] font-bold text-text-main tracking-tight">История заказов</h1>
              <p className="text-[13px] text-text-muted mt-1">Все ваши завершенные транзакции</p>
            </div>
            <div className="space-y-4">
              {myOrders.filter(o => o.status === 'archived').sort((a,b) => b.createdAt - a.createdAt).map(order => (
                <div key={order.id} className="bg-surface p-6 rounded-[16px] shadow-[0_2px_8px_rgba(16,24,40,0.02)] border border-border-color opacity-90 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-surface-alt text-text-muted border border-border-color text-[11px] font-semibold px-2 py-0.5 rounded-[6px]">Завершен</span>
                    <span className="text-[12px] text-text-muted">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="text-[13px] text-text-muted mb-2 font-medium">
                    {order.items.map((i:any) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                  <div className="font-semibold text-text-main text-[14px]">Итого: <span className="text-text-main tracking-tight">${order.total.toLocaleString()}</span></div>
                </div>
              ))}
              {myOrders.filter(o => o.status === 'archived').length === 0 && (
                <div className="bg-surface p-12 rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.03)] border border-border-color text-center flex flex-col items-center">
                  <Archive className="w-10 h-10 text-text-muted opacity-30 mb-3" />
                  <p className="text-text-muted text-[13px] font-medium">История покупок пуста</p>
                </div>
              )}
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
    </>
  );
}
