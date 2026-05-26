import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogOut, Store, ShoppingBag, Archive, Box, Plus, Minus, CreditCard, PackageCheck, ShoppingCart, Settings, Bell, Mail, ChevronDown, Menu, Search, Loader2, CheckCircle, Shield, Globe, User, FileText, Palette } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { getTelegramWebApp } from '../lib/telegram';

export default function ClientDashboard() {
  const { logout, appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'shop' | 'cart' | 'orders' | 'settings'>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'success'>('idle');

  const tg = getTelegramWebApp();

  useEffect(() => {
     if (tg) {
         if (activeTab === 'cart' || activeTab === 'orders' || activeTab === 'settings') {
             try { tg.BackButton.show(); } catch(e){}
             const goBack = () => setActiveTab('shop');
             try { tg.BackButton.onClick(goBack); } catch(e){}
             return () => { try { tg.BackButton.offClick(goBack); } catch(e){} }
         } else {
             try { tg.BackButton.hide(); } catch(e){}
         }
     }
  }, [tg, activeTab]);

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
    if (tg) try { tg.HapticFeedback.impactOccurred('light'); } catch(e){}
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
    if (tg) try { tg.HapticFeedback.impactOccurred('light'); } catch(e){}
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
      if (finalQty === 0) return prev.filter(i => i.product.id !== product.id);
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
    
    if (tg) {
       try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
       try { tg.MainButton.showProgress(false); } catch(e){}
    }
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
          setActiveTab('orders');
        }, 1500);
      }, 1500);
    } catch (err) {
      console.error(err);
      if (tg) try{ tg.HapticFeedback.notificationOccurred('error'); } catch(e){}
      setCheckoutState('idle');
    }
  };

  const handleCheckoutRef = useRef(handleCheckout);
  useEffect(() => { handleCheckoutRef.current = handleCheckout; }, [handleCheckout]);

  useEffect(() => {
     if (tg) {
         if (activeTab === 'cart' && cart.length > 0) {
             try { 
               tg.MainButton.setText(`ОФОРМИТЬ ЗАКАЗ ($${cartTotal.toLocaleString()})`);
               tg.MainButton.show(); 
               const cb = () => handleCheckoutRef.current();
               tg.MainButton.onClick(cb);
               return () => {
                 try { tg.MainButton.offClick(cb); } catch(e){}
               }
             } catch(e){}
         } else {
             try { tg.MainButton.hide(); } catch(e){}
         }
     }
  }, [tg, activeTab, cart.length, cartTotal]);

  return (
    <div className="h-screen flex flex-col bg-bg-base font-sans text-text-main overflow-hidden pb-[70px]">
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="flex flex-col items-center"
              >
                <img src="https://drive.google.com/thumbnail?id=1l7HkE_p4K09Xwkv9g9JAiFzfTuViiWvZ&sz=w1000" alt="OrderFlow Logo" crossOrigin="anonymous" className="w-24 h-auto object-contain" />
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
                   <CheckCircle className="w-16 h-16 text-brand-success mb-4" />
                 </motion.div>
                 <h2 className="text-xl font-bold tracking-tight mb-2">Заказ оформлен!</h2>
                 <p className="text-[13px] text-text-muted">Спасибо за покупку</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-8 no-scrollbar scroll-smooth w-full">
        {activeTab === 'shop' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4">
               <h1 className="text-[22px] font-bold tracking-tight">Каталог</h1>
               <div className="relative mt-3">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Поиск товаров..." 
                   className="w-full bg-surface border border-border-color rounded-[14px] py-3 pl-10 pr-4 text-[14px] text-text-main shadow-sm focus:border-text-muted outline-none transition-all placeholder:text-text-muted" 
                 />
               </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => {
                const cartItem = cart.find(i => i.product.id === product.id);
                const quantity = cartItem ? cartItem.quantity : 0;
                
                return (
                  <div key={product.id} className="bg-surface p-3 pr-4 rounded-[18px] border border-border-color flex gap-4 items-center shadow-sm">
                    {product.imageUrl ? (
                      <div className="w-[84px] h-[84px] bg-surface-alt rounded-xl overflow-hidden shrink-0 border border-border-color/50">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-[84px] h-[84px] bg-surface-alt rounded-xl flex items-center justify-center text-text-muted shrink-0 border border-border-color/50">
                        <Box className="w-6 h-6 opacity-30" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-bold text-[14px] leading-snug line-clamp-2">{product.name}</h3>
                      <div className="font-black text-[15px] mt-1 tracking-tight">
                        ${(product.price || 0).toLocaleString()}
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                         <span className="text-[10px] uppercase font-bold text-text-muted">В наличии: {product.stock}</span>
                         {product.stock > 0 ? (
                           <div className="flex items-center gap-2">
                              {quantity > 0 && (
                                <>
                                  <button onClick={() => removeFromCart(product.id)} className="w-7 h-7 bg-surface-alt rounded-full flex justify-center items-center text-text-main border border-border-color/50">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-[13px] font-bold w-4 text-center">{quantity}</span>
                                </>
                              )}
                              <button onClick={() => addToCart(product)} className="w-7 h-7 bg-surface-alt text-text-main rounded-full flex justify-center items-center shadow-sm border border-border-color/50">
                                <Plus className="w-3 h-3" />
                              </button>
                           </div>
                         ) : (
                           <span className="text-[10px] uppercase font-bold text-brand-danger bg-brand-danger/10 px-2 py-0.5 rounded-md">Нет в наличии</span>
                         )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
            <h1 className="text-[22px] font-bold tracking-tight mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-3" />
              Корзина
            </h1>
            
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-60">
                 <ShoppingCart className="w-12 h-12 mb-3" />
                 <span className="text-[14px] font-medium">Корзина пуста</span>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto w-full">
                  {cart.map(item => (
                    <div key={item.product.id} className="bg-surface p-3 rounded-[16px] border border-border-color flex items-center justify-between shadow-sm">
                      <div className="flex-1 pr-3 truncate">
                        <div className="text-[13px] font-semibold truncate leading-tight">{item.product.name}</div>
                        <div className="text-[12px] text-text-muted mt-1 font-medium">${item.product.price}</div>
                      </div>
                      <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-alt border border-border-color/50">
                        <button onClick={() => removeFromCart(item.product.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-main bg-surface shadow-sm">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[13px] font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item.product)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-main bg-surface shadow-sm" disabled={item.quantity >= item.product.stock}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 pb-2 mt-auto border-t border-border-color">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[14px] text-text-muted font-medium">К оплате:</span>
                    <span className="text-[24px] font-bold tracking-tight">${cartTotal.toLocaleString()}</span>
                  </div>
                  {!tg && (
                    <button 
                      onClick={handleCheckout}
                      className="w-full mt-3 bg-surface-alt border border-text-main text-text-main font-bold py-3.5 rounded-2xl flex justify-center items-center shadow-sm active:scale-[0.98] transition-transform text-[15px]"
                    >
                      Оформить заказ
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-[22px] font-bold tracking-tight mb-4">Заказы</h1>
            <div className="space-y-4 w-full">
              {myOrders.sort((a,b) => b.createdAt - a.createdAt).map(order => (
                <div key={order.id} className="bg-surface p-4 rounded-[20px] shadow-sm border border-border-color flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] px-2 py-1 bg-surface-alt rounded-lg font-black uppercase tracking-wider border border-border-color/50">
                      #{order.id.slice(0,6)}
                    </span>
                    <span className="text-[11px] text-text-muted font-bold opacity-70">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3 bg-surface-alt/50 p-2 rounded-xl">
                    {order.items.map((i:any, idx:number) => (
                      <div key={idx} className="flex justify-between text-[12px] font-medium">
                        <span className="truncate pr-2">{i.name}</span>
                        <span className="shrink-0 text-text-muted">x{i.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-border-color/50">
                    <span className="text-[14px] font-bold">${order.total.toLocaleString()}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wide opacity-50">
                      В обработке
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col">
            <h1 className="text-[22px] font-bold tracking-tight mb-6">Профиль</h1>
            <div className="bg-surface p-5 rounded-[24px] border border-border-color flex items-center gap-4 mb-6 shadow-sm">
                <div className="w-12 h-12 bg-surface-alt rounded-full flex items-center justify-center font-bold text-[18px] border border-border-color/50">
                  {appUser?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-[16px] font-bold leading-tight">{appUser?.name || 'Пользователь'}</div>
                  <div className="text-[12px] text-text-muted font-medium uppercase tracking-wide mt-1">Клиент</div>
                </div>
            </div>
            <div className="space-y-2 mb-8">
               <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border-color shadow-sm">
                 <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5" />
                    <span className="text-[14px] font-medium">Тема</span>
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
      <nav className="fixed bottom-0 w-full h-[70px] bg-surface border-t border-border-color flex justify-around items-center px-2 z-50">
         <button onClick={() => setActiveTab('shop')} className={clsx("flex flex-col items-center justify-center w-16 h-full transition-colors", activeTab === 'shop' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <Store className="w-6 h-6 mb-1" />
           <span className="text-[10px] font-bold">Каталог</span>
         </button>
         <button onClick={() => setActiveTab('cart')} className={clsx("relative flex flex-col items-center justify-center w-16 h-full transition-colors", activeTab === 'cart' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <div className="relative">
             <ShoppingCart className="w-6 h-6 mb-1" />
             {cart.length > 0 && (
               <span className="absolute -top-1 -right-2 bg-text-main text-bg-base text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface min-w-[18px] text-center flex items-center justify-center h-[18px]">
                 {cart.length}
               </span>
             )}
           </div>
           <span className="text-[10px] font-bold">Корзина</span>
         </button>
         <button onClick={() => setActiveTab('orders')} className={clsx("flex flex-col items-center justify-center w-16 h-full transition-colors", activeTab === 'orders' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <ShoppingBag className="w-6 h-6 mb-1" />
           <span className="text-[10px] font-bold">Заказы</span>
         </button>
         <button onClick={() => setActiveTab('settings')} className={clsx("flex flex-col items-center justify-center w-16 h-full transition-colors", activeTab === 'settings' ? "text-text-main" : "text-text-muted hover:text-text-main")}>
           <User className="w-6 h-6 mb-1" />
           <span className="text-[10px] font-bold">Профиль</span>
         </button>
      </nav>
    </div>
  );
}
