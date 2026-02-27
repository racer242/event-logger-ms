/**
 * Справочник типов событий системы Event Logger
 * На основе документа "Event Logger - события системы.docx"
 */

export enum EventCategory {
  // Публичный доступ и ознакомление с контентом
  PAGE_VIEW = 'page_view',
  CONTENT_INTERACTION = 'content_interaction',
  
  // Регистрация
  REGISTRATION = 'registration',
  
  // Авторизация
  AUTH = 'auth',
  
  // Регистрация чека
  RECEIPT = 'receipt',
  
  // Регистрация кода
  CODE = 'code',
  
  // Участие в активностях
  ACTIVITY = 'activity',
  
  // Получение приза
  PRIZE = 'prize',
  
  // Личный кабинет
  PROFILE = 'profile',
  
  // Повторное участие
  RETURN = 'return',
  
  // Завершение взаимодействия
  EXIT = 'exit',
  
  // Системные ошибки
  SYSTEM = 'system',
  
  // Уведомления
  NOTIFICATION = 'notification',
  
  // Модерация
  MODERATION = 'moderation',
  
  // Персонализация
  PERSONALIZATION = 'personalization',
  
  // A/B тестирование
  AB_TEST = 'ab',
  
  // Когортный анализ
  COHORT = 'cohort',
  
  // Чат-бот
  CHATBOT = 'chatbot',
  
  // Администрирование
  ADMIN = 'admin',
  
  // Безопасность
  SECURITY = 'security',
  
  // Фрод-мониторинг
  FRAUD = 'fraud',
}

