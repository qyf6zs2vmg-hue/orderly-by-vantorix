
import React from 'react';
import { Database, Share2, Fingerprint, FileCode } from 'lucide-react';

interface Props {
  lang?: 'RU' | 'UZ';
}

export const InfoSharingPolicyContent: React.FC<Props> = ({ lang = 'RU' }) => {
  const isRU = lang === 'RU';

  return (
    <div className="space-y-6 text-[13px] leading-relaxed">
      <section>
        <h4 className="flex items-center gap-2 font-bold text-text-main mb-2">
          <Database className="w-4 h-4 text-brand-primary" />
          {isRU ? 'Классификация информации' : 'Ma\'lumotlar tasnifi'}
        </h4>
        <p className="text-text-muted">
          {isRU 
            ? 'Вся информация о прайс-листах, персональных скидках и доступности товара является строго конфиденциальной (Commercial Internal).'
            : 'Narxlar ro\'yxati, shaxsiy chegirmalar va tovarlar mavjudligi to\'g\'risidagi barcha ma\'lumotlar qat\'iy maxfiydir (Commercial Internal).'}
        </p>
      </section>

      <section>
        <h4 className="flex items-center gap-2 font-bold text-text-main mb-2">
          <Share2 className="w-4 h-4 text-brand-primary" />
          {isRU ? 'Ограничения на передачу' : 'Uzatish cheklovlari'}
        </h4>
        <p className="text-text-muted">
          {isRU
            ? 'Передача скриншотов, выгрузок и прямых ссылок на закрытые разделы сайта внешним агрегаторам или конкурентам запрещена.'
            : 'Skrinshotlar, yuklab olishlar va saytning yopiq bo\'limlariga to\'g\'ridan-to\'g\'ri havolalarni tashqi agregatorlarga yoki raqobatchilarga berish taqiqlanadi.'}
        </p>
      </section>

      <section>
        <h4 className="flex items-center gap-2 font-bold text-text-main mb-2">
          <Fingerprint className="w-4 h-4 text-brand-primary" />
          {isRU ? 'Цифровая идентификация' : 'Raqamli identifikatsiya'}
        </h4>
        <p className="text-text-muted">
          {isRU
            ? 'Каждая сессия маркируется уникальным идентификатором безопасности. В случае утечки данных, источник будет определен автоматически.'
            : 'Har bir seans noyob xavfsizlik identifikatori bilan belgilanadi. Ma\'lumotlar sizib chiqqan taqdirda, manba avtomatik ravishda aniqlanadi.'}
        </p>
      </section>

      <section>
        <h4 className="flex items-center gap-2 font-bold text-text-main mb-2">
          <FileCode className="w-4 h-4 text-brand-primary" />
          {isRU ? 'Использование API' : 'API dan foydalanish'}
        </h4>
        <p className="text-text-muted">
          {isRU
            ? 'Любое программное взаимодействие с платформой (API) разрешается только после официального запроса и подписания соглашения об обмене данными.'
            : 'Platforma (API) bilan har qanday dasturiy o\'zaro aloqaga faqat rasmiy so\'rovdan so\'ng va ma\'lumotlar almashish to\'g\'risidagi shartnoma imzolangandan keyin ruxsat beriladi.'}
        </p>
      </section>
    </div>
  );
};
