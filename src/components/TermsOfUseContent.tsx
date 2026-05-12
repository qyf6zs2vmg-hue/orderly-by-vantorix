
import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { ShieldCheck, Lock, Eye, AlertCircle } from 'lucide-react';

interface Props {
  lang?: 'RU' | 'UZ';
}

export const TermsOfUseContent: React.FC<Props> = ({ lang = 'RU' }) => {
  const isRU = lang === 'RU';

  return (
    <div className="space-y-6 text-[13px] leading-relaxed">
      <section>
        <h4 className="flex items-center gap-2 font-bold text-text-main mb-2">
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          {isRU ? 'Только авторизованный доступ' : 'Faqat ruxsat berilgan kirish'}
        </h4>
        <p className="text-text-muted">
          {isRU 
            ? 'Доступ к платформе разрешен только зарегистрированным и проверенным контрагентам. Использование чужих учетных данных строго запрещено.'
            : 'Platformaga kirish faqat ro\'yxatdan o\'tgan va tekshirilgan kontragentlarga ruxsat beriladi. Boshqa shaxslarning hisob ma\'lumotlaridan foydalanish qat\'iyan taqiqlanadi.'}
        </p>
      </section>

      <section>
        <h4 className="flex items-center gap-2 font-bold text-text-main mb-2">
          <Lock className="w-4 h-4 text-brand-primary" />
          {isRU ? 'Конфиденциальность данных' : 'Ma\'lumotlar maxfiyligi'}
        </h4>
        <p className="text-text-muted">
          {isRU
            ? 'Запрещено копирование, сканирование или автоматизированный сбор данных каталогов, цен и складских остатков для передачи третьим лицам.'
            : 'Kataloglar, narxlar va ombor qoldiqlari ma\'lumotlarini uchinchi shaxslarga berish uchun nusxalash, skanerlash yoki avtomatlashtirilgan to\'plash taqiqlanadi.'}
        </p>
      </section>

      <section>
        <h4 className="flex items-center gap-2 font-bold text-text-main mb-2">
          <Eye className="w-4 h-4 text-brand-primary" />
          {isRU ? 'Мониторинг активности' : 'Faoliyat monitoringi'}
        </h4>
        <p className="text-text-muted">
          {isRU
            ? 'Платформа использует системы мониторинга сессий и цифровые водяные знаки для предотвращения утечек коммерческой информации.'
            : 'Platforma tijorat ma\'lumotlari sizib chiqishini oldini olish uchun seanslarni kuzatish tizimlari va raqamli suv belgilaridan foydalanadi.'}
        </p>
      </section>

      <div className="p-4 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-brand-warning shrink-0" />
        <p className="text-brand-warning font-medium">
          {isRU
            ? 'Нарушение данных условий может привести к немедленному аннулированию доступа без права восстановления.'
            : 'Ushbu shartlarning buzilishi qayta tiklash huquqisiz kirishning darhol bekor qilinishiga olib kelishi mumkin.'}
        </p>
      </div>
    </div>
  );
};
