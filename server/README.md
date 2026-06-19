# Lictor push backend

Маленький сервис для пушей на iPhone (и любой веб-клиент), когда приложение закрыто.
Хранит подписки и расписание срабатываний, раз в 20 секунд шлёт подошедшие через Web Push (VAPID).

Эндпоинты:
- `GET /vapid` — публичный VAPID-ключ (его берёт клиент для подписки)
- `POST /subscribe` — `{ deviceId, subscription }`
- `POST /sync` — `{ deviceId, occurrences: [{ fireAt, title, tier }] }`

## Деплой на ghoul

```bash
sudo mkdir -p /opt/lictor-push && cd /opt/lictor-push
# код из этой папки server/ положить сюда (app.py, requirements.txt)

python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt

# ключи VAPID
vapid --gen                       # создаст private_key.pem и public_key.pem
vapid --applicationServerKey      # печатает "Application Server Key = <b64url>"

cp .env.example .env
# в .env: VAPID_PUBLIC_KEY = тот b64url, VAPID_PRIVATE_KEY_FILE=/opt/lictor-push/private_key.pem,
#         VAPID_SUB=mailto:твоя_почта, LICTOR_ORIGIN=https://vincere-mori.github.io

sudo cp lictor-push.service /etc/systemd/system/
sudo systemctl enable --now lictor-push
```

TLS через Caddy (свой сабдомен в `Caddyfile`):

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

## Подключение клиента

В сборку Pages передать адрес бэкенда:

```
VITE_PUSH_API=https://push.твой-домен
```

(repo secret + прокинуть в `npm run build` воркфлоу, либо локальная сборка). Без этой переменной
пуш-фича в приложении просто выключена.
