import React from 'react';

interface Props {
  lang?: 'RU' | 'UZ';
}

export const PrivacyPolicyContent: React.FC<Props> = ({ lang = 'RU' }) => {
  const isRU = lang === 'RU';

  return (
    <div className="prose prose-sm xl:prose-base max-w-none font-sans" style={{ textWrap: "balance" }}>
      <h3 className="text-lg font-semibold text-text-main mb-2 mt-4">
        {isRU ? '1. Какую информацию мы собираем' : '1. Qanday ma\'lumotlarni yig\'amiz'}
      </h3>
      <p className="mb-4 text-text-muted">
        {isRU
          ? 'Мы собираем персональные данные, необходимые для обеспечения работы сервиса: ваше имя, контактные данные электронную (почту, телефон) и информацию, связанную с профилем бизнеса. Также мы фиксируем данные об активности в приложении (входы, действия) с целью обеспечения безопасности и улучшения сервиса.'
          : 'Biz xizmat ishlashini ta\'minlash uchun zarur bo\'lgan shaxsiy ma\'lumotlarni yig\'amiz: ismingiz, elektron aloqa ma\'lumotlari (pochta, telefon) va biznes profiliga oid ma\'lumotlar. Shuningdek, xavfsizlikni ta\'minlash va xizmatni yaxshilash maqsadida ilovadagi faollik ma\'lumotlarini (kirishlar, harakatlar) qayd etamiz.'}
      </p>

      <h3 className="text-lg font-semibold text-text-main mb-2 mt-4">
        {isRU ? '2. Использование данных' : '2. Ma\'lumotlardan foydalanish'}
      </h3>
      <p className="mb-4 text-text-muted">
        {isRU
          ? 'Ваши данные используются для аутентификации, обработки ваших заказов, оказания услуг поддержки и улучшения бизнес-ориентированного функционала платформы. Кроме того, ваши данные используются для рассылки системных уведомлений.'
          : 'Sizning ma\'lumotlaringiz autentifikatsiya, buyurtmalarni qayta ishlash, qo\'llab-quvvatlash xizmatlarini ko\'rsatish va platformaning biznes funksiyalarini yaxshilash uchun ishlatiladi. Bundan tashqari, tizim bildirishnomalarini yuborish uchun ma\'lumotlaringizdan foydalaniladi.'}
      </p>

      <h3 className="text-lg font-semibold text-text-main mb-2 mt-4">
        {isRU ? '3. Хранение данных (Firebase)' : '3. Ma\'lumotlarni saqlash (Firebase)'}
      </h3>
      <p className="mb-4 text-text-muted">
        {isRU
          ? 'Мы используем сервисы Google Firebase (Firestore, Authentication) для хранения и обработки данных. Google обеспечивает высокий уровень безопасности данных и соответствие международным стандартам. Данные хранятся изолированно с использованием строгих правил доступа (Security Rules).'
          : 'Ma\'lumotlarni saqlash va qayta ishlash uchun Google Firebase (Firestore, Authentication) xizmatlaridan foydalanamiz. Google ma\'lumotlarning yuqori xavfsizligini va xalqaro standartlarga muvofiqligini ta\'minlaydi. Ma\'lumotlar qat\'iy ruxsat qoidalari (Security Rules) yordamida izolyatsiya qilingan holda saqlanadi.'}
      </p>

      <h3 className="text-lg font-semibold text-text-main mb-2 mt-4">
        {isRU ? '4. Правила доступа' : '4. Kirish qoidalari'}
      </h3>
      <p className="mb-4 text-text-muted">
        {isRU
          ? 'Доступ к вашим данным ограничен рамками бизнеса, к которому вы присоединились или который создали. Администраторы бизнеса (Владельцы) могут просматривать информацию о пользователях в рамках своей организации. Мы не передаем данные третьим лицам без вашего явного согласия, за исключением случаев, предусмотренных законодательством.'
          : 'Sizning ma\'lumotlaringizga kirish siz qo\'shilgan yoki yaratgan biznesingiz bilan cheklangan. Biznes administratorlari (Egalari) o\'z tashkiloti doirasida foydalanuvchi ma\'lumotlarini ko\'rishlari mumkin. Qonun hujjatlarida nazarda tutilgan hollar bundan mustasno, aniq roziligingizsiz ma\'lumotlarni uchinchi shaxslarga bermaymiz.'}
      </p>

      <h3 className="text-lg font-semibold text-text-main mb-2 mt-4">
        {isRU ? '5. Безопасность' : '5. Xavfsizlik'}
      </h3>
      <p className="mb-4 text-text-muted">
        {isRU
          ? 'Мы принимаем необходимые организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа. Все соединения осуществляются по защищенному протоколу HTTPS.'
          : 'Shaxsiy ma\'lumotlarni noqonuniy yoki tasodifiy kirishdan himoya qilish uchun zarur tashkiliy hamda texnik choralarni ko\'ramiz. Barcha ulanishlar xavfsiz HTTPS protokoli orqali amalga oshiriladi.'}
      </p>

      <h3 className="text-lg font-semibold text-text-main mb-2 mt-4">
        {isRU ? '6. Ответственность пользователя' : '6. Foydalanuvchi javobgarligi'}
      </h3>
      <p className="mb-4 text-text-muted">
        {isRU
          ? 'Пользователь несет ответственность за сохранность своих учетных данных и паролей. Вы обязуетесь не разглашать информацию о своем аккаунте третьим лицам.'
          : 'Foydalanuvchi o\'z hisob ma\'lumotlari va parollarini xavfsiz saqlash uchun javobgardir. Hisobingiz haqidagi ma\'lumotlarni uchinchi shaxslarga oshkor qilmaslik majburiyatini olasiz.'}
      </p>

      <h3 className="text-lg font-semibold text-text-main mb-2 mt-4">
        {isRU ? '7. Обновление политики' : '7. Siyosatni yangilash'}
      </h3>
      <p className="mb-4 text-text-muted">
        {isRU
          ? 'Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Новая редакция вступает в силу с момента ее публикации на этой странице. Продолжение использования системы после изменений означает согласие с актуальной версией документа.'
          : 'Ushbu Maxfiylik siyosatiga o\'zgartirish kiritish huquqini o\'zimizda qoldiramiz. Yangi tahrir ushbu sahifada e\'lon qilingan kundan boshlab kuchga kiradi. O\'zgartirishlardan keyin tizimdan foydalanishni davom ettirish hujjatning joriy versiyasiga rozilikni anglatadi.'}
      </p>
    </div>
  );
};

export default PrivacyPolicyContent;
