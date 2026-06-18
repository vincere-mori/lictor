# Lictor

Агрессивный менеджер напоминаний и задач. Напоминание не отстаёт: эскалация по тирам **MONEO → INSTO → COGO** и адаптивный «Мозг», который учится, когда и как тебя дожимать.

<p>
  <a href="https://vincere-mori.github.io/lictor/">
    <img src="https://img.shields.io/badge/live%20demo-1f6feb?style=for-the-badge&logo=githubpages&logoColor=white" />
  </a>
  <a href="https://github.com/vincere-mori/lictor/releases/latest">
    <img src="https://img.shields.io/badge/download%20apk-1f8f5f?style=for-the-badge&logo=android&logoColor=white" />
  </a>
</p>

## Что внутри

- **Эскалация:** MONEO (тихо) → INSTO (настойчиво, повторы) → COGO (full-screen алярм; отложить только удержанием, не смахнуть).
- **Адаптивный «Мозг»:** считает, в какие часы ты реально закрываешь задачи, и ставит туда напоминания без точного времени.
- **Быстрый ввод языком:** «позвонить маме завтра 18:00 жёстко» → задача, время и свирепость разбираются сами.
- **Свайп:** вправо — выполнено, влево — отложить. Всё локально (IndexedDB), работает офлайн.

## Платформы

- **iPhone** — PWA на GitHub Pages (добавь на экран Домой). Уведомления ограничены вебом iOS.
- **Android** — нативная сборка (Capacitor): локальные уведомления с каналами по тирам, переживают закрытие. APK в релизах.

## Стек

React + TypeScript + Vite, Framer Motion, Dexie, Zustand, PWA. Android — Capacitor. Пуш для iOS — FastAPI на VPS (в планах).

## Разработка

```
npm install
npm run dev
npm test
npm run build
```

APK собирается в CI: тег `vX.Y.Z` → debug-APK в релиз.
