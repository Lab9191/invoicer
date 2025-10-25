# Быстрый старт Invoicer

## 📋 Что нужно сделать сейчас

### 1. Создайте аккаунты (если еще не создали):
- ✅ [Supabase](https://supabase.com) - база данных
- ✅ [Vercel](https://vercel.com) - хостинг

### 2. Настройте Supabase:

```bash
# 1. Создайте проект в Supabase
# 2. Скопируйте Project URL и anon key из Settings → API
# 3. В SQL Editor выполните код из файла: supabase/schema.sql
```

### 3. Настройте локальный проект:

```bash
# ВАЖНО: Переключитесь на Node.js 20
nvm use 20
# или просто: nvm use (автоматически использует версию из .nvmrc)

# Установите зависимости
npm install

# Отредактируйте .env.local и добавьте ваши ключи:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Запустите приложение
npm run dev
```

**Примечание**: Next.js 15 требует Node.js >= 18.18.0. Если увидите ошибку про версию Node.js, смотрите файл `NODE_VERSION.md`.

### 4. Задеплойте на Vercel:

```bash
# Загрузите код в GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Затем:
# 1. Зайдите на vercel.com
# 2. Импортируйте репозиторий
# 3. Добавьте Environment Variables (те же, что в .env.local)
# 4. Нажмите Deploy
```

## 🎯 Что вы получите:

- ✅ Веб-приложение для создания счетов
- ✅ Отдельные рабочие пространства для компании и физлица
- ✅ Экспорт в PDF с QR-кодами
- ✅ Поддержка английского и словацкого языков
- ✅ Автоматический деплой при каждом push в GitHub

## 📚 Подробная инструкция:

Смотрите файл `SETUP.md` для детальных инструкций.

## 🚀 После запуска:

1. Откройте приложение (localhost:3000 или ваш Vercel URL)
2. Выберите Company или Individual
3. Заполните профиль
4. Добавьте клиентов
5. Создайте первый инвойс
6. Экспортируйте в PDF!

## ❓ Нужна помощь?

- Проверьте `SETUP.md` для детальных инструкций
- Откройте Issue на GitHub если что-то не работает
