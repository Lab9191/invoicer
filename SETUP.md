# Подробная инструкция по настройке Invoicer

## Шаг 1: Настройка Supabase

### 1.1 Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub
4. Нажмите "New Project"
5. Выберите организацию или создайте новую
6. Заполните поля:
   - **Name**: invoicer (или любое другое имя)
   - **Database Password**: создайте надежный пароль (сохраните его!)
   - **Region**: выберите ближайший регион (например, Europe (Frankfurt))
   - **Pricing Plan**: Free
7. Нажмите "Create new project"
8. Дождитесь создания проекта (1-2 минуты)

### 1.2 Получение ключей

1. После создания проекта перейдите в раздел **Settings** (⚙️ в левом меню)
2. Выберите **API**
3. Найдите следующие значения:
   - **Project URL** (например: `https://abcdefghijklm.supabase.co`)
   - **anon public** key (длинный токен)
4. Скопируйте эти значения

### 1.3 Создание базы данных

1. В левом меню выберите **SQL Editor**
2. Нажмите **New query**
3. Скопируйте весь текст из файла `supabase/schema.sql` вашего проекта
4. Вставьте в редактор SQL
5. Нажмите **Run** или нажмите `Ctrl+Enter` / `Cmd+Enter`
6. Дождитесь выполнения (должно появиться "Success. No rows returned")

### 1.4 Настройка аутентификации (опционально)

1. В левом меню выберите **Authentication** → **Providers**
2. Включите **Email** провайдер
3. В настройках установите:
   - **Enable Email provider**: ON
   - **Confirm email**: OFF (для разработки)
   - **Secure email change**: ON

## Шаг 2: Настройка локального проекта

### 2.1 Обновление .env.local

1. Откройте файл `.env.local` в корне проекта
2. Замените значения на ваши из Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 2.2 Установка зависимостей (если еще не установлены)

```bash
npm install
```

### 2.3 Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## Шаг 3: Настройка Vercel для деплоя

### 3.1 Подготовка GitHub репозитория

1. Убедитесь, что код загружен в GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3.2 Создание проекта в Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "Sign Up" и войдите через GitHub
3. Нажмите "Add New..." → "Project"
4. Найдите свой репозиторий `invoicer` и нажмите "Import"
5. В разделе **Environment Variables** добавьте:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: ваш URL из Supabase
   - Scope: Production, Preview, Development

   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: ваш anon key из Supabase
   - Scope: Production, Preview, Development

6. Нажмите "Deploy"
7. Дождитесь завершения деплоя (2-3 минуты)

### 3.3 Получение токенов для GitHub Actions

Для автоматического деплоя через GitHub Actions нужны дополнительные настройки:

1. В Vercel перейдите в **Settings** → **Tokens**
2. Создайте новый токен:
   - Name: `GitHub Actions`
   - Scope: Full Account
   - Expiration: No Expiration (или выберите срок)
3. Скопируйте токен (сохраните, он больше не будет показан!)

4. Получите Project ID и Org ID:
   - Перейдите в Settings вашего проекта
   - Скопируйте **Project ID**
   - Скопируйте **Team ID** (это Org ID)

5. Добавьте секреты в GitHub:
   - Откройте ваш репозиторий на GitHub
   - Перейдите в **Settings** → **Secrets and variables** → **Actions**
   - Нажмите **New repository secret** и добавьте:
     - `VERCEL_TOKEN`: токен из шага 3
     - `VERCEL_ORG_ID`: Team ID из Vercel
     - `VERCEL_PROJECT_ID`: Project ID из Vercel
     - `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key Supabase

## Шаг 4: Проверка работы

### 4.1 Локальная разработка

1. Откройте [http://localhost:3000](http://localhost:3000)
2. Должна отобразиться стартовая страница с двумя карточками:
   - Company (Компания)
   - Individual (Физическое лицо)

### 4.2 Production

1. После деплоя в Vercel откройте ссылку на ваше приложение (например: `https://invoicer-xyz.vercel.app`)
2. Проверьте доступность приложения

## Шаг 5: Первое использование

### 5.1 Создание профиля компании

1. На главной странице нажмите на карточку **Company**
2. Будет предложено создать профиль
3. Заполните данные:
   - Название компании
   - Адрес, город, индекс
   - IČO (Company ID)
   - DIČ (Tax ID)
   - IČ DPH (VAT ID) - если является плательщиком НДС
   - Банковские реквизиты (IBAN, SWIFT)
   - Контакты (телефон, email)

### 5.2 Добавление клиентов

1. После создания профиля перейдите в раздел **Clients**
2. Нажмите **Add New Client**
3. Заполните данные клиента
4. Сохраните

### 5.3 Создание первого инвойса

1. Перейдите в раздел **Invoices**
2. Нажмите **Create New Invoice**
3. Выберите клиента
4. Заполните даты и детали
5. Добавьте позиции (items)
6. Выберите язык (English/Slovak)
7. Сохраните
8. Нажмите **Export to PDF** для выгрузки

## Возможные проблемы и решения

### База данных не создается

- Убедитесь, что вы скопировали весь SQL код из `schema.sql`
- Проверьте, что нет ошибок в SQL Editor
- Попробуйте выполнить код по частям

### Не работает локально

- Проверьте файл `.env.local`
- Убедитесь, что значения без кавычек
- Перезапустите dev сервер (`npm run dev`)

### Ошибки при деплое в Vercel

- Проверьте Environment Variables в Vercel
- Убедитесь, что Node.js версия 18.18+
- Проверьте логи деплоя в Vercel

### GitHub Actions не работает

- Проверьте все секреты в GitHub Settings
- Убедитесь, что токен Vercel действителен
- Проверьте логи в разделе Actions

## Дополнительная настройка

### Смена языка по умолчанию

В файле `src/middleware.ts` измените `defaultLocale`:

```typescript
export default createMiddleware({
  locales,
  defaultLocale: 'sk', // было 'en'
  localePrefix: 'always'
});
```

### Добавление логотипа компании

В будущих версиях можно будет загружать логотип через Supabase Storage.

## Поддержка

Если у вас возникли вопросы или проблемы:
1. Проверьте эту инструкцию еще раз
2. Откройте Issue на GitHub
3. Проверьте логи в Supabase и Vercel

---

**Важно**: Сохраните все пароли и токены в безопасном месте!
