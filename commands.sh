#!/bin/bash

# Invoicer - Полезные команды

echo "📦 Invoicer Commands"
echo "===================="
echo ""

# Проверка, какая команда нужна
case "$1" in
  "install")
    echo "🔧 Установка зависимостей..."
    npm install
    ;;
  
  "dev")
    echo "🚀 Запуск dev сервера..."
    npm run dev
    ;;
  
  "build")
    echo "🏗️  Сборка проекта..."
    npm run build
    ;;
  
  "start")
    echo "▶️  Запуск production сервера..."
    npm run start
    ;;
  
  "lint")
    echo "🔍 Проверка кода..."
    npm run lint
    ;;
  
  "setup-git")
    echo "📝 Настройка Git..."
    git add .
    git commit -m "Initial commit with Invoicer app"
    echo "✅ Изменения закоммичены"
    echo "💡 Теперь выполните: git push origin main"
    ;;
  
  "check-env")
    echo "🔐 Проверка .env.local..."
    if [ -f .env.local ]; then
      echo "✅ Файл .env.local найден"
      echo "Содержимое (без значений):"
      cat .env.local | sed 's/=.*/=***/'
    else
      echo "❌ Файл .env.local не найден!"
      echo "Создайте его на основе .env.example"
    fi
    ;;
  
  "help"|*)
    echo "Доступные команды:"
    echo ""
    echo "  ./commands.sh install      - Установить зависимости"
    echo "  ./commands.sh dev          - Запустить dev сервер"
    echo "  ./commands.sh build        - Собрать проект"
    echo "  ./commands.sh start        - Запустить production"
    echo "  ./commands.sh lint         - Проверить код"
    echo "  ./commands.sh setup-git    - Закоммитить изменения"
    echo "  ./commands.sh check-env    - Проверить .env.local"
    echo ""
    echo "Или используйте npm команды напрямую:"
    echo "  npm run dev    - Development сервер"
    echo "  npm run build  - Production сборка"
    echo "  npm run start  - Production сервер"
    echo "  npm run lint   - Линтинг кода"
    ;;
esac