export const EventTypes: Record<string, string> = {
  // Публичный доступ (1-16)
  'page_view.home': 'Просмотр главной страницы портала без авторизации',
  'page_view.rules': 'Просмотр правил проведения промо-кампании',
  'page_view.conditions': 'Просмотр условий участия в кампании',
  'page_view.schedule': 'Просмотр графика активностей и сроков кампании',
  'page_view.prizes': 'Просмотр описания призов и наград',
  'page_view.brand': 'Просмотр информации о бренде/производителе',
  'page_view.faq': 'Просмотр раздела часто задаваемых вопросов',
  'page_view.campaign_details': 'Просмотр детального описания промо-кампании',
  'content_interaction.click_link': 'Клик по гиперссылке в публичном контенте',
  'content_interaction.scroll': 'Прокрутка страницы (фиксация уровня прокрутки)',
  'content_interaction.time_spent': 'Время пребывания пользователя на странице',
  'content_interaction.search': 'Использование поиска по контенту портала',
  'content_interaction.share': 'Действие "Поделиться" информацией о кампании',
  'content_interaction.video_play': 'Начало воспроизведения видео в контенте',
  'content_interaction.video_pause': 'Пауза при воспроизведении видео',
  'content_interaction.video_complete': 'Завершение просмотра видео до конца',
  
  // Регистрация (17-35)
  'registration.start': 'Инициация процесса регистрации нового пользователя',
  'registration.step.name': 'Ввод имени пользователя на этапе регистрации',
  'registration.step.phone': 'Ввод номера телефона на этапе регистрации',
  'registration.step.phone.sending': 'Отправка СМС-кода подтверждения на телефон',
  'registration.step.phone.verify': 'Ввод и верификация СМС-кода подтверждения',
  'registration.step.email': 'Ввод адреса электронной почты',
  'registration.step.email.sending': 'Отправка письма с подтверждением на email',
  'registration.step.email.verify': 'Верификация email через ссылку или код',
  'registration.complete': 'Успешное завершение регистрации и создание аккаунта',
  'registration.error.phone.format': 'Ошибка формата введенного номера телефона',
  'registration.error.phone.existing': 'Попытка регистрации с уже существующим телефоном',
  'registration.error.phone.timeout': 'Истечение времени ожидания СМС-кода',
  'registration.error.phone.attempts': 'Превышение лимита попыток ввода СМС-кода',
  'registration.error.email.format': 'Ошибка формата введенного email',
  'registration.error.email.existing': 'Попытка регистрации с уже существующим email',
  'registration.error.email.timeout': 'Истечение времени ожидания подтверждения email',
  'registration.error.email.attempts': 'Превышение лимита попыток подтверждения email',
  'registration.abandon': 'Прерывание процесса регистрации на любом этапе',
  'registration.time_spent': 'Общее время, затраченное на завершение регистрации',
  
  // Авторизация (36-45)
  'auth.start': 'Инициация процесса входа в систему',
  'auth.step.credentials': 'Ввод логина (телефон/email) и пароля',
  'auth.step.sms': 'Запрос и получение одноразового СМС-кода для входа',
  'auth.complete': 'Успешная авторизация и вход в личный кабинет',
  'auth.error.credentials': 'Ошибка неверных учетных данных (логин/пароль)',
  'auth.error.sms': 'Ошибка при верификации СМС-кода',
  'auth.error.attempts': 'Превышение лимита попыток авторизации',
  'auth.forgot_password': 'Инициация процесса восстановления пароля',
  'auth.recover_account': 'Восстановление доступа к аккаунту',
  'auth.time_spent': 'Время, затраченное на процесс авторизации',
  
  // Регистрация чека (46-59)
  'receipt.start': 'Начало процесса регистрации чека покупки',
  'receipt.upload': 'Загрузка фотографии чека пользователем',
  'receipt.quality.check': 'Автоматическая проверка качества изображения чека',
  'receipt.ocr.start': 'Запуск OCR-распознавания данных с чека',
  'receipt.ocr.complete': 'Завершение распознавания и извлечение данных',
  'receipt.validation': 'Валидация распознанных данных (магазин, дата, сумма)',
  'receipt.complete': 'Успешная регистрация чека и подтверждение покупки',
  'receipt.error.format': 'Ошибка формата файла изображения чека',
  'receipt.error.quality': 'Отклонение из-за низкого качества фото чека',
  'receipt.error.ocr': 'Ошибка распознавания текста на чеке',
  'receipt.error.validation': 'Отклонение из-за некорректных данных на чеке',
  'receipt.error.existing': 'Попытка регистрации уже использованного чека',
  'receipt.retrying': 'Повторная попытка загрузки/регистрации чека',
  'receipt.time_spent': 'Время, затраченное на процесс регистрации чека',
  
  // Регистрация кода (60-68)
  'code.start': 'Начало процесса регистрации уникального кода',
  'code.input': 'Ввод кода с упаковки продукта',
  'code.validation': 'Проверка кода в базе данных системы',
  'code.complete': 'Успешная регистрация кода и подтверждение покупки',
  'code.error.format': 'Ошибка формата введенного кода',
  'code.error.existing': 'Попытка использования уже зарегистрированного кода',
  'code.error.invalid': 'Ввод неверного/несуществующего кода',
  'code.retrying': 'Повторная попытка ввода кода',
  'code.time_spent': 'Время, затраченное на процесс регистрации кода',
  
  // Участие в активностях — просмотр и выбор (69-73)
  'activity.list.view': 'Просмотр списка доступных активностей в ЛК',
  'activity.list.filter': 'Применение фильтров к списку активностей',
  'activity.list.search': 'Поиск активностей по ключевым словам',
  'activity.list.sort': 'Сортировка активностей по параметрам',
  'activity.list.time_spent': 'Время пребывания на странице выбора активностей',
  
  // Участие в активностях — мгновенные (74-83)
  'activity.start': 'Начало участия в мгновенной активности (рулетка, квиз)',
  'activity.step': 'Выполнение шага активности (ответ на вопрос, вращение)',
  'activity.complete': 'Завершение активности пользователем',
  'activity.result': 'Получение результата активности (выигрыш/проигрыш)',
  'activity.reward': 'Начисление баллов или мгновенного приза',
  'activity.error': 'Ошибка при выполнении активности',
  'activity.abandon': 'Прерывание активности до завершения',
  'activity.time_spent': 'Время, затраченное на выполнение активности',
  'activity.retry': 'Повторная попытка участия в активности',
  'activity.rate': 'Оценка активности пользователем (1-5 звезд)',
  
  // Участие в активностях — с модерацией (84-96)
  'activity.moderation.start': 'Начало участия в активности с модерацией (конкурс)',
  'activity.moderation.upload': 'Загрузка пользовательского контента (фото, текст)',
  'activity.moderation.review': 'Предварительный просмотр загруженной работы',
  'activity.moderation.submit': 'Отправка работы на модерацию',
  'activity.moderation.waiting': 'Ожидание модерации работы системой/администратором',
  'activity.moderation.approved': 'Одобрение работы модератором',
  'activity.moderation.rejected': 'Отклонение работы модератором',
  'activity.moderation.reason': 'Фиксация причины отклонения работы',
  'activity.moderation.retry': 'Повторная отправка исправленной работы',
  'activity.moderation.result': 'Получение итогового результата после модерации',
  'activity.moderation.reward': 'Начисление награды после успешной модерации',
  'activity.moderation.time_spent': 'Общее время от отправки до получения результата',
  'activity.moderation.rate': 'Оценка активности пользователем',
  
  // Получение электронного приза (97-102)
  'prize.electronic.request': 'Запрос электронного приза (промокод, сертификат)',
  'prize.electronic.sending': 'Отправка электронного приза в выбранный канал',
  'prize.electronic.complete': 'Успешное получение электронного приза',
  'prize.electronic.error': 'Ошибка при отправке электронного приза',
  'prize.electronic.time_spent': 'Время от запроса до получения приза',
  'prize.electronic.open': 'Открытие/активация полученного электронного приза',
  
  // Получение физического приза (103-118)
  'prize.physical.start': 'Начало процесса получения физического приза',
  'prize.physical.form.fill': 'Заполнение формы с данными для доставки',
  'prize.physical.form.submit': 'Отправка заполненной формы',
  'prize.physical.act.sign': 'Подписание электронного акта получения',
  'prize.physical.act.upload': 'Загрузка скана/фото подписанного акта',
  'prize.physical.moderation.waiting': 'Ожидание модерации загруженного акта',
  'prize.physical.moderation.approved': 'Одобрение акта модератором',
  'prize.physical.moderation.rejected': 'Отклонение акта модератором',
  'prize.physical.moderation.reason': 'Фиксация причины отклонения акта',
  'prize.physical.moderation.retry': 'Повторная загрузка исправленного акта',
  'prize.physical.shipping': 'Инициация процесса доставки приза курьером',
  'prize.physical.tracking': 'Отслеживание статуса доставки приза',
  'prize.physical.complete': 'Подтверждение получения физического приза',
  'prize.physical.error': 'Ошибка на любом этапе получения физического приза',
  'prize.physical.time_spent': 'Общее время от запроса до получения приза',
  'prize.physical.rate': 'Оценка процесса получения приза пользователем',
  
  // Личный кабинет (119-125)
  'profile.view': 'Просмотр профиля пользователя в ЛК',
  'profile.edit': 'Редактирование данных профиля',
  'profile.balance.view': 'Просмотр текущего баланса баллов',
  'profile.history.view': 'Просмотр истории участия в активностях',
  'profile.rewards.view': 'Просмотр истории полученных призов',
  'profile.settings.view': 'Просмотр настроек аккаунта',
  'profile.settings.change': 'Изменение настроек аккаунта',
  
  // Повторное участие (126-130)
  'return.start': 'Возврат пользователя в систему после перерыва',
  'return.activity.select': 'Выбор новой активности для участия',
  'return.purchase.repeat': 'Повторная регистрация чека/кода для новой покупки',
  'return.reward.claim': 'Обмен накопленных баллов на призы',
  'return.campaign.join': 'Присоединение к новой промо-кампании',
  'return.time_spent': 'Время, затраченное на повторное взаимодействие',
  
  // Завершение взаимодействия (131-136)
  'exit.start': 'Инициация выхода из системы/кампании',
  'exit.reason': 'Указание причины отказа от участия',
  'exit.complete': 'Успешный выход из системы',
  'exit.unsubscribe': 'Отписка от уведомлений кампании',
  'exit.deactivate': 'Деактивация аккаунта пользователя',
  
  // Системные ошибки (137-146)
  'system.error.validation': 'Ошибка валидации пользовательских данных',
  'system.error.api': 'Ошибка при вызове внешнего API',
  'system.error.db': 'Ошибка доступа к базе данных',
  'system.error.timeout': 'Займаут операции или запроса',
  'system.error.integration': 'Ошибка интеграции с внешней системой',
  'system.error.payment': 'Ошибка при обработке платежа',
  'system.error.delivery': 'Ошибка при обработке доставки приза',
  'system.error.moderation': 'Ошибка в процессе модерации',
  'system.error.chatbot': 'Ошибка работы чат-бота',
  'system.error.critical': 'Критическая ошибка системы, требующая вмешательства',
  
  // Уведомления (147-152)
  'notification.sent': 'Отправка уведомления пользователю',
  'notification.delivered': 'Доставка уведомления до устройства пользователя',
  'notification.opened': 'Открытие пользователем полученного уведомления',
  'notification.action': 'Выполнение действия по уведомлению (клик)',
  'notification.error': 'Ошибка при отправке/доставке уведомления',
  'notification.type': 'Тип уведомления (SMS, Email, Push)',
  
  // Модерация (153-158)
  'moderation.start': 'Начало процесса модерации контента/документа',
  'moderation.approved': 'Одобрение модератором',
  'moderation.rejected': 'Отклонение модератором',
  'moderation.reason': 'Фиксация причины решения модератора',
  'moderation.time_spent': 'Время, затраченное модератором на проверку',
  'moderation.by': 'Идентификатор модератора, выполнившего действие',
  
  // Персонализация (159-162)
  'personalization.view': 'Просмотр персонализированного контента',
  'personalization.click': 'Клик по персонализированному предложению',
  'personalization.convert': 'Конверсия через персонализированное предложение',
  'personalization.rate': 'Оценка релевантности персонализации',
  
  // A/B тестирование (163-166)
  'ab.test.view': 'Просмотр варианта теста (версия A/B)',
  'ab.test.click': 'Клик на элемент в рамках A/B теста',
  'ab.test.convert': 'Конверсия в рамках A/B теста',
  'ab.test.complete': 'Завершение участия в A/B тесте',
  
  // Когортный анализ (167-170)
  'cohort.join': 'Присоединение пользователя к когорте',
  'cohort.activity': 'Активность пользователя в рамках когорты',
  'cohort.retention': 'Фиксация удержания пользователя в когорте',
  'cohort.ltv': 'Расчет пожизненной ценности (LTV) в когорте',
  
  // Чат-бот — общие (171-178)
  'chatbot.start': 'Инициация диалога с чат-ботом',
  'chatbot.message.send': 'Отправка сообщения пользователем чат-боту',
  'chatbot.message.receive': 'Получение сообщения чат-ботом',
  'chatbot.response': 'Отправка ответа чат-ботом пользователю',
  'chatbot.handoff': 'Передача диалога от бота к оператору поддержки',
  'chatbot.rate': 'Оценка полезности ответа чат-бота',
  'chatbot.containment': 'Успешное решение запроса без передачи оператору',
  'chatbot.time_spent': 'Общее время взаимодействия с чат-ботом',
  
  // Чат-бот — персонализация (179-181)
  'chatbot.personalization.suggest': 'Предложение персонализированной активности ботом',
  'chatbot.personalization.click': 'Клик пользователя по предложению бота',
  'chatbot.personalization.convert': 'Конверсия через персонализированное предложение бота',
  
  // Администрирование — активности (182-188)
  'admin.activity.create': 'Создание новой активности администратором',
  'admin.activity.edit': 'Редактирование параметров активности',
  'admin.activity.publish': 'Публикация активности для пользователей',
  'admin.activity.unpublish': 'Снятие активности с публикации',
  'admin.activity.archive': 'Архивация завершенной активности',
  'admin.activity.test': 'Тестирование активности в режиме отладки',
  'admin.activity.delete': 'Удаление активности из системы',
  
  // Администрирование — пользователи (189-193)
  'admin.user.view': 'Просмотр профиля пользователя администратором',
  'admin.user.edit': 'Редактирование данных пользователя',
  'admin.user.ban': 'Блокировка пользователя',
  'admin.user.unban': 'Разблокировка пользователя',
  'admin.user.export': 'Экспорт данных пользователя',
  
  // Администрирование — кампании (194-200)
  'admin.campaign.create': 'Создание новой промо-кампании',
  'admin.campaign.edit': 'Редактирование параметров кампании',
  'admin.campaign.publish': 'Запуск кампании для пользователей',
  'admin.campaign.unpublish': 'Остановка активной кампании',
  'admin.campaign.archive': 'Архивация завершенной кампании',
  'admin.campaign.delete': 'Удаление кампании из системы',
  
  // Безопасность (201-205)
  'security.login': 'Вход администратора в систему управления',
  'security.logout': 'Выход администратора из системы',
  'security.action': 'Выполнение критического действия администратором',
  'security.change': 'Изменение настроек безопасности системы',
  'security.alert': 'Срабатывание системы безопасности (подозрительная активность)',
  'security.review': 'Просмотр логов безопасности администратором',
  
  // Фрод-мониторинг (206-210)
  'fraud.detected': 'Автоматическое обнаружение подозрительной активности',
  'fraud.review': 'Ручная проверка подозрительной активности',
  'fraud.blocked': 'Блокировка выявленной мошеннической активности',
  'fraud.whitelist': 'Добавление пользователя/действия в белый список',
  'fraud.blacklist': 'Добавление пользователя/действия в черный список',
};

/**
 * Проверка валидности типа события
 */
export function isValidEventType(eventType: string): boolean {
  return eventType in EventTypes;
}

/**
 * Получение описания типа события
 */
export function getEventDescription(eventType: string): string | undefined {
  return EventTypes[eventType];
}

/**
 * Получение всех типов событий категории
 */
export function getEventTypesByCategory(category: EventCategory): string[] {
  const prefix = `${category}.`;
  return Object.keys(EventTypes).filter((key) => key.startsWith(prefix));
}
