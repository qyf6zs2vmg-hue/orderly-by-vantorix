import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  CheckCircle2, 
  PackageCheck, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Lock,
  Zap,
  LayoutDashboard,
  MessageSquareX
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem('vantorix_visited', 'true');
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans text-text-main overflow-x-hidden relative selection:bg-brand-primary/30">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute right-[-10%] top-[20%] w-[40vw] h-[40vw] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none opacity-50" />

      {/* Header */}
      <header className="fixed top-0 w-full p-4 lg:px-12 flex justify-between items-center z-50 bg-bg-base/80 backdrop-blur-xl border-b border-border-color/50 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="https://drive.google.com/thumbnail?id=1Zzhxcg4wGu4HCBSmPptAhuTqb-s8yb3D&sz=w1000" alt="Vantorix Logo" className="w-9 h-auto object-contain" />
          <span className="font-black tracking-widest uppercase text-lg text-text-main">Vantorix OMS</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="scale-90 md:scale-100 origin-right">
            <ThemeToggle />
          </div>
          <button 
            onClick={handleStart}
            className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-text-main/10"
          >
            Войти в систему
          </button>
        </div>
      </header>

      <main className="pt-40 pb-24 relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* HERO */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              Next-Gen B2B Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-8">
              Хватит управлять заказами в <span className="text-blue-400">Telegram</span> и <span className="text-green-500">WhatsApp</span>.
            </h1>
            <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto mb-10">
              Единая B2B система заказов для современных компаний. Автоматизируйте продажи, получайте заказы напрямую в CRM и избавьтесь от ручной работы.
            </p>

            <button 
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center gap-3 btn-primary text-white px-8 py-4 rounded-full font-bold text-lg   transition-all scale-100 hover:scale-105"
            >
              <span>Перейти к платформе</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </section>

        {/* COMPARISON CARDS */}
        <section className="grid lg:grid-cols-2 gap-8 mb-32">
          {/* Before: Chaos */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[32px] bg-surface border border-red-500/10 p-8 md:p-12 relative overflow-hidden flex flex-col justify-end min-h-[400px] group hover:border-red-500/30 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent z-0 group-hover:from-red-500/10 transition-colors" />
            <div className="absolute top-8 left-8 font-bold text-red-500 text-[11px] tracking-widest uppercase flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <AlertCircle className="w-4 h-4" />
              Ошибки & Хаос
            </div>

            <div className="relative z-10 flex flex-col gap-4 w-full">
              <div className="bg-surface-alt/80 backdrop-blur-md border border-border-color card-largexl rounded-tl-sm p-4 max-w-[85%] text-[14px] text-text-muted shadow-sm flex items-start gap-3">
                <MessageSquareX className="w-4 h-4 mt-0.5 text-text-muted shrink-0" />
                Привет! Нам нужно 50 коробок артикул 1234.
              </div>
              <div className="bg-surface-alt/50 backdrop-blur-md border border-red-500/20 card-largexl rounded-tr-sm p-4 max-w-[85%] text-[14px] text-text-main self-end shadow-sm">
                Принято. Какая цена была в прошлый раз?
              </div>
              <div className="bg-surface-alt/80 backdrop-blur-md border border-border-color card-largexl rounded-tl-sm p-4 max-w-[85%] text-[14px] text-text-muted shadow-sm">
                Не помню, посмотрите в истории... а еще добавьте позицию 5678, но только 10 штук.
              </div>
            </div>
          </motion.div>

          {/* After: Orderly/Vantorix */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-[32px] bg-surface border border-brand-primary/20 p-8 md:p-12 relative overflow-hidden flex flex-col justify-end min-h-[400px] group hover:border-brand-primary/40 transition-colors shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent z-0 group-hover:from-brand-primary/20 transition-colors" />
            <div className="absolute top-8 left-8 font-bold text-brand-primary text-[11px] tracking-widest uppercase flex items-center gap-2 bg-brand-primary/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-brand-primary/20">
              <PackageCheck className="w-4 h-4" />
              Vantorix OMS
            </div>

            <div className="relative z-10 flex flex-col gap-4 w-full">
              {[9231, 9232, 9233].map((num, i) => (
                 <motion.div 
                  key={num} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="bg-surface/90 backdrop-blur-xl border border-brand-primary/20 card-largexl p-4 flex items-center justify-between shadow-lg"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 card-largel bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                          <PackageCheck className="w-5 h-5" />
                       </div>
                       <div>
                         <div className="text-[15px] font-bold text-text-main">Заказ ORD-{num}</div>
                         <div className="text-[12px] text-text-muted mt-0.5">Получен от дилера</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1.5 rounded-full text-[12px] font-bold border border-[#00E5FF]/20">
                       <CheckCircle2 className="w-4 h-4" />
                       <span className="hidden sm:inline">Синхронизировано в CRM</span>
                    </div>
                 </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* The Problem Section */}
        <section className="text-center max-w-3xl mx-auto mb-32">
           <h2 className="text-3xl md:text-4xl font-bold mb-6">Ручное управление заказами создает хаос в растущем бизнесе.</h2>
           <p className="text-lg text-text-muted leading-relaxed">
              Потерянные сообщения, ошибки при вводе данных менеджером, путаница с актуальными ценами и остатками. Мессенджеры не предназначены для эффективного ведения оптовых продаж.
           </p>
           <div className="mt-12 p-8 card-large bg-surface border border-border-color text-left flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-surface to-surface-alt card-premium">
             <div className="w-16 h-16 card-largexl bg-brand-primary/10 flex items-center justify-center flex-shrink-0 border border-brand-primary/20">
                <LayoutDashboard className="w-8 h-8 text-brand-primary" />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-2">Vantorix OMS централизует все B2B заказы в одной автоматизированной платформе.</h3>
                <p className="text-text-muted text-[15px] leading-relaxed">
                  Освободите время менеджеров, дайте клиентам удобный каталог и исключите ошибки при передаче заказов в вашу 1С или CRM.
                </p>
             </div>
           </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid md:grid-cols-3 gap-6 mb-32">
          {[
            { icon: Lock, title: "Приватная invite-система", desc: "Только верифицированные клиенты получают доступ к платформе и вашему каталогу." },
            { icon: RefreshCw, title: "Каталог реального времени", desc: "Ваши клиенты всегда видят актуальные цены и реальные остатки товаров." },
            { icon: Zap, title: "Автоматическая синхронизация", desc: "Ушли от создания заказа руками. Все заказы падают прямо в 1С/Bitrix24." }
          ].map((f, i) => (
            <div key={i} className="bg-surface p-8 card-largexl border border-border-color hover:border-brand-primary/30 transition-colors">
               <div className="w-12 h-12 card-largel bg-surface-alt text-brand-primary flex items-center justify-center mb-6 border border-border-color">
                  <f.icon className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold mb-3">{f.title}</h3>
               <p className="text-text-muted text-[14px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

         {/* How It Works Steps */}
         <section className="mb-32">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold mb-4">Как это работает</h2>
               <p className="text-text-muted">Простой процесс внедрения и работы.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Подключение", desc: "Бизнес подключает систему к своей 1С или Bitrix24." },
                { step: "2", title: "Приглашения", desc: "Генерация инвайт-ссылок для оптовых клиентов." },
                { step: "3", title: "Заказы", desc: "Клиенты собирают корзину и делают заказы по ссылке." },
                { step: "4", title: "Синхронизация", desc: "Заказы автоматически падают в вашу ERP/CRM." }
              ].map((s, i) => (
                 <div key={i} className="relative bg-surface rounded-[24px] p-6 border border-border-color flex flex-col pt-12">
                   <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-surface border border-border-color font-black text-xl flex items-center justify-center shadow-lg text-brand-primary bg-gradient-to-b from-surface to-surface-alt card-premium">
                     {s.step}
                   </div>
                   <h4 className="text-lg font-bold mb-2">{s.title}</h4>
                   <p className="text-[14px] text-text-muted leading-relaxed">{s.desc}</p>
                 </div>
              ))}
            </div>
         </section>

        {/* Feature Grid Details */}
        <section className="mb-32">
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
             {[
               { title: "Синхронизация каталога", desc: "Цены и остатки обновляются в реальном времени" },
               { title: "Invite-система", desc: "Контролируемый доступ только для ваших контрагентов" },
               { title: "Авто-обработка", desc: "Заказы формируются без участия менеджера" },
               { title: "Интеграция ERP", desc: "Нативная связь с 1С, МойСклад и Bitrix24" },
               { title: "B2B Клиенты", desc: "Управление профилями, балансами и историями заказов" },
               { title: "Градиент статусов", desc: "Трекинг статуса посылки/заказа клиентом онлайн" },
             ].map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                   <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <div>
                     <h4 className="font-bold text-[16px] mb-1">{f.title}</h4>
                     <p className="text-[13px] text-text-muted leading-relaxed">{f.desc}</p>
                   </div>
                </div>
             ))}
           </div>
        </section>

        {/* Target Audience */}
        <section className="text-center bg-gradient-to-b from-surface/50 to-transparent p-12 rounded-[40px] border border-border-color mb-32 relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-primary/5 blur-[100px] pointer-events-none" />
           <div className="relative z-10">
             <h2 className="text-2xl font-bold mb-4">Кому подходит это решение?</h2>
             <p className="text-text-muted mb-10">Создано для компаний, которые вырастают за рамки ручных сообщений и таблиц.</p>
             <div className="flex flex-wrap justify-center gap-4 text-center">
                {['Оптовые поставщики', 'Дистрибьюторы', 'Производители', 'B2B поставщики', 'Крупный e-commerce'].map(tag => (
                   <span key={tag} className="px-5 py-2.5 rounded-full bg-surface border border-border-color text-text-main font-medium shadow-sm hover:border-brand-primary/50 transition-colors card-premium">
                      {tag}
                   </span>
                ))}
             </div>
           </div>
        </section>

        {/* CTA */}
        <section className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">Обновите систему заказов уже сегодня.</h2>
          <p className="text-lg text-text-muted mb-10">Начните автоматизировать операции вашего бизнеса за считанные минуты.</p>
          
          <button 
             onClick={handleStart}
             className="w-full sm:w-auto btn-primary text-white px-10 py-5 rounded-full font-bold text-lg  transition-all hover:-translate-y-1"
          >
             Войти в систему
          </button>
        </section>

        {/* CTA Banner */}
        <section className="rounded-[32px] bg-brand-primary/10 border border-brand-primary/20 p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-brand-secondary/5 to-brand-accent/5" />
           <div className="relative z-10 flex flex-col items-center">
             <h3 className="text-2xl font-bold mb-4 text-white">Готовы к цифровой трансформации?</h3>
             <p className="text-blue-200/70 max-w-2xl text-[15px] mb-8 leading-relaxed">
               Оставьте заявку, чтобы обсудить внедрение наших продуктов или разработку индивидуального решения для вашего бизнеса.
             </p>
             <a 
               href="https://t.me/vantorix" 
               target="_blank"
               rel="noreferrer"
               className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-6 py-3 rounded-full font-bold transition-colors"
             >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
               Связаться в Telegram
             </a>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-color py-12 relative z-10">
         <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
               <div className="flex items-center gap-2">
                  <img src="https://drive.google.com/thumbnail?id=1Zzhxcg4wGu4HCBSmPptAhuTqb-s8yb3D&sz=w1000" alt="Vantorix Logo" className="w-8 h-auto object-contain" />
                  <span className="font-bold tracking-widest uppercase text-sm">Vantorix Labs</span>
               </div>
               <span className="text-[10px] uppercase tracking-[0.3em] bg-clip-text text-transparent btn-primary font-black">Make it possible</span>
            </div>
            
            <div className="flex gap-6 text-[13px] text-text-muted font-medium">
               <span className="hover:text-text-main cursor-pointer transition-colors">Конфиденциальность</span>
               <span className="hover:text-text-main cursor-pointer transition-colors">Условия</span>
            </div>
            
            <div className="text-[13px] text-text-muted">
               © {new Date().getFullYear()} Vantorix Labs. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
}
