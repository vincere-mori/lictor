import json
import os
import sqlite3
import time
from contextlib import closing

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pywebpush import WebPushException, webpush

DB = os.environ.get("LICTOR_DB", "lictor.db")
VAPID_PUBLIC = os.environ["VAPID_PUBLIC_KEY"]
VAPID_PRIVATE_FILE = os.environ.get("VAPID_PRIVATE_KEY_FILE", "private_key.pem")
VAPID_SUB = os.environ.get("VAPID_SUB", "mailto:admin@example.com")
ORIGIN = os.environ.get("LICTOR_ORIGIN", "*")

TITLE = {"MONEO": "Напоминаю", "INSTO": "Пора. Не тяни", "COGO": "Делай. Сейчас"}


def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c


def init():
    with closing(db()) as c:
        c.executescript(
            """
            create table if not exists subs(device text primary key, sub text, ts integer);
            create table if not exists occ(
                id integer primary key autoincrement,
                device text, fire integer, title text, tier text, sent integer default 0
            );
            create index if not exists occ_fire on occ(fire, sent);
            """
        )
        c.commit()


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ORIGIN == "*" else [ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/vapid", response_class=PlainTextResponse)
def vapid():
    return VAPID_PUBLIC


@app.post("/subscribe")
async def subscribe(req: Request):
    b = await req.json()
    device = b["deviceId"]
    sub = json.dumps(b["subscription"])
    with closing(db()) as c:
        c.execute(
            "insert into subs(device, sub, ts) values(?,?,?) "
            "on conflict(device) do update set sub=excluded.sub, ts=excluded.ts",
            (device, sub, int(time.time())),
        )
        c.commit()
    return {"ok": True}


@app.post("/sync")
async def sync(req: Request):
    b = await req.json()
    device = b["deviceId"]
    occ = b.get("occurrences", [])
    with closing(db()) as c:
        c.execute("delete from occ where device=? and sent=0", (device,))
        for o in occ:
            c.execute(
                "insert into occ(device, fire, title, tier) values(?,?,?,?)",
                (device, int(o["fireAt"]), o.get("title", ""), o.get("tier", "INSTO")),
            )
        c.commit()
    return {"ok": True, "scheduled": len(occ)}


def tick():
    now = int(time.time() * 1000)
    with closing(db()) as c:
        rows = c.execute(
            "select o.id, o.device, o.title, o.tier, s.sub from occ o "
            "join subs s on s.device=o.device where o.sent=0 and o.fire<=?",
            (now,),
        ).fetchall()
        for r in rows:
            payload = json.dumps({"title": TITLE.get(r["tier"], "Lictor"), "body": r["title"], "tag": str(r["id"])})
            try:
                webpush(
                    subscription_info=json.loads(r["sub"]),
                    data=payload,
                    vapid_private_key=VAPID_PRIVATE_FILE,
                    vapid_claims={"sub": VAPID_SUB},
                )
            except WebPushException as e:
                if e.response is not None and e.response.status_code in (404, 410):
                    c.execute("delete from subs where device=?", (r["device"],))
            c.execute("update occ set sent=1 where id=?", (r["id"],))
        c.commit()


init()
scheduler = BackgroundScheduler()
scheduler.add_job(tick, "interval", seconds=20, max_instances=1, coalesce=True)
scheduler.start()
