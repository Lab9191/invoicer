# Ручная настройка Vercel (если автоматика не работает)

## Если видите "No framework detected"

### Шаг 1: Откройте настройки проекта

1. Зайдите на https://vercel.com
2. Откройте ваш проект `invoicer`
3. Перейдите в **Settings** (вверху)

### Шаг 2: Настройте Framework

1. В левом меню выберите **General**
2. Найдите секцию **Framework Preset**
3. Выберите **Next.js** из выпадающего списка
4. Нажмите **Save**

### Шаг 3: Настройте Build & Development Settings

1. В левом меню выберите **General**
2. Найдите секцию **Build & Development Settings**
3. Убедитесь, что установлено:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (или оставьте пустым)
   - **Output Directory**: `.next` (или оставьте пустым)
   - **Install Command**: `npm install` (или оставьте пустым)
4. Нажмите **Save**

### Шаг 4: Настройте Node.js версию

1. В **Settings** → **General**
2. Найдите **Node.js Version**
3. Выберите **20.x**
4. Нажмите **Save**

### Шаг 5: Проверьте Environment Variables

1. В левом меню выберите **Environment Variables**
2. Убедитесь, что добавлены:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Для каждой переменной выберите все окружения:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Шаг 6: Переделать деплой

1. Перейдите в **Deployments** (вверху)
2. Найдите последний деплой
3. Нажмите три точки справа → **Redeploy**
4. Выберите **Use existing Build Cache** → снимите галочку
5. Нажмите **Redeploy**

### Шаг 7: Проверка

После завершения деплоя:
1. Откройте URL проекта
2. Должна открыться стартовая страница
3. Проверьте `/en` и `/sk` пути

## Альтернативный способ: Переподключение репозитория

Если ничего не помогает:

1. В Vercel Settings → удалите проект
2. Создайте новый проект
3. Импортируйте репозиторий заново
4. Vercel должен автоматически определить Next.js
5. Добавьте Environment Variables
6. Deploy

## Проверка локальной сборки

Перед деплоем убедитесь, что сборка работает локально:

```bash
# Переключитесь на Node.js 20
nvm use 20

# Очистите кеш
rm -rf .next

# Соберите проект
npm run build

# Запустите production сервер
npm run start
```

Если локально всё работает, то проблема точно в настройках Vercel.

## Логи деплоя

Обращайте внимание на секцию в логах:
```
Running "vercel build"
Vercel CLI X.X.X
Installing dependencies...
```

Должно быть:
```
Detected Next.js
```

Если этого нет - следуйте инструкциям выше.

---

**Важно**: После любых изменений в Settings обязательно делайте Redeploy!
