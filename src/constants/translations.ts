
export type Language = 'RU' | 'UZ';

export const translations = {
  RU: {
    common: {
      search: 'Поиск...',
      settings: 'Настройки',
      logout: 'Выйти',
      notifications: 'Уведомления',
      loading: 'Загрузка...',
      save: 'Сохранить',
      cancel: 'Отмена',
      active: 'Активно',
      verified: 'Проверено'
    },
    security: {
      important: 'Важная информация',
      protectedAccess: '🔒 Защищенный бизнес-доступ',
      confidentialMessage: 'Вы получаете доступ к конфиденциальной деловой информации. Передача каталогов, цен, запасов или внутренних данных компании третьим лицам запрещена. Активность на платформе может отслеживаться в целях коммерческой безопасности. Нарушение правил может привести к блокировке аккаунта и ответственности в соответствии с законодательством Республики Узбекистан.',
      acceptTerms: 'Я понимаю и принимаю Условия использования',
      continue: 'Продолжить регистрацию',
      protectedAccount: 'Этот аккаунт предназначен только для авторизованных клиентов. Бизнес-информация может содержать коммерческую тайну. Несанкционированная передача данных третьим лицам может повлечь административную или иную юридическую ответственность.',
      understood: 'Понятно',
      protectedSession: '🛡 Защищенная сессия',
      confidentialB2B: '🔒 Конфиденциальный B2B доступ'
    },
    tabs: {
      invites: 'Приглашения',
      requests: 'Заявки',
      users: 'Пользователи',
      orders: 'Заказы',
      products: 'Товары',
      settings: 'Настройки',
      shop: 'Магазин',
      security: 'Безопасность'
    },
    legal: {
      privacyPolicy: 'Политика конфиденциальности',
      termsOfUse: 'Условия использования',
      infoSharing: 'Политика обмена информацией',
      securityPolicy: 'Политика безопасности',
      activityLogs: 'Журналы активности'
    },
    auth: {
      registerTitle: 'Создание компании',
      companyName: 'Название компании',
      companyPlaceholder: 'Введите название организации',
      contactPerson: 'Контактное лицо',
      contactPlaceholder: 'ФИО руководителя или менеджера',
      password: 'Пароль для входа',
      passwordPlaceholder: 'Минимум 6 символов',
      registering: 'Регистрация...',
      registerButton: 'Зарегистрировать компанию',
      alreadyHaveAccount: 'Компания уже зарегистрирована?',
      loginLink: 'Войти в кабинет',
      moreInfo: 'Подробная информация о сайте'
    },
    logs: {
      activeVerified: 'Активно и Проверено',
      today: 'Сегодня',
      yesterday: 'Вчера',
      authEvent: 'Авторизация в системе',
      profileEvent: 'Изменение настроек профиля',
      catalogEvent: 'Просмотр каталога товаров'
    }
  },
  UZ: {
    common: {
      search: 'Qidiruv...',
      settings: 'Sozlamalar',
      logout: 'Chiqish',
      notifications: 'Bildirishnomalar',
      loading: 'Yuklanmoqda...',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      active: 'Faol',
      verified: 'Tekshirilgan'
    },
    security: {
      important: 'Muhim ma\'lumot',
      protectedAccess: '🔒 Himoyalangan biznes-kirish',
      confidentialMessage: 'Siz maxfiy biznes ma\'lumotlariga kirmoqdasiz. Kataloglar, narxlar, zaxiralar yoki kompaniyaning ichki ma\'lumotlarini uchinchi shaxslarga berish taqiqlanadi. Platformadagi faoliyat tijorat xavfsizligi maqsadida kuzatilishi mumkin. Qoidalarni buzish hisobni bloklashga va O\'zbekiston Respublikasi qonunchiligiga muvofiq javobgarlikka olib kelishi mumkin.',
      acceptTerms: 'Men Foydalanish shartlarini tushunaman va qabul qilaman',
      continue: 'Ro\'yxatdan o\'tishni davom ettirish',
      protectedAccount: 'Ushbu hisob faqat vakolatli mijozlar uchun mo\'ljallangan. Biznes ma\'lumotlari tijorat sirini o\'z ichiga olishi mumkin. Ma\'lumotlarni uchinchi shaxslarga ruxsatsiz berish ma\'muriy yoki boshqa huquqiy javobgarlikka sabab bo\'lishi mumkin.',
      understood: 'Tushunarli',
      protectedSession: '🛡 Himoyalangan seans',
      confidentialB2B: '🔒 Maxfiy B2B kirish'
    },
    tabs: {
      invites: 'Taklifnomalar',
      requests: 'So\'rovlar',
      users: 'Foydalanuvchilar',
      orders: 'Buyurtmalar',
      products: 'Mahsulotlar',
      settings: 'Sozlamalar',
      shop: 'Do\'kon',
      security: 'Xavfsizlik'
    },
    legal: {
      privacyPolicy: 'Maxfiylik siyosati',
      termsOfUse: 'Foydalanish shartlari',
      infoSharing: 'Ma\'lumot almashish siyosati',
      securityPolicy: 'Xavfsizlik siyosati',
      activityLogs: 'Faoliyat jurnallari'
    },
    auth: {
      registerTitle: 'Kompaniya yaratish',
      companyName: 'Kompaniya nomi',
      companyPlaceholder: 'Tashkilot nomini kiriting',
      contactPerson: 'Mas\'ul shaxs',
      contactPlaceholder: 'Rahbar yoki menejerning F.I.Sh.',
      password: 'Kirish paroli',
      passwordPlaceholder: 'Kamida 6 belgi',
      registering: 'Ro\'yxatdan o\'tish...',
      registerButton: 'Kompaniyani ro\'yxatdan o\'tkazish',
      alreadyHaveAccount: 'Kompaniya allaqachon ro\'yxatdan o\'tganmi?',
      loginLink: 'Kabinetga kirish',
      moreInfo: 'Sayt haqida batafsil ma\'lumot'
    },
    logs: {
      activeVerified: 'Faol va Tekshirilgan',
      today: 'Bugun',
      yesterday: 'Kecha',
      authEvent: 'Tizimga kirish',
      profileEvent: 'Profil sozlamalarini o\'zgartirish',
      catalogEvent: 'Mahsulotlar katalogini ko\'rish'
    }
  }
};
